import type { DbExecutor } from '../../../database/connection';
import type { ChatUserRow, ConversationRow, MessageRow } from '../types/chat.types';

export interface IChatRepository {
    conversationsOf(db: DbExecutor, userId: number): Promise<ConversationRow[]>;
    conversationOf(db: DbExecutor, conversationId: number, userId: number): Promise<ConversationRow | undefined>;
    findPair(db: DbExecutor, firstUserId: number, secondUserId: number): Promise<number | null>;
    openPair(db: DbExecutor, firstUserId: number, secondUserId: number, actorId: number): Promise<number>;
    insertMessage(db: DbExecutor, conversationId: number, senderId: number, text: string): Promise<number>;
    touchConversation(db: DbExecutor, conversationId: number, messageId: number, actorId: number): Promise<void>;
    messagesOf(db: DbExecutor, conversationId: number): Promise<MessageRow[]>;
    messageById(db: DbExecutor, messageId: number): Promise<MessageRow | undefined>;
    markRead(db: DbExecutor, conversationId: number, readerId: number): Promise<number>;
    unreadCountOf(db: DbExecutor, userId: number): Promise<number>;
    chatUser(db: DbExecutor, userId: number): Promise<ChatUserRow | undefined>;
}
