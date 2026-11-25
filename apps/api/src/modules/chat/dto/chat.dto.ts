export type ChatUserDto = {
    readonly id: number;
    readonly name: string;
    readonly photoVersion: string | null;
    readonly isActive: boolean;
    readonly canReceive: boolean;
};

export type ChatMessageDto = {
    readonly id: number;
    readonly conversationId: number;
    readonly senderUserId: number;
    readonly text: string;
    readonly sentAt: string;
    readonly readAt: string | null;
    readonly isMine: boolean;
};

export type ConversationDto = {
    readonly id: number;
    readonly otherUser: ChatUserDto;
    readonly lastMessage: { readonly preview: string; readonly sentAt: string; readonly isMine: boolean };
    readonly unreadCount: number;
};

export type ConversationListDto = {
    readonly items: readonly ConversationDto[];
    readonly unreadCount: number;
};

export type ConversationDetailDto = {
    readonly conversation: ConversationDto;
    readonly messages: readonly ChatMessageDto[];
};

export type ChatPartnerDto = {
    readonly otherUser: ChatUserDto;
    readonly conversationId: number | null;
};

export type SentMessageDto = {
    readonly conversation: ConversationDto;
    readonly message: ChatMessageDto;
};

export type UnreadCountDto = { readonly unreadCount: number };

export type NewMessage = {
    readonly recipientUserId: number;
    readonly text: string;
};
