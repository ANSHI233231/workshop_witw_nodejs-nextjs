import { ClientApp } from '../../../core/context';
import { ForbiddenException, NotFoundException, ValidationException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, type AuditActionCode, AuditEntity, type IAuditService } from '../../audit';
import { type INotificationService, NotificationKind } from '../../notification';
import type { IDiscussionService } from '../contracts/discussion-service.contract';
import type { FlagReasonLookup } from '../contracts/shared-safari-module.contract';
import type { CommentInput, FlagInput } from '../dto/shared-safari.dto';
import type { SharedSafariRepository } from '../repositories/shared-safari.repository';
import {
    ACTIVE_USER,
    type CommentRow,
    PUBLIC_STATUSES,
    type SafariRow,
    SharedSafariCommentStatus,
    SharedSafariMemberStatus,
} from '../types/shared-safari.types';
import { visibleTo } from './website-safari.service';

const commentGone = (): NotFoundException =>
    new NotFoundException('This comment is not available.', 'SHARED_SAFARI_COMMENT_NOT_AVAILABLE');

const safariGone = (): NotFoundException =>
    new NotFoundException('This safari is not available.', 'SHARED_SAFARI_NOT_AVAILABLE');

type Done<T> = {
    readonly result: T;
    readonly entityId: number;
    readonly changes: Readonly<Record<string, unknown>>;
};

export class DiscussionService implements IDiscussionService {
    constructor(
        private readonly db: Database,
        private readonly repository: SharedSafariRepository,
        private readonly auditService: IAuditService,
        private readonly notificationService: INotificationService,
        private readonly flagReasonService: FlagReasonLookup,
    ) {}

    async post(safariId: number, input: CommentInput, viewer: { readonly id: number }): Promise<{ id: number }> {
        return this.audited(
            AuditAction.SHARED_SAFARI_COMMENT_POSTED,
            AuditAction.SHARED_SAFARI_COMMENT_POST_FAILED,
            safariId,
            async () => {
                const safari = await this.openSafari(safariId, viewer);
                const member = await this.repository.findMember(this.db, safariId, viewer.id);
                if (safari.userId !== viewer.id && !member) {
                    throw new ForbiddenException('Join this safari to comment.', 'SHARED_SAFARI_JOIN_TO_COMMENT');
                }
                if (input.parentId !== null) await this.checkParent(input.parentId, safariId);
                const id = await this.repository.insertComment(
                    this.db,
                    safariId,
                    input.parentId,
                    viewer.id,
                    input.text,
                );
                if (safari.userId !== viewer.id) {
                    await this.notificationService.notify([
                        {
                            userId: safari.userId,
                            notificationKind: NotificationKind.SHARED_SAFARI_COMMENTED,
                            entityType: AuditEntity.SHARED_SAFARI,
                            entityId: safari.id,
                            clientApp: ClientApp.WEB,
                            ownerType: null,
                            ownerId: null,
                            title: safari.title,
                            excerpt: null,
                            actorId: viewer.id,
                        },
                    ]);
                }
                return { result: { id }, entityId: id, changes: { text: { from: null, to: input.text } } };
            },
        );
    }

    async edit(commentId: number, text: string, viewer: { readonly id: number }): Promise<void> {
        await this.audited(
            AuditAction.SHARED_SAFARI_COMMENT_EDITED,
            AuditAction.SHARED_SAFARI_COMMENT_EDIT_FAILED,
            commentId,
            async () => {
                const comment = await this.ownComment(commentId, viewer);
                await this.repository.updateCommentText(this.db, commentId, text, viewer.id);
                return {
                    result: undefined,
                    entityId: commentId,
                    changes: { text: { from: comment.commentText, to: text } },
                };
            },
        );
    }

    async remove(commentId: number, viewer: { readonly id: number }): Promise<void> {
        await this.audited(
            AuditAction.SHARED_SAFARI_COMMENT_DELETED_BY_WRITER,
            AuditAction.SHARED_SAFARI_COMMENT_DELETE_FAILED,
            commentId,
            async () => {
                const comment = await this.ownComment(commentId, viewer);
                if (comment.sharedSafariCommentId === null) {
                    await this.repository.deleteCommentWithReplies(this.db, commentId, viewer.id);
                } else {
                    await this.repository.deleteSingleComment(this.db, commentId, viewer.id);
                }
                return {
                    result: undefined,
                    entityId: commentId,
                    changes: {
                        status: { from: SharedSafariCommentStatus.ACTIVE, to: SharedSafariCommentStatus.DELETED },
                    },
                };
            },
        );
    }

    async flag(commentId: number, input: FlagInput, viewer: { readonly id: number }): Promise<void> {
        await this.audited(
            AuditAction.SHARED_SAFARI_COMMENT_FLAGGED,
            AuditAction.SHARED_SAFARI_COMMENT_FLAG_FAILED,
            commentId,
            async () => {
                const comment = await this.visibleComment(commentId, viewer);
                if (comment.userId === viewer.id) {
                    throw new ValidationException("You can't flag your own comment.", [], 'SHARED_SAFARI_OWN_COMMENT');
                }
                const reason = await this.flagReasonService.findActiveById(input.reasonId);
                if (!reason) {
                    throw new ValidationException(
                        'Select a reason.',
                        [{ field: 'reasonId', message: 'Select a reason.' }],
                        'FLAG_REASON_NOT_AVAILABLE',
                    );
                }
                const flagId = await this.repository.insertFlag(this.db, commentId, viewer.id, reason, input.details);
                return {
                    result: undefined,
                    entityId: commentId,
                    changes: { flag: { from: null, to: { id: flagId, reason: reason.name } } },
                };
            },
        );
    }

    private async checkParent(parentId: number, safariId: number): Promise<void> {
        const parent = await this.repository.findComment(this.db, parentId);
        const usable =
            parent !== undefined &&
            parent.sharedSafariId === safariId &&
            parent.sharedSafariCommentId === null &&
            parent.status === SharedSafariCommentStatus.ACTIVE &&
            parent.writerStatus === ACTIVE_USER;
        if (!usable) throw commentGone();
    }

    private async openSafari(safariId: number, viewer: { readonly id: number }): Promise<SafariRow> {
        const safari = await this.repository.findById(this.db, safariId);
        if (!safari || !visibleTo(safari, viewer) || !PUBLIC_STATUSES.includes(safari.status)) throw safariGone();
        return safari;
    }

    private async visibleComment(commentId: number, viewer: { readonly id: number }): Promise<CommentRow> {
        const comment = await this.repository.findComment(this.db, commentId);
        if (!comment || comment.status !== SharedSafariCommentStatus.ACTIVE || comment.writerStatus !== ACTIVE_USER) {
            throw commentGone();
        }
        if (comment.sharedSafariCommentId !== null) {
            const parent = await this.repository.findComment(this.db, comment.sharedSafariCommentId);
            if (!parent || parent.status !== SharedSafariCommentStatus.ACTIVE || parent.writerStatus !== ACTIVE_USER) {
                throw commentGone();
            }
        }
        const safari = await this.repository.findById(this.db, comment.sharedSafariId);
        if (!safari || !visibleTo(safari, viewer)) throw safariGone();
        return comment;
    }

    private async ownComment(commentId: number, viewer: { readonly id: number }): Promise<CommentRow> {
        const comment = await this.visibleComment(commentId, viewer);
        if (comment.userId !== viewer.id) {
            throw new ForbiddenException('You can only change your own comment.', 'SHARED_SAFARI_NOT_WRITER');
        }
        const safari = await this.openSafari(comment.sharedSafariId, viewer);
        if (safari.userId === viewer.id) return comment;
        const member = await this.repository.findMember(this.db, safari.id, viewer.id);
        if (member?.status !== SharedSafariMemberStatus.JOINED) {
            throw new ForbiddenException("You left this safari, so you can't change your comments.", 'SHARED_SAFARI_LEFT');
        }
        return comment;
    }

    private async audited<T>(
        action: AuditActionCode,
        failure: AuditActionCode,
        target: number,
        work: () => Promise<Done<T>>,
    ): Promise<T> {
        try {
            return await this.db.transaction(async () => {
                const done = await work();
                await this.auditService.record({
                    action,
                    entityType: AuditEntity.SHARED_SAFARI_COMMENT,
                    entityId: done.entityId,
                    changes: done.changes,
                    details: { target },
                });
                return done.result;
            });
        } catch (error) {
            await this.auditService.recordFailure(
                { action: failure, entityType: AuditEntity.SHARED_SAFARI_COMMENT, details: { target } },
                error,
            );
            throw error;
        }
    }
}
