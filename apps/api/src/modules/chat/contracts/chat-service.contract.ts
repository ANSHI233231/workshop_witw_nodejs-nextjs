import type { EventStream } from '../../../core/http';
import type {
    ChatPartnerDto,
    ConversationDetailDto,
    ConversationListDto,
    NewMessage,
    SentMessageDto,
    UnreadCountDto,
} from '../dto/chat.dto';

export interface IChatService {
    conversations(userId: number): Promise<ConversationListDto>;
    conversation(userId: number, conversationId: number): Promise<ConversationDetailDto>;
    withUser(userId: number, otherUserId: number): Promise<ChatPartnerDto>;
    send(userId: number, message: NewMessage): Promise<SentMessageDto>;
    markRead(userId: number, conversationId: number): Promise<UnreadCountDto>;
    unreadCount(userId: number): Promise<UnreadCountDto>;
    openStream(userId: number): Promise<UnreadCountDto>;
    attachStream(userId: number, stream: EventStream, start: UnreadCountDto): void;
}
