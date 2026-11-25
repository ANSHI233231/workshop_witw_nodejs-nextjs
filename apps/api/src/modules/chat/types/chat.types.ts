import type { RowDataPacket } from '../../../database/connection';

export const CHAT_LIMITS = { MESSAGE_MAX: 1000, PREVIEW_CHARACTERS: 50, NAME_MAX: 255 } as const;

export const ChatEvent = { MESSAGE: 'chat-message', UNREAD: 'chat-unread' } as const;

export const ACTIVE_USER_STATUS = 1;

export interface ConversationRow extends RowDataPacket {
    id: number;
    first_user_id: number;
    second_user_id: number;
    last_message_at: Date;
    other_user_id: number;
    other_name: string;
    other_status: number;
    other_photo: string | null;
    last_sender_id: number;
    last_text: string;
    last_sent_at: Date;
    unread_count: number;
}

export interface MessageRow extends RowDataPacket {
    id: number;
    chat_conversation_id: number;
    user_id: number;
    message_text: string;
    read_at: Date | null;
    created_at: Date;
}

export interface ChatUserRow extends RowDataPacket {
    id: number;
    name: string;
    status: number;
    photo: string | null;
}

export interface CountRow extends RowDataPacket {
    total: number;
}

export interface TestConversationRow extends RowDataPacket {
    id: number;
    first_user_id: number;
    second_user_id: number;
}

export interface TestMessageRow extends RowDataPacket {
    id: number;
    chat_conversation_id: number;
    user_id: number;
}
