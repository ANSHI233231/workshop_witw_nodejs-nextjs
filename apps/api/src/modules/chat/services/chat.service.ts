import { ClientApp } from '../../../core/context';
import { ConflictException, ForbiddenException, NotFoundException, ValidationException } from '../../../core/exceptions';
import type { EventStream } from '../../../core/http';
import { logger } from '../../../core/logger';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import { type INotificationService, NotificationKind } from '../../notification';
import type { IPartnerService } from '../../partner';
import type { IUsersService } from '../../users';
import type { IChatRepository } from '../contracts/chat-repository.contract';
import type { IChatService } from '../contracts/chat-service.contract';
import type {
    ChatPartnerDto,
    ConversationDetailDto,
    ConversationDto,
    ConversationListDto,
    NewMessage,
    SentMessageDto,
    UnreadCountDto,
} from '../dto/chat.dto';
import { toChatUser, toConversation, toMessage } from '../mappers/chat.mapper';
import { ACTIVE_USER_STATUS, CHAT_LIMITS, ChatEvent, type ConversationRow } from '../types/chat.types';
import { CHAT_MESSAGES } from '../validators/chat.validators';
import type { ChatStreams } from './chat-streams';

const log = logger.category('chat');

const partnerRefused = (): ForbiddenException => new ForbiddenException(CHAT_MESSAGES.PARTNER, 'CHAT_PARTNER');

const conversationNotFound = (): NotFoundException =>
    new NotFoundException(CHAT_MESSAGES.CONVERSATION_NOT_FOUND, 'CHAT_CONVERSATION_NOT_FOUND');

const recipientNotFound = (): NotFoundException =>
    new NotFoundException(CHAT_MESSAGES.RECIPIENT_NOT_FOUND, 'CHAT_RECIPIENT_NOT_FOUND');

const recipientDeactivated = (): ConflictException =>
    new ConflictException(CHAT_MESSAGES.RECIPIENT_DEACTIVATED, 'CHAT_RECIPIENT_DEACTIVATED');

const recipientPartner = (): ForbiddenException =>
    new ForbiddenException(CHAT_MESSAGES.RECIPIENT_PARTNER, 'CHAT_RECIPIENT_PARTNER');

const toSelf = (): ValidationException =>
    new ValidationException(CHAT_MESSAGES.SELF, [{ field: 'recipientUserId', message: CHAT_MESSAGES.SELF }], 'CHAT_SELF');

const pairOf = (a: number, b: number): readonly [number, number] => (a < b ? [a, b] : [b, a]);

export class ChatService implements IChatService {
    constructor(
        private readonly db: Database,
        private readonly repository: IChatRepository,
        private readonly auditService: IAuditService,
        private readonly usersService: IUsersService,
        private readonly partnerService: IPartnerService,
        private readonly notificationService: INotificationService,
        private readonly streams: ChatStreams,
    ) {}

    async conversations(userId: number): Promise<ConversationListDto> {
        await this.refusePartner(userId);
        const [rows, unreadCount] = await Promise.all([
            this.repository.conversationsOf(this.db, userId),
            this.repository.unreadCountOf(this.db, userId),
        ]);
        return { items: await this.toConversations(rows, userId), unreadCount };
    }

    async conversation(userId: number, conversationId: number): Promise<ConversationDetailDto> {
        await this.refusePartner(userId);
        const row = await this.repository.conversationOf(this.db, conversationId, userId);
        if (!row) throw conversationNotFound();
        const [conversation] = await this.toConversations([row], userId);
        const messages = await this.repository.messagesOf(this.db, conversationId);
        if (!conversation) throw conversationNotFound();
        return { conversation, messages: messages.map((message) => toMessage(message, userId)) };
    }

    async withUser(userId: number, otherUserId: number): Promise<ChatPartnerDto> {
        await this.refusePartner(userId);
        if (otherUserId === userId) throw toSelf();
        const other = await this.repository.chatUser(this.db, otherUserId);
        if (!other || other.status !== ACTIVE_USER_STATUS) throw recipientNotFound();
        if (await this.partnerService.partnerOf(otherUserId)) throw recipientPartner();
        const [first, second] = pairOf(userId, otherUserId);
        return {
            otherUser: toChatUser(other, false),
            conversationId: await this.repository.findPair(this.db, first, second),
        };
    }

    async send(userId: number, message: NewMessage): Promise<SentMessageDto> {
        const event = { action: AuditAction.CHAT_MESSAGE_SENT, entityType: AuditEntity.CHAT_MESSAGE } as const;
        let sent: { readonly conversationId: number; readonly messageId: number };
        try {
            sent = await this.db.transaction(async () => {
                await this.refusePartner(userId);
                if (message.recipientUserId === userId) throw toSelf();
                const sender = await this.usersService.findActiveById(userId);
                if (!sender) throw new NotFoundException(CHAT_MESSAGES.ACCOUNT_NOT_FOUND, 'USER_NOT_FOUND');
                const recipient = await this.repository.chatUser(this.db, message.recipientUserId);
                if (!recipient) throw recipientNotFound();
                if (recipient.status !== ACTIVE_USER_STATUS) throw recipientDeactivated();
                if (await this.partnerService.partnerOf(recipient.id)) throw recipientPartner();
                const [first, second] = pairOf(userId, recipient.id);
                const existing = await this.repository.findPair(this.db, first, second);
                const conversationId = await this.repository.openPair(this.db, first, second, userId);
                const messageId = await this.repository.insertMessage(this.db, conversationId, userId, message.text);
                await this.repository.touchConversation(this.db, conversationId, messageId, userId);
                await this.auditService.record({
                    ...event,
                    entityId: messageId,
                    changes: { conversationId, recipientUserId: recipient.id, length: message.text.length },
                    details: { conversationCreated: existing === null },
                });
                await this.notificationService.notify([
                    {
                        userId: recipient.id,
                        notificationKind: NotificationKind.CHAT_MESSAGE_RECEIVED,
                        entityType: AuditEntity.CHAT_CONVERSATION,
                        entityId: conversationId,
                        clientApp: ClientApp.WEB,
                        ownerType: null,
                        ownerId: null,
                        title: sender.name.slice(0, CHAT_LIMITS.NAME_MAX),
                        excerpt: null,
                        actorId: userId,
                    },
                ]);
                return { conversationId, messageId };
            });
        } catch (error) {
            await this.auditService.recordFailure(
                {
                    ...event,
                    action: AuditAction.CHAT_MESSAGE_SEND_FAILED,
                    details: { recipientUserId: message.recipientUserId, length: message.text.length },
                },
                error,
            );
            throw error;
        }
        const result = await this.sentFor(userId, sent.conversationId, sent.messageId);
        await this.publishMessage(sent.conversationId, sent.messageId, userId);
        return result;
    }

    async markRead(userId: number, conversationId: number): Promise<UnreadCountDto> {
        await this.refusePartner(userId);
        const row = await this.repository.conversationOf(this.db, conversationId, userId);
        if (!row) throw conversationNotFound();
        const event = {
            action: AuditAction.CHAT_CONVERSATION_READ,
            entityType: AuditEntity.CHAT_CONVERSATION,
            entityId: conversationId,
        } as const;
        try {
            await this.db.transaction(async () => {
                const count = await this.repository.markRead(this.db, conversationId, userId);
                if (count > 0) await this.auditService.record({ ...event, details: { messagesRead: count } });
            });
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.CHAT_CONVERSATION_READ_FAILED }, error);
            throw error;
        }
        const unread = await this.unreadCount(userId);
        this.streams.publish(userId, ChatEvent.UNREAD, unread);
        return unread;
    }

    async unreadCount(userId: number): Promise<UnreadCountDto> {
        await this.refusePartner(userId);
        return { unreadCount: await this.repository.unreadCountOf(this.db, userId) };
    }

    async openStream(userId: number): Promise<UnreadCountDto> {
        return this.unreadCount(userId);
    }

    attachStream(userId: number, stream: EventStream, start: UnreadCountDto): void {
        this.streams.add(userId, stream);
        stream.send(ChatEvent.UNREAD, start);
    }

    private async sentFor(userId: number, conversationId: number, messageId: number): Promise<SentMessageDto> {
        const [conversation, message] = await Promise.all([
            this.conversationFor(conversationId, userId),
            this.repository.messageById(this.db, messageId),
        ]);
        if (!conversation || !message) throw conversationNotFound();
        return { conversation, message: toMessage(message, userId) };
    }

    private async publishMessage(conversationId: number, messageId: number, senderId: number): Promise<void> {
        const row = await this.repository.conversationOf(this.db, conversationId, senderId);
        if (!row) return;
        const recipientId = row.other_user_id;
        const watchers = [senderId, recipientId].filter((id) => this.streams.hasStreams(id));
        try {
            for (const watcherId of watchers) {
                const sent = await this.sentFor(watcherId, conversationId, messageId);
                this.streams.publish(watcherId, ChatEvent.MESSAGE, sent);
                if (watcherId === recipientId) this.streams.publish(watcherId, ChatEvent.UNREAD, await this.unreadOf(watcherId));
            }
        } catch (error) {
            log.error('Could not push a new message to the open streams', { conversationId, messageId, error });
        }
    }

    private async unreadOf(userId: number): Promise<UnreadCountDto> {
        return { unreadCount: await this.repository.unreadCountOf(this.db, userId) };
    }

    private async conversationFor(conversationId: number, userId: number): Promise<ConversationDto | undefined> {
        const row = await this.repository.conversationOf(this.db, conversationId, userId);
        return row ? (await this.toConversations([row], userId))[0] : undefined;
    }

    private async toConversations(rows: readonly ConversationRow[], viewerId: number): Promise<ConversationDto[]> {
        const partners = await this.partnerService.partnersOf(rows.map((row) => row.other_user_id));
        return rows.map((row) => toConversation(row, viewerId, partners.has(row.other_user_id)));
    }

    private async refusePartner(userId: number): Promise<void> {
        if (await this.partnerService.partnerOf(userId)) throw partnerRefused();
    }
}
