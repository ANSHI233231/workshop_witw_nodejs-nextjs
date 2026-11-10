import { randomBytes } from 'node:crypto';

import { ClientApp } from '../../../core/context';
import { ForbiddenException, NotFoundException, ValidationException } from '../../../core/exceptions';
import { freeSlug, slugOf } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import { AuditAction, type AuditActionCode, AuditEntity, type IAuditService } from '../../audit';
import { type INotificationService, NotificationKind } from '../../notification';
import type { ParkLookup } from '../contracts/shared-safari-module.contract';
import type { IWebsiteSafariService } from '../contracts/website-safari-service.contract';
import type {
    CoverImage,
    PublicFilters,
    PublicPage,
    SafariCardDto,
    SafariEditDto,
    SafariInput,
    SafariViewDto,
    Viewer,
} from '../dto/shared-safari.dto';
import {
    maskContacts,
    memberOf,
    todayInIndia,
    toCard,
    toEdit,
    toThread,
    viewerStateOf,
} from '../mappers/shared-safari.mapper';
import type { SharedSafariRepository } from '../repositories/shared-safari.repository';
import {
    ACTIVE_PARK,
    ACTIVE_USER,
    COVER_FOLDER,
    HOST_STATUSES,
    MyTab,
    type MyTabCode,
    PUBLIC_STATUSES,
    type SafariRow,
    SHARED_SAFARI_LIMITS,
    SharedSafariMemberStatus,
    SharedSafariStatus,
} from '../types/shared-safari.types';

const notAvailable = (): NotFoundException =>
    new NotFoundException('This safari is not available.', 'SHARED_SAFARI_NOT_AVAILABLE');

const notHost = (): ForbiddenException =>
    new ForbiddenException('Only the host can change this safari.', 'SHARED_SAFARI_NOT_HOST');

const fieldError = (field: string, message: string, code = 'SHARED_SAFARI_INVALID'): ValidationException =>
    new ValidationException(message, [{ field, message }], code);

const yearAhead = (today: string): string => `${Number(today.slice(0, 4)) + 1}${today.slice(4)}`;

const coverPath = (safariId: number, fileName: string): string =>
    `${COVER_FOLDER.PARENT}/${safariId}/${COVER_FOLDER.FEATURE}/${fileName}`;

const RANDOM_BYTES = 8;

const newFileName = (extension: string): string =>
    `${Date.now()}${randomBytes(RANDOM_BYTES).toString('hex')}.${extension}`;

const EXTENSION_OF: Readonly<Record<string, string>> = { 'image/png': 'png', 'image/jpeg': 'jpg' };

const isOpen = (row: SafariRow): boolean => PUBLIC_STATUSES.includes(row.status);

export const visibleTo = (row: SafariRow, viewer: Viewer): boolean => {
    if (row.hostStatus !== ACTIVE_USER) return false;
    if (isOpen(row)) return true;
    return viewer !== null && row.userId === viewer.id && row.status === SharedSafariStatus.INACTIVE;
};

const changesOf = (before: SafariRow, after: SafariInput): Record<string, unknown> => {
    const pairs: ReadonlyArray<readonly [string, unknown, unknown]> = [
        ['title', before.title, after.title],
        ['masterParkId', before.masterParkId, after.masterParkId],
        ['startDate', before.startDate, after.startDate],
        ['endDate', before.endDate, after.endDate],
        ['safariCount', before.safariCount, after.safariCount],
        ['theme', before.theme, after.theme],
        ['totalSeats', before.totalSeats, after.totalSeats],
        ['sharedSeats', before.sharedSeats, after.sharedSeats],
        ['pricePerPersonMin', before.pricePerPersonMin, after.pricePerPersonMin],
        ['pricePerPersonMax', before.pricePerPersonMax, after.pricePerPersonMax],
        ['stayCategory', before.stayCategory, after.stayCategory],
        ['safariPlan', before.safariPlan, after.safariPlan],
    ];
    return Object.fromEntries(
        pairs.filter(([, from, to]) => from !== to).map(([field, from, to]) => [field, { from, to }]),
    );
};

export class WebsiteSafariService implements IWebsiteSafariService {
    constructor(
        private readonly db: Database,
        private readonly repository: SharedSafariRepository,
        private readonly auditService: IAuditService,
        private readonly notificationService: INotificationService,
        private readonly fileStorage: IFileStorage,
        private readonly parkService: ParkLookup,
    ) {}

    async list(filters: PublicFilters, page: number, viewer: Viewer): Promise<PublicPage> {
        const today = todayInIndia();
        const limit = SHARED_SAFARI_LIMITS.PAGE_SIZE;
        const [rows, total, activeTotal] = await Promise.all([
            this.repository.publicList(this.db, filters, today, limit, (page - 1) * limit),
            this.repository.publicCount(this.db, filters, today),
            this.repository.publicTotal(this.db, today),
        ]);
        return { items: await this.cards(rows, viewer, today), total, activeTotal };
    }

    async mine(tab: MyTabCode, viewer: { readonly id: number }): Promise<SafariCardDto[]> {
        const rows =
            tab === MyTab.ORGANISED
                ? await this.repository.organisedBy(this.db, viewer.id)
                : await this.repository.joinedBy(this.db, viewer.id);
        return this.cards(rows, viewer, todayInIndia());
    }

    async view(ref: string, viewer: Viewer): Promise<SafariViewDto> {
        const row = await this.findByRef(ref);
        if (!row || !visibleTo(row, viewer)) throw notAvailable();
        const today = todayInIndia();
        const [faces, comments, member] = await Promise.all([
            this.repository.currentMembers(this.db, [row.id]),
            this.repository.commentsOf(this.db, row.id),
            viewer ? this.repository.findMember(this.db, row.id, viewer.id) : Promise.resolve(undefined),
        ]);
        const current = faces.filter((face) => face.userId !== row.userId);
        const card = toCard(row, current, viewer?.id ?? null, member, today);
        const state = viewerStateOf(row, viewer?.id ?? null, member);
        const visibleComments = comments.filter(
            (comment) =>
                comment.sharedSafariCommentId === null ||
                comments.some((parent) => parent.id === comment.sharedSafariCommentId),
        );
        return {
            ...card,
            safariPlan: maskContacts(row.safariPlan),
            commentCount: visibleComments.length,
            interested: current.map(memberOf),
            comments: toThread(visibleComments, {
                viewerId: viewer?.id ?? null,
                hostId: row.userId,
                viewerMayEdit: isOpen(row) && (state.isHost || state.joined),
            }),
        };
    }

    async editForm(id: number, viewer: { readonly id: number }): Promise<SafariEditDto> {
        return toEdit(await this.hostedBy(id, viewer.id));
    }

    async create(input: SafariInput, viewer: { readonly id: number }): Promise<{ id: number; slug: string }> {
        try {
            return await this.db.transaction(async () => {
                await this.checkPark(input.masterParkId);
                this.checkDates(input, null);
                const slug = await freeSlug(
                    this.slugBase(input.title),
                    (candidate) => this.repository.slugTaken(this.db, candidate),
                );
                const id = await this.repository.insert(this.db, viewer.id, slug, input);
                await this.auditService.record({
                    action: AuditAction.SHARED_SAFARI_CREATED,
                    entityType: AuditEntity.SHARED_SAFARI,
                    entityId: id,
                    changes: { title: { from: null, to: input.title }, slug: { from: null, to: slug } },
                    details: { masterParkId: input.masterParkId, startDate: input.startDate },
                });
                return { id, slug };
            });
        } catch (error) {
            await this.auditService.recordFailure(
                {
                    action: AuditAction.SHARED_SAFARI_CREATE_FAILED,
                    entityType: AuditEntity.SHARED_SAFARI,
                    details: { title: input.title },
                },
                error,
            );
            throw error;
        }
    }

    async update(id: number, input: SafariInput, viewer: { readonly id: number }): Promise<{ id: number; slug: string }> {
        return this.audited(AuditAction.SHARED_SAFARI_UPDATED, AuditAction.SHARED_SAFARI_UPDATE_FAILED, id, async () => {
            const before = await this.hostedBy(id, viewer.id);
            await this.checkPark(input.masterParkId);
            this.checkDates(input, before.startDate);
            await this.repository.update(this.db, id, input, viewer.id);
            return { result: { id, slug: before.slug }, changes: changesOf(before, input) };
        });
    }

    async setCover(id: number, image: CoverImage, viewer: { readonly id: number }): Promise<{ coverVersion: string }> {
        const extension = EXTENSION_OF[image.contentType];
        if (!extension) throw fieldError('image', 'Use a PNG, JPG or JPEG image.', 'SHARED_SAFARI_IMAGE_TYPE');
        const before = await this.hostedBy(id, viewer.id);
        const fileName = newFileName(extension);
        await this.fileStorage.save(coverPath(id, fileName), image.content);
        try {
            await this.audited(AuditAction.SHARED_SAFARI_UPDATED, AuditAction.SHARED_SAFARI_UPDATE_FAILED, id, async () => {
                await this.repository.setCover(this.db, id, fileName, viewer.id);
                return { result: null, changes: { coverImage: { from: before.coverImage, to: fileName } } };
            });
        } catch (error) {
            await this.fileStorage.remove(coverPath(id, fileName)).catch(() => undefined);
            throw error;
        }
        return { coverVersion: fileName };
    }

    async cover(id: number, viewer: Viewer): Promise<CoverImage> {
        const row = await this.repository.findById(this.db, id);
        if (!row || !visibleTo(row, viewer) || !row.coverImage) throw notAvailable();
        return this.readCover(row);
    }

    async readCover(row: SafariRow): Promise<CoverImage> {
        if (!row.coverImage) throw notAvailable();
        const content = await this.fileStorage.read(coverPath(row.id, row.coverImage));
        const contentType = row.coverImage.endsWith('.png') ? 'image/png' : 'image/jpeg';
        return { content, contentType };
    }

    async setStatus(id: number, status: number, viewer: { readonly id: number }): Promise<void> {
        await this.audited(
            AuditAction.SHARED_SAFARI_STATUS_CHANGED,
            AuditAction.SHARED_SAFARI_STATUS_CHANGE_FAILED,
            id,
            async () => {
                const before = await this.hostedBy(id, viewer.id);
                if (!HOST_STATUSES.includes(status)) throw fieldError('status', 'Choose a valid status.');
                await this.repository.setStatus(this.db, id, status, viewer.id);
                return { result: null, changes: { status: { from: before.status, to: status } } };
            },
        );
    }

    async remove(id: number, viewer: { readonly id: number }): Promise<void> {
        await this.audited(
            AuditAction.SHARED_SAFARI_DELETED_BY_HOST,
            AuditAction.SHARED_SAFARI_DELETE_BY_HOST_FAILED,
            id,
            async () => {
                const before = await this.hostedBy(id, viewer.id);
                await this.repository.deleteByHost(this.db, id, viewer.id);
                return {
                    result: null,
                    changes: { status: { from: before.status, to: SharedSafariStatus.DELETED_BY_HOST } },
                };
            },
        );
    }

    async join(id: number, viewer: { readonly id: number }): Promise<void> {
        await this.audited(AuditAction.SHARED_SAFARI_JOINED, AuditAction.SHARED_SAFARI_JOIN_FAILED, id, async () => {
            const row = await this.repository.findById(this.db, id);
            if (!row || !visibleTo(row, viewer)) throw notAvailable();
            if (row.userId === viewer.id) {
                throw new ValidationException("You can't join your own safari.", [], 'SHARED_SAFARI_OWN');
            }
            if (row.status !== SharedSafariStatus.ACTIVE) {
                throw new ValidationException('This safari is not open to join.', [], 'SHARED_SAFARI_NOT_OPEN');
            }
            const member = await this.repository.findMember(this.db, id, viewer.id);
            if (member?.status === SharedSafariMemberStatus.JOINED) return { result: null, changes: {} };
            if (member) {
                await this.repository.rejoin(this.db, member.id, viewer.id);
            } else {
                await this.repository.insertMember(this.db, id, viewer.id);
                await this.notificationService.notify([
                    {
                        userId: row.userId,
                        notificationKind: NotificationKind.SHARED_SAFARI_JOINED,
                        entityType: AuditEntity.SHARED_SAFARI,
                        entityId: row.id,
                        clientApp: ClientApp.WEB,
                        ownerType: null,
                        ownerId: null,
                        title: row.title,
                        excerpt: null,
                        actorId: viewer.id,
                    },
                ]);
            }
            return { result: null, changes: { member: { from: member?.status ?? null, to: 'joined' } } };
        });
    }

    async leave(id: number, viewer: { readonly id: number }): Promise<void> {
        await this.audited(AuditAction.SHARED_SAFARI_LEFT, AuditAction.SHARED_SAFARI_LEAVE_FAILED, id, async () => {
            const row = await this.repository.findById(this.db, id);
            if (!row || !visibleTo(row, viewer)) throw notAvailable();
            const member = await this.repository.findMember(this.db, id, viewer.id);
            if (member?.status !== SharedSafariMemberStatus.JOINED) {
                throw new ValidationException("You haven't joined this safari.", [], 'SHARED_SAFARI_NOT_MEMBER');
            }
            await this.repository.leave(this.db, member.id, viewer.id);
            return { result: null, changes: { member: { from: 'joined', to: 'left' } } };
        });
    }

    private async cards(rows: readonly SafariRow[], viewer: Viewer, today: string): Promise<SafariCardDto[]> {
        const ids = rows.map((row) => row.id);
        const [faces, memberships] = await Promise.all([
            this.repository.currentMembers(this.db, ids),
            viewer ? this.repository.viewerMemberships(this.db, viewer.id, ids) : Promise.resolve([]),
        ]);
        return rows.map((row) =>
            toCard(
                row,
                faces.filter((face) => face.sharedSafariId === row.id && face.userId !== row.userId),
                viewer?.id ?? null,
                memberships.find((member) => member.sharedSafariId === row.id),
                today,
            ),
        );
    }

    private async findByRef(ref: string): Promise<SafariRow | undefined> {
        return /^\d+$/.test(ref)
            ? this.repository.findById(this.db, Number(ref))
            : this.repository.findBySlug(this.db, ref);
    }

    private async hostedBy(id: number, userId: number): Promise<SafariRow> {
        const row = await this.repository.findById(this.db, id);
        if (!row || !HOST_STATUSES.includes(row.status) || row.hostStatus !== ACTIVE_USER) throw notAvailable();
        if (row.userId !== userId) throw notHost();
        return row;
    }

    private async checkPark(parkId: number): Promise<void> {
        const park = await this.parkService.findById(parkId);
        if (!park) throw fieldError('masterParkId', 'Select a park.');
        if (park.status !== ACTIVE_PARK) {
            throw fieldError('masterParkId', 'This park is no longer active. Select an active park.', 'PARK_INACTIVE');
        }
    }

    private checkDates(input: SafariInput, previousStart: string | null): void {
        const today = todayInIndia();
        const startChanged = previousStart === null || previousStart !== input.startDate;
        if (startChanged && (input.startDate < today || input.startDate > yearAhead(today))) {
            throw fieldError('startDate', 'Choose a start date from today up to one year ahead.');
        }
        if (input.endDate <= input.startDate) throw fieldError('endDate', 'End date must be after the start date.');
    }

    private slugBase(title: string): string {
        const slug = slugOf(title, SHARED_SAFARI_LIMITS.SLUG_MAX, 'safari');
        return /^\d+$/.test(slug) ? `safari-${slug}` : slug;
    }

    private async audited<T>(
        action: AuditActionCode,
        failure: AuditActionCode,
        id: number,
        work: () => Promise<{ readonly result: T; readonly changes: Readonly<Record<string, unknown>> }>,
    ): Promise<T> {
        try {
            return await this.db.transaction(async () => {
                const done = await work();
                await this.auditService.record({
                    action,
                    entityType: AuditEntity.SHARED_SAFARI,
                    entityId: id,
                    changes: done.changes,
                });
                return done.result;
            });
        } catch (error) {
            await this.auditService.recordFailure({ action: failure, entityType: AuditEntity.SHARED_SAFARI, entityId: id }, error);
            throw error;
        }
    }
}
