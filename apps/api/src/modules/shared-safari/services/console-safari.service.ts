import { NotFoundException, ValidationException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, type AuditActionCode, type AuditEntityCode, AuditEntity, type IAuditService } from '../../audit';
import type { IConsoleSafariService } from '../contracts/console-safari-service.contract';
import type {
    AdminDeleteInput,
    ConsoleFilters,
    ConsoleSafariDetailDto,
    ConsoleSafariDto,
    CoverImage,
    FlagDto,
    FlaggedCommentDto,
    Paged,
} from '../dto/shared-safari.dto';
import { personOf, toConsoleDetail, toConsoleSafari, toFlag, toFlagged } from '../mappers/shared-safari.mapper';
import type { SharedSafariRepository } from '../repositories/shared-safari.repository';
import {
    type SafariRow,
    SharedSafariCommentStatus,
    SharedSafariStatus,
} from '../types/shared-safari.types';
import type { WebsiteSafariService } from './website-safari.service';

const notFound = (): NotFoundException =>
    new NotFoundException('This safari was not found.', 'SHARED_SAFARI_NOT_FOUND');

const commentNotFound = (): NotFoundException =>
    new NotFoundException('This comment was not found.', 'SHARED_SAFARI_COMMENT_NOT_FOUND');

const readOnly = (): ValidationException =>
    new ValidationException(
        'A safari deleted by its host can only be viewed.',
        [],
        'SHARED_SAFARI_DELETED_BY_HOST',
    );

type Done<T> = { readonly result: T; readonly changes: Readonly<Record<string, unknown>> };

export class ConsoleSafariService implements IConsoleSafariService {
    constructor(
        private readonly db: Database,
        private readonly repository: SharedSafariRepository,
        private readonly auditService: IAuditService,
        private readonly website: WebsiteSafariService,
    ) {}

    async list(filters: ConsoleFilters, page: number, limit: number): Promise<Paged<ConsoleSafariDto>> {
        const [rows, total] = await Promise.all([
            this.repository.consoleList(this.db, filters, limit, (page - 1) * limit),
            this.repository.consoleCount(this.db, filters),
        ]);
        return { items: rows.map(toConsoleSafari), total };
    }

    async hosts(): Promise<{ id: number; name: string }[]> {
        return (await this.repository.hostOptions(this.db)).map((row) => ({ id: row.id, name: row.name }));
    }

    async detail(id: number): Promise<ConsoleSafariDetailDto> {
        const row = await this.find(id);
        const [joined, left, comments] = await Promise.all([
            this.repository.joinedMembers(this.db, id),
            this.repository.leftMembers(this.db, id),
            this.repository.commentsOf(this.db, id),
        ]);
        const visible = comments.filter(
            (comment) =>
                comment.sharedSafariCommentId === null ||
                comments.some((parent) => parent.id === comment.sharedSafariCommentId),
        );
        return toConsoleDetail(row, joined, left, visible);
    }

    async cover(id: number): Promise<CoverImage> {
        return this.website.readCover(await this.find(id));
    }

    async remove(id: number, input: AdminDeleteInput, actorId: number): Promise<void> {
        await this.audited(
            AuditAction.SHARED_SAFARI_DELETED_BY_ADMIN,
            AuditAction.SHARED_SAFARI_DELETE_BY_ADMIN_FAILED,
            AuditEntity.SHARED_SAFARI,
            id,
            async () => {
                const row = await this.editable(id);
                if (row.status === SharedSafariStatus.DELETED_BY_ADMIN) {
                    throw new ValidationException('This safari is already deleted.', [], 'SHARED_SAFARI_DELETED');
                }
                await this.repository.deleteByAdmin(this.db, id, input.reason, input.details, actorId);
                return {
                    result: undefined,
                    changes: {
                        status: { from: row.status, to: SharedSafariStatus.DELETED_BY_ADMIN },
                        deleteReason: { from: null, to: input.reason },
                        deleteDetails: { from: null, to: input.details },
                    },
                };
            },
        );
    }

    async makeActive(id: number, actorId: number): Promise<void> {
        await this.audited(
            AuditAction.SHARED_SAFARI_MADE_ACTIVE,
            AuditAction.SHARED_SAFARI_MAKE_ACTIVE_FAILED,
            AuditEntity.SHARED_SAFARI,
            id,
            async () => {
                const row = await this.editable(id);
                if (row.status !== SharedSafariStatus.DELETED_BY_ADMIN) {
                    throw new ValidationException(
                        'Only a safari deleted by an admin can be made active.',
                        [],
                        'SHARED_SAFARI_NOT_DELETED',
                    );
                }
                await this.repository.makeActive(this.db, id, actorId);
                return {
                    result: undefined,
                    changes: {
                        status: { from: row.status, to: SharedSafariStatus.ACTIVE },
                        deleteReason: { from: row.deleteReason, to: null },
                        deleteDetails: { from: row.deleteDetails, to: null },
                    },
                };
            },
        );
    }

    async setPinned(id: number, pinned: boolean, actorId: number): Promise<void> {
        await this.audited(
            pinned ? AuditAction.SHARED_SAFARI_PINNED : AuditAction.SHARED_SAFARI_UNPINNED,
            AuditAction.SHARED_SAFARI_PIN_FAILED,
            AuditEntity.SHARED_SAFARI,
            id,
            async () => {
                const row = await this.editable(id);
                await this.repository.setPinned(this.db, id, pinned, actorId);
                return { result: undefined, changes: { isPinned: { from: row.isPinned === 1, to: pinned } } };
            },
        );
    }

    async removeComment(commentId: number, actorId: number): Promise<void> {
        await this.audited(
            AuditAction.SHARED_SAFARI_COMMENT_DELETED_BY_ADMIN,
            AuditAction.SHARED_SAFARI_COMMENT_DELETE_FAILED,
            AuditEntity.SHARED_SAFARI_COMMENT,
            commentId,
            async () => {
                const comment = await this.repository.findComment(this.db, commentId);
                if (!comment || comment.status !== SharedSafariCommentStatus.ACTIVE) throw commentNotFound();
                await this.editable(comment.sharedSafariId);
                const closed = await this.repository.closeFlagsOf(this.db, commentId, actorId);
                if (comment.sharedSafariCommentId === null) {
                    await this.repository.deleteCommentWithReplies(this.db, commentId, actorId);
                } else {
                    await this.repository.deleteSingleComment(this.db, commentId, actorId);
                }
                return {
                    result: undefined,
                    changes: {
                        status: { from: SharedSafariCommentStatus.ACTIVE, to: SharedSafariCommentStatus.DELETED },
                        flagsClosed: closed,
                    },
                };
            },
        );
    }

    async ignoreFlags(commentId: number, actorId: number): Promise<void> {
        await this.audited(
            AuditAction.SHARED_SAFARI_FLAGS_IGNORED,
            AuditAction.SHARED_SAFARI_FLAGS_IGNORE_FAILED,
            AuditEntity.SHARED_SAFARI_COMMENT,
            commentId,
            async () => {
                const comment = await this.repository.findComment(this.db, commentId);
                if (!comment || comment.status !== SharedSafariCommentStatus.ACTIVE) throw commentNotFound();
                const ignored = await this.repository.ignoreFlagsOf(this.db, commentId, actorId);
                return { result: undefined, changes: { flagsIgnored: ignored } };
            },
        );
    }

    async flagged(search: string | undefined, page: number, limit: number): Promise<Paged<FlaggedCommentDto>> {
        const [rows, total] = await Promise.all([
            this.repository.flagged(this.db, search, limit, (page - 1) * limit),
            this.repository.flaggedCount(this.db, search),
        ]);
        return { items: rows.map(toFlagged), total };
    }

    async flagsOf(commentId: number): Promise<{ comment: { id: number; text: string; writer: string }; flags: FlagDto[] }> {
        const comment = await this.repository.findComment(this.db, commentId);
        if (!comment) throw commentNotFound();
        const flags = await this.repository.openFlagsOf(this.db, commentId);
        return {
            comment: { id: comment.id, text: comment.commentText, writer: personOf(comment.userId, comment.writerName).name },
            flags: flags.map(toFlag),
        };
    }

    private async find(id: number): Promise<SafariRow> {
        const row = await this.repository.findById(this.db, id);
        if (!row) throw notFound();
        return row;
    }

    private async editable(id: number): Promise<SafariRow> {
        const row = await this.find(id);
        if (row.status === SharedSafariStatus.DELETED_BY_HOST) throw readOnly();
        return row;
    }

    private async audited<T>(
        action: AuditActionCode,
        failure: AuditActionCode,
        entityType: AuditEntityCode,
        id: number,
        work: () => Promise<Done<T>>,
    ): Promise<T> {
        try {
            return await this.db.transaction(async () => {
                const done = await work();
                await this.auditService.record({ action, entityType, entityId: id, changes: done.changes });
                return done.result;
            });
        } catch (error) {
            await this.auditService.recordFailure({ action: failure, entityType, entityId: id }, error);
            throw error;
        }
    }
}
