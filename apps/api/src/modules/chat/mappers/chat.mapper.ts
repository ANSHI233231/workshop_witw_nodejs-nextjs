import type { ChatMessageDto, ChatUserDto, ConversationDto } from '../dto/chat.dto';
import { ACTIVE_USER_STATUS, CHAT_LIMITS, type ChatUserRow, type ConversationRow, type MessageRow } from '../types/chat.types';

export const previewOf = (text: string): string =>
    text.length > CHAT_LIMITS.PREVIEW_CHARACTERS ? `${text.slice(0, CHAT_LIMITS.PREVIEW_CHARACTERS)}…` : text;

export const toChatUser = (row: ChatUserRow, isPartner: boolean): ChatUserDto => ({
    id: row.id,
    name: row.name,
    photoVersion: row.photo,
    isActive: row.status === ACTIVE_USER_STATUS,
    canReceive: row.status === ACTIVE_USER_STATUS && !isPartner,
});

export const toConversation = (row: ConversationRow, viewerId: number, otherIsPartner: boolean): ConversationDto => ({
    id: row.id,
    otherUser: toChatUser(
        { id: row.other_user_id, name: row.other_name, status: row.other_status, photo: row.other_photo } as ChatUserRow,
        otherIsPartner,
    ),
    lastMessage: {
        preview: previewOf(row.last_text),
        sentAt: row.last_sent_at.toISOString(),
        isMine: row.last_sender_id === viewerId,
    },
    unreadCount: Number(row.unread_count),
});

export const toMessage = (row: MessageRow, viewerId: number): ChatMessageDto => ({
    id: row.id,
    conversationId: row.chat_conversation_id,
    senderUserId: row.user_id,
    text: row.message_text,
    sentAt: row.created_at.toISOString(),
    readAt: row.read_at === null ? null : row.read_at.toISOString(),
    isMine: row.user_id === viewerId,
});
