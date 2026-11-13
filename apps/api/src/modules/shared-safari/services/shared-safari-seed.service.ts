import { randomBytes } from 'node:crypto';

import { ClientApp } from '../../../core/context';
import { ForbiddenException, NotFoundException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { INotificationSeedService } from '../../notification';
import type { ISharedSafariSeedService } from '../contracts/shared-safari-seed-service.contract';
import type {
    SeedComment,
    SeedOutcome,
    SeedRemoval,
    SeedRemovalCounts,
    SeedSafari,
} from '../dto/shared-safari-seed.dto';
import type { SharedSafariSeedRepository } from '../repositories/shared-safari-seed.repository';
import { COVER_FOLDER } from '../types/shared-safari.types';

const RANDOM_BYTES = 6;

const EXTENSION_OF: Readonly<Record<string, string>> = { 'image/png': 'png', 'image/jpeg': 'jpg' };

const coverPath = (safariId: number, fileName: string): string =>
    `${COVER_FOLDER.PARENT}/${safariId}/${COVER_FOLDER.FEATURE}/${fileName}`;

export class SharedSafariSeedService implements ISharedSafariSeedService {
    constructor(
        private readonly db: Database,
        private readonly repository: SharedSafariSeedRepository,
        private readonly auditService: IAuditService,
        private readonly notificationSeedService: INotificationSeedService,
        private readonly fileStorage: IFileStorage,
        private readonly isProduction: boolean,
    ) {}

    async takenSlugs(slugs: readonly string[]): Promise<string[]> {
        this.refuseInProduction();
        return this.repository.takenSlugs(this.db, slugs);
    }

    async seed(safaris: readonly SeedSafari[]): Promise<SeedOutcome[]> {
        this.refuseInProduction();
        const outcomes: SeedOutcome[] = [];
        for (const safari of safaris) {
            const id = await this.seedOne(safari);
            if (id !== null && safari.cover) await this.saveCover(id, safari);
            outcomes.push({ slug: safari.slug, created: id !== null });
        }
        return outcomes;
    }

    async remove(removal: SeedRemoval, confirm: boolean): Promise<SeedRemovalCounts> {
        this.refuseInProduction();
        const event = {
            action: AuditAction.SHARED_SAFARI_SEED_REMOVED,
            entityType: AuditEntity.SHARED_SAFARI,
            details: { slugs: removal.slugs, userIds: removal.userIds },
        } as const;
        const others = await this.repository.otherHosted(this.db, removal.slugs, removal.userIds);
        if (others.length > 0) {
            throw new ForbiddenException(
                `Sample accounts also host safaris that are not sample data: ${others.join(', ')}. Delete those first.`,
                'SEED_ACCOUNT_HOSTS_OTHER_SAFARI',
            );
        }
        try {
            const { counts, covers } = await this.db.transaction(async () => {
                const safaris = await this.repository.seededSafaris(this.db, removal.slugs, removal.userIds);
                const scope = { safariIds: safaris.map((row) => row.id), userIds: removal.userIds };
                const commentIds = await this.repository.commentIds(this.db, scope);
                const notificationScope = {
                    userIds: removal.userIds,
                    entityType: AuditEntity.SHARED_SAFARI,
                    entityIds: scope.safariIds,
                };
                const covers = safaris.flatMap((row) => (row.coverImage ? [coverPath(row.id, row.coverImage)] : []));
                if (!confirm) {
                    return {
                        covers: [],
                        counts: {
                            safaris: safaris.length,
                            members: await this.repository.countMembers(this.db, scope),
                            comments: await this.repository.countComments(this.db, commentIds),
                            flags: await this.repository.countFlags(this.db, commentIds, removal.userIds),
                            notifications: await this.notificationSeedService.count(notificationScope),
                            covers: covers.length,
                        },
                    };
                }
                const counts: SeedRemovalCounts = {
                    flags: await this.repository.deleteFlags(this.db, commentIds, removal.userIds),
                    comments: await this.repository.deleteComments(this.db, commentIds),
                    members: await this.repository.deleteMembers(this.db, scope),
                    notifications: await this.notificationSeedService.remove(notificationScope),
                    safaris: await this.repository.deleteSafaris(this.db, scope.safariIds),
                    covers: covers.length,
                };
                if (counts.safaris > 0 || counts.members > 0 || counts.comments > 0) {
                    await this.auditService.record({ ...event, details: { ...event.details, removed: counts } });
                }
                return { counts, covers };
            });
            for (const path of covers) await this.fileStorage.remove(path).catch(() => undefined);
            return counts;
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.SHARED_SAFARI_SEED_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private async seedOne(safari: SeedSafari): Promise<number | null> {
        const event = {
            action: AuditAction.SHARED_SAFARI_SEEDED,
            entityType: AuditEntity.SHARED_SAFARI,
            details: { slug: safari.slug },
        } as const;
        try {
            return await this.db.transaction(async () => {
                if ((await this.repository.takenSlugs(this.db, [safari.slug])).length > 0) return null;
                const parkId = await this.repository.parkIdByName(this.db, safari.parkName);
                if (parkId === undefined) {
                    throw new NotFoundException(`The park "${safari.parkName}" is not in Parks.`, 'SEED_PARK_NOT_FOUND');
                }
                const id = await this.repository.insertSafari(this.db, safari, parkId);
                for (const member of safari.joined) {
                    await this.repository.insertJoined(this.db, id, member.userId, member.at);
                }
                for (const member of safari.left) {
                    await this.repository.insertLeft(this.db, id, member.userId, member.joinedAt, member.leftAt);
                }
                for (const comment of safari.comments) await this.insertComment(id, null, comment);
                await this.notificationSeedService.seed(
                    safari.notes.map((note) => ({
                        userId: note.userId,
                        notificationKind: note.kind,
                        entityType: AuditEntity.SHARED_SAFARI,
                        entityId: id,
                        clientApp: ClientApp.WEB,
                        ownerType: null,
                        ownerId: null,
                        title: safari.title,
                        excerpt: null,
                        actorId: note.actorId,
                        createdAt: note.at,
                        readAt: note.read ? note.at : null,
                    })),
                );
                await this.auditService.record({ ...event, entityId: id });
                return id;
            });
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.SHARED_SAFARI_SEED_FAILED }, error);
            throw error;
        }
    }

    private async insertComment(safariId: number, parentId: number | null, comment: SeedComment): Promise<void> {
        const id = await this.repository.insertComment(
            this.db,
            safariId,
            parentId,
            comment.userId,
            comment.text,
            comment.at,
        );
        for (const flag of comment.flags) {
            const reason = await this.repository.flagReasonByName(this.db, flag.reasonName);
            if (!reason) {
                throw new NotFoundException(
                    `The flag reason "${flag.reasonName}" is not in Flag Reasons.`,
                    'SEED_FLAG_REASON_NOT_FOUND',
                );
            }
            await this.repository.insertFlag(this.db, id, flag.userId, reason, flag.details, flag.at);
        }
        for (const reply of comment.replies) await this.insertComment(safariId, id, reply);
    }

    private async saveCover(id: number, safari: SeedSafari): Promise<void> {
        if (!safari.cover) return;
        const extension = EXTENSION_OF[safari.cover.contentType] ?? 'jpg';
        const fileName = `${Date.now()}${randomBytes(RANDOM_BYTES).toString('hex')}.${extension}`;
        await this.fileStorage.save(coverPath(id, fileName), safari.cover.content);
        await this.repository.setCover(this.db, id, fileName);
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Sample data is never written in production.', 'SEED_NOT_ALLOWED');
        }
    }
}
