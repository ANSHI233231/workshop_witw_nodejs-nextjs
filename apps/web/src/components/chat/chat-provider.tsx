'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { openChatStream } from '@/services/chat.service';
import type { SentMessage } from '@/types/chat.types';

export type ChatListener = {
    readonly onMessage: (event: SentMessage) => void;
    readonly onReconnect: () => void;
};

type ChatValue = {
    readonly unreadCount: number;
    readonly setUnreadCount: (unreadCount: number) => void;
    readonly listen: (listener: ChatListener) => () => void;
};

const ChatContext = createContext<ChatValue>({
    unreadCount: 0,
    setUnreadCount: () => undefined,
    listen: () => () => undefined,
});

export const useChat = (): ChatValue => useContext(ChatContext);

export function ChatProvider({ enabled, children }: { readonly enabled: boolean; readonly children: ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const listeners = useRef(new Set<ChatListener>());

    useEffect(() => {
        if (!enabled) return;
        return openChatStream({
            onUnread: setUnreadCount,
            onMessage: (event) => listeners.current.forEach((listener) => listener.onMessage(event)),
            onReconnect: () => listeners.current.forEach((listener) => listener.onReconnect()),
        });
    }, [enabled]);

    const listen = useCallback((listener: ChatListener) => {
        listeners.current.add(listener);
        return () => {
            listeners.current.delete(listener);
        };
    }, []);

    const value = useMemo(() => ({ unreadCount, setUnreadCount, listen }), [unreadCount, listen]);

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
