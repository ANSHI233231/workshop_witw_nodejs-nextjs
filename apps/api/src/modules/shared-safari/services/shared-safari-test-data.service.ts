import { ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { ISharedSafariTestDataService } from '../contracts/shared-safari-test-data-service.contract';
import type { SharedSafariTestData, SharedSafariTestDataScope } from '../dto/shared-safari-test-data.dto';
import type {
    SharedSafariTestDataRepository,
    TestCommentRow,
    TestSafariRow,
} from '../repositories/shared-safari-test-data.repository';
import { COVER_FOLDER } from '../types/shared-safari.types';

const safariLabel = (row: TestSafariRow): string => `${row.title} (host ${row.user_id}, status ${row.status})`;

const commentLabel = (row: TestCommentRow): string => `safari ${row.shared_safari_id}, user ${row.user_id}: ${row.text_start}`;

export class SharedSafariTestDataService implements ISharedSafariTestDataService {
    constructor(
        private readonly db: Database,
        private readonly repository: SharedSafariTestDataRepository,
        private readonly auditService: IAuditService,
        private readonly fileStorage: IFileStorage,
        private readonly isProduction: boolean,
    ) {}

    async find(scope: SharedSafariTestDataScope): Promise<SharedSafariTestData> {
        this.refuseInProduction();
        const safaris = await this.repository.markedSafaris(this.db, scope.userIds, scope.textPrefix, scope.slugPrefix);
        const safariIds = safaris.map((row) => row.id);
        const members = await this.repository.members(this.db, safariIds, scope.userIds);
        const comments = await this.commentsWithReplies(safariIds, scope);
        const commentIds = comments.map((row) => row.id);
        const flags = await this.repository.flags(this.db, commentIds, scope.userIds);
        const kept = await this.repository.safarisNotIn(this.db, safariIds);
        return {
            safariIds,
            memberIds: members.map((row) => row.id),
            commentIds,
            flagIds: flags.map((row) => row.id),
            tables: [
                { table: 'shared_safari', rows: safaris.map((row) => ({ id: row.id, label: safariLabel(row) })) },
                {
                    table: 'shared_safari_member',
                    rows: members.map((row) => ({
                        id: row.id,
                        label: `safari ${row.shared_safari_id}, user ${row.user_id}, status ${row.status}`,
                    })),
                },
                { table: 'shared_safari_comment', rows: comments.map((row) => ({ id: row.id, label: commentLabel(row) })) },
                {
                    table: 'shared_safari_comment_flag',
                    rows: flags.map((row) => ({ id: row.id, label: `comment ${row.shared_safari_comment_id}, by user ${row.user_id}` })),
                },
            ],
            folders: safariIds.map((id) => `${COVER_FOLDER.PARENT}/${id}`),
            kept: [{ table: 'shared_safari', rows: kept.map((row) => ({ id: row.id, label: safariLabel(row) })) }],
        };
    }

    async remove(found: SharedSafariTestData): Promise<number> {
        this.refuseInProduction();
        const total = found.safariIds.length + found.memberIds.length + found.commentIds.length + found.flagIds.length;
        if (total === 0) return 0;
        const event = { action: AuditAction.SHARED_SAFARI_TEST_DATA_REMOVED, entityType: AuditEntity.SHARED_SAFARI } as const;
        try {
            const removed = await this.db.transaction(async () => {
                const count = await this.repository.deleteAll(this.db, found);
                await this.auditService.record({ ...event, details: { removed: found.tables, folders: found.folders } });
                return count;
            });
            for (const folder of found.folders) await this.fileStorage.removeFolder(folder);
            return removed;
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.SHARED_SAFARI_TEST_DATA_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private async commentsWithReplies(safariIds: readonly number[], scope: SharedSafariTestDataScope): Promise<TestCommentRow[]> {
        const found = new Map<number, TestCommentRow>();
        let next = await this.repository.comments(this.db, safariIds, scope.userIds, scope.textPrefix);
        while (next.length > 0) {
            for (const row of next) found.set(row.id, row);
            const replies = await this.repository.repliesTo(
                this.db,
                next.map((row) => row.id),
            );
            next = replies.filter((row) => !found.has(row.id));
        }
        return [...found.values()].sort((a, b) => a.id - b.id);
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Test data is never removed this way in production.', 'TEST_DATA_NOT_ALLOWED');
        }
    }
}
