export const CHAT_LIMITS = { MESSAGE_MAX: 1000, PREVIEW_MAX: 50 } as const;

export type ChatUser = {
    readonly id: number;
    readonly name: string;
    readonly photoVersion: string | null;
    readonly isActive: boolean;
    readonly canReceive: boolean;
};

export type ChatMessage = {
    readonly id: number;
    readonly conversationId: number;
    readonly senderUserId: number;
    readonly text: string;
    readonly sentAt: string;
    readonly readAt: string | null;
    readonly isMine: boolean;
};

export type Conversation = {
    readonly id: number;
    readonly otherUser: ChatUser;
    readonly lastMessage: { readonly preview: string; readonly sentAt: string; readonly isMine: boolean };
    readonly unreadCount: number;
};

export type ConversationList = {
    readonly items: readonly Conversation[];
    readonly unreadCount: number;
};

export type ConversationDetail = {
    readonly conversation: Conversation;
    readonly messages: readonly ChatMessage[];
};

export type ChatPartner = {
    readonly otherUser: ChatUser;
    readonly conversationId: number | null;
};

export type SentMessage = {
    readonly conversation: Conversation;
    readonly message: ChatMessage;
};

export type ChatStreamHandlers = {
    readonly onUnread: (unreadCount: number) => void;
    readonly onMessage: (event: SentMessage) => void;
    readonly onReconnect: () => void;
};
