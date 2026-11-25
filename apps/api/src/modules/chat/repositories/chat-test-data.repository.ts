import type { DbExecutor } from '../../../database/connection';
import { ChatTestDataSQL } from '../sql/chat-test-data.sql';
import type { TestConversationRow, TestMessageRow } from '../types/chat.types';

export class ChatTestDataRepository {
    async conversationsOf(db: DbExecutor, userIds: readonly number[]): Promise<TestConversationRow[]> {
        if (userIds.length === 0) return [];
        return db.query<TestConversationRow>(ChatTestDataSQL.conversationsOf(userIds.length), [...userIds, ...userIds]);
    }

    async messagesOf(db: DbExecutor, conversationIds: readonly number[]): Promise<TestMessageRow[]> {
        if (conversationIds.length === 0) return [];
        return db.query<TestMessageRow>(ChatTestDataSQL.messagesOf(conversationIds.length), [...conversationIds]);
    }

    async deleteConversations(db: DbExecutor, conversationIds: readonly number[]): Promise<number> {
        if (conversationIds.length === 0) return 0;
        await db.execute(ChatTestDataSQL.deleteMessages(conversationIds.length), [...conversationIds]);
        return (await db.execute(ChatTestDataSQL.deleteConversations(conversationIds.length), [...conversationIds]))
            .affectedRows;
    }
}
