import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import type { IChatRepository } from '../contracts/chat-repository.contract';
import { ChatSQL } from '../sql/chat.sql';
import type { ChatUserRow, ConversationRow, CountRow, MessageRow } from '../types/chat.types';

interface IdRow extends RowDataPacket {
    id: number;
}

export class ChatRepository implements IChatRepository {
    async conversationsOf(db: DbExecutor, userId: number): Promise<ConversationRow[]> {
        return db.query<ConversationRow>(ChatSQL.conversationsOf, [userId, userId, userId, userId]);
    }

    async conversationOf(db: DbExecutor, conversationId: number, userId: number): Promise<ConversationRow | undefined> {
        return (
            await db.query<ConversationRow>(ChatSQL.conversationOf, [userId, userId, conversationId, userId, userId])
        )[0];
    }

    async findPair(db: DbExecutor, firstUserId: number, secondUserId: number): Promise<number | null> {
        return (await db.query<IdRow>(ChatSQL.findPair, [firstUserId, secondUserId]))[0]?.id ?? null;
    }

    async openPair(db: DbExecutor, firstUserId: number, secondUserId: number, actorId: number): Promise<number> {
        return (await db.execute(ChatSQL.openPair, [firstUserId, secondUserId, actorId, actorId])).insertId;
    }

    async insertMessage(db: DbExecutor, conversationId: number, senderId: number, text: string): Promise<number> {
        return (await db.execute(ChatSQL.insertMessage, [conversationId, senderId, text, senderId, senderId])).insertId;
    }

    async touchConversation(db: DbExecutor, conversationId: number, messageId: number, actorId: number): Promise<void> {
        await db.execute(ChatSQL.touchConversation, [messageId, actorId, conversationId]);
    }

    async messagesOf(db: DbExecutor, conversationId: number): Promise<MessageRow[]> {
        return db.query<MessageRow>(ChatSQL.messagesOf, [conversationId]);
    }

    async messageById(db: DbExecutor, messageId: number): Promise<MessageRow | undefined> {
        return (await db.query<MessageRow>(ChatSQL.messageById, [messageId]))[0];
    }

    async markRead(db: DbExecutor, conversationId: number, readerId: number): Promise<number> {
        return (await db.execute(ChatSQL.markRead, [readerId, conversationId, readerId])).affectedRows;
    }

    async unreadCountOf(db: DbExecutor, userId: number): Promise<number> {
        const rows = await db.query<CountRow>(ChatSQL.unreadCountOf, [userId, userId, userId]);
        return Number(rows[0]?.total ?? 0);
    }

    async chatUser(db: DbExecutor, userId: number): Promise<ChatUserRow | undefined> {
        return (await db.query<ChatUserRow>(ChatSQL.chatUser, [userId]))[0];
    }
}
