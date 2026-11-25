import type {
    ChatPartner,
    ChatStreamHandlers,
    ConversationDetail,
    ConversationList,
    SentMessage,
} from '@/types/chat.types';

import { apiClient } from './api-client';
import { refreshSession } from './auth.service';

const BASE = '/chat';

const STREAM_PATH = `${BASE}/stream`;

export const listConversations = (): Promise<ConversationList> => apiClient.get<ConversationList>(`${BASE}/conversations`);

export const getConversation = (conversationId: number): Promise<ConversationDetail> =>
    apiClient.get<ConversationDetail>(`${BASE}/conversations/${conversationId}`);

export const markConversationRead = (conversationId: number): Promise<{ readonly unreadCount: number }> =>
    apiClient.post<{ readonly unreadCount: number }>(`${BASE}/conversations/${conversationId}/read`, {});

export const getChatPartner = (userId: number): Promise<ChatPartner> => apiClient.get<ChatPartner>(`${BASE}/users/${userId}`);

export const sendMessage = (recipientUserId: number, text: string): Promise<SentMessage> =>
    apiClient.post<SentMessage>(`${BASE}/messages`, { recipientUserId, text });

export const getUnreadCount = (): Promise<{ readonly unreadCount: number }> =>
    apiClient.get<{ readonly unreadCount: number }>(`${BASE}/unread-count`);

const parsed = <T>(event: Event): T | null => {
    try {
        return JSON.parse((event as MessageEvent<string>).data) as T;
    } catch {
        return null;
    }
};

export const openChatStream = (handlers: ChatStreamHandlers): (() => void) => {
    let source: EventSource | null = null;
    let stopped = false;
    let opened = false;

    const open = () => {
        if (stopped) return;
        const next = new EventSource(apiClient.fileUrl(STREAM_PATH), { withCredentials: true });
        source = next;
        next.addEventListener('open', () => {
            if (opened) handlers.onReconnect();
            opened = true;
        });
        next.addEventListener('chat-unread', (event) => {
            const data = parsed<{ readonly unreadCount: number }>(event);
            if (data) handlers.onUnread(data.unreadCount);
        });
        next.addEventListener('chat-message', (event) => {
            const data = parsed<SentMessage>(event);
            if (data) handlers.onMessage(data);
        });
        next.addEventListener('error', () => {
            if (stopped || next.readyState !== EventSource.CLOSED) return;
            next.close();
            void refreshSession()
                .then((user) => {
                    if (user) open();
                })
                .catch(() => undefined);
        });
    };

    open();

    return () => {
        stopped = true;
        source?.close();
    };
};
