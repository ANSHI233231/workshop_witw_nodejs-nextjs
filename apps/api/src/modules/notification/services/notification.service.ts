import { NotFoundException } from '../../../core/exceptions';
import type { PaginationQuery } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { INotificationTemplateRepository } from '../contracts/delivery-repository.contract';
import type { INotificationRepository, NotificationQuery } from '../contracts/notification-repository.contract';
import type {
    INotificationFeedService,
    INotificationService,
    TestNotification,
} from '../contracts/notification-service.contract';
import type {
    NewNotification,
    NotificationCountsDto,
    NotificationDto,
    NotificationFilters,
    NotificationPage,
    NotificationPlace,
} from '../dto/notification.dto';
import {
    KIND_TABS_OF_APP,
    KINDS_OF_TAB,
    NOTIFICATION_LIMITS,
    NotificationKind,
    type NotificationKindCode,
    type NotificationKindCountRow,
    type NotificationKindTab,
    type NotificationRow,
    NotificationTab,
    type NotificationTabKey,
} from '../types/notification.types';

const kindsOfTab = (tab: NotificationTabKey): readonly NotificationKindCode[] | undefined =>
    tab === NotificationTab.ALL || tab === NotificationTab.UNREAD ? undefined : KINDS_OF_TAB[tab];

const countOfKinds = (rows: readonly NotificationKindCountRow[], kinds: readonly number[]): number =>
    rows.filter((row) => kinds.includes(row.notificationKind)).reduce((sum, row) => sum + Number(row.total), 0);

const notFound = (): NotFoundException =>
    new NotFoundException('This notification was not found.', 'NOTIFICATION_NOT_FOUND');

const fit = (text: string | null, max: number): string | null =>
    text === null ? null : text.length > max ? `${text.slice(0, max - 1)}…` : text;

const toDto = (row: NotificationRow, userId: number, titleTemplate: string | null): NotificationDto => ({
    id: row.id,
    notificationKind: row.notificationKind,
    entityType: row.entityType,
    entityId: row.entityId,
    title: row.title,
    excerpt: row.excerpt,
    isRead: row.readAt !== null,
    createdAt: row.createdAt,
    actorName: row.actorName,
    actorIsYou: row.actorId === userId,
    titleTemplate,
});

const inBatches = async <T>(rows: readonly T[], write: (batch: readonly T[]) => Promise<unknown>): Promise<void> => {
    for (let start = 0; start < rows.length; start += NOTIFICATION_LIMITS.INSERT_BATCH) {
        await write(rows.slice(start, start + NOTIFICATION_LIMITS.INSERT_BATCH));
    }
};

export class NotificationService implements INotificationService, INotificationFeedService {
    constructor(
        private readonly db: Database,
        private readonly repository: INotificationRepository,
        private readonly templateRepository: INotificationTemplateRepository,
        private readonly auditService: IAuditService,
    ) {}

    async notify(notifications: readonly NewNotification[]): Promise<void> {
        const rows = notifications.map((row) => ({
            ...row,
            title: fit(row.title, NOTIFICATION_LIMITS.TITLE_MAX) ?? '',
            excerpt: fit(row.excerpt, NOTIFICATION_LIMITS.EXCERPT_MAX),
        }));
        await inBatches(rows, (batch) => this.repository.insert(this.db, batch));
    }

    async markEntityRead(userId: number, entityType: number, entityId: number): Promise<void> {
        await this.repository.markEntityRead(this.db, userId, entityType, entityId);
    }

    async sendTest(notification: TestNotification): Promise<void> {
        const event = {
            action: AuditAction.NOTIFICATION_TEST_SENT,
            entityType: AuditEntity.USER,
            entityId: notification.userId,
            details: { clientApp: notification.clientApp, message: notification.message },
        } as const;
        try {
            await this.db.transaction(async () => {
                await this.notify([
                    {
                        userId: notification.userId,
                        notificationKind: NotificationKind.TEST,
                        entityType: AuditEntity.USER,
                        entityId: notification.userId,
                        clientApp: notification.clientApp,
                        ownerType: null,
                        ownerId: null,
                        title: notification.message,
                        excerpt: null,
                        actorId: notification.actorId,
                    },
                ]);
                await this.auditService.record(event);
            });
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.NOTIFICATION_TEST_FAILED }, error);
            throw error;
        }
    }

    async list(userId: number, filters: NotificationFilters, pagination: PaginationQuery): Promise<NotificationPage> {
        const query: NotificationQuery = {
            userId,
            place: filters.place,
            unreadOnly: filters.tab === NotificationTab.UNREAD,
            kinds: kindsOfTab(filters.tab),
        };
        const [rows, total, templates] = await Promise.all([
            this.repository.list(this.db, query, pagination),
            this.repository.count(this.db, query),
            this.templateRepository.active(this.db),
        ]);
        const titleOfKind = new Map(templates.map((template) => [template.notificationKind, template.titleTemplate]));
        return {
            items: rows.map((row) => toDto(row, userId, titleOfKind.get(row.notificationKind) ?? null)),
            total,
        };
    }

    async counts(userId: number, place: NotificationPlace): Promise<NotificationCountsDto> {
        const rows = await this.repository.countsByKind(this.db, userId, place);
        const tabs: readonly NotificationKindTab[] = KIND_TABS_OF_APP[place.clientApp] ?? [];
        return {
            all: rows.reduce((sum, row) => sum + Number(row.total), 0),
            unread: rows.reduce((sum, row) => sum + Number(row.unread), 0),
            ...Object.fromEntries(tabs.map((tab) => [tab, countOfKinds(rows, KINDS_OF_TAB[tab])])),
        };
    }

    unreadCount(userId: number, place: NotificationPlace): Promise<number> {
        return this.repository.unreadCount(this.db, userId, place);
    }

    async markRead(userId: number, id: number): Promise<void> {
        if (!(await this.repository.markRead(this.db, id, userId))) throw notFound();
    }

    async markUnread(userId: number, id: number): Promise<void> {
        if (!(await this.repository.markUnread(this.db, id, userId))) throw notFound();
    }

    markAllRead(userId: number, place: NotificationPlace): Promise<number> {
        return this.repository.markAllRead(this.db, userId, place);
    }
}
