import { ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IChatTestDataService } from '../contracts/chat-test-data-service.contract';
import type { ChatTestData } from '../dto/chat-test-data.dto';
import type { ChatTestDataRepository } from '../repositories/chat-test-data.repository';

export class ChatTestDataService implements IChatTestDataService {
    constructor(
        private readonly db: Database,
        private readonly repository: ChatTestDataRepository,
        private readonly auditService: IAuditService,
        private readonly isProduction: boolean,
    ) {}

    async find(userIds: readonly number[]): Promise<ChatTestData> {
        this.refuseInProduction();
        const conversations = await this.repository.conversationsOf(this.db, userIds);
        const conversationIds = conversations.map((row) => row.id);
        const messages = await this.repository.messagesOf(this.db, conversationIds);
        return {
            conversationIds,
            tables: [
                {
                    table: 'chat_message',
                    rows: messages.map((row) => ({
                        id: row.id,
                        label: `conversation ${row.chat_conversation_id}, from user ${row.user_id}`,
                    })),
                },
                {
                    table: 'chat_conversation',
                    rows: conversations.map((row) => ({
                        id: row.id,
                        label: `users ${row.first_user_id} and ${row.second_user_id}`,
                    })),
                },
            ],
        };
    }

    async remove(found: ChatTestData): Promise<number> {
        this.refuseInProduction();
        if (found.conversationIds.length === 0) return 0;
        const event = { action: AuditAction.CHAT_TEST_DATA_REMOVED, entityType: AuditEntity.CHAT_CONVERSATION } as const;
        try {
            return await this.db.transaction(async () => {
                const removed = await this.repository.deleteConversations(this.db, found.conversationIds);
                await this.auditService.record({ ...event, details: { removed: found.tables } });
                return removed;
            });
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.CHAT_TEST_DATA_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Test data is never removed this way in production.', 'TEST_DATA_NOT_ALLOWED');
        }
    }
}
