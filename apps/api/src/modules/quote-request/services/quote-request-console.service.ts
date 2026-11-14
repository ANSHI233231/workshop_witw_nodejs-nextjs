import { ClientApp } from '../../../core/context';
import { ConflictException } from '../../../core/exceptions';
import type { PaginationQuery } from '../../../core/validation';
import { AuditAction, AuditEntity } from '../../audit';
import { type INotificationService, NotificationKind } from '../../notification';
import type { IQuoteRequestConsoleService } from '../contracts/quote-request-console-service.contract';
import type { ConsoleQuoteFilters, ConsoleQuotePage, ConsoleQuoteRequestDto } from '../dto/quote-request.dto';
import { toConsole } from '../mappers/quote-request.mapper';
import { QuoteRequestStatus, type QuoteRequestStatusCode } from '../types/quote-request.types';
import { QUOTE_MESSAGES } from '../validators/quote-request.validators';
import type { QuoteRequestRecords } from './quote-request-records';

const STATUS_ACTIONS = {
    [QuoteRequestStatus.INACTIVE]: {
        done: AuditAction.QUOTE_REQUEST_MADE_INACTIVE,
        failed: AuditAction.QUOTE_REQUEST_MAKE_INACTIVE_FAILED,
    },
    [QuoteRequestStatus.ACTIVE]: {
        done: AuditAction.QUOTE_REQUEST_MADE_ACTIVE,
        failed: AuditAction.QUOTE_REQUEST_MAKE_ACTIVE_FAILED,
    },
} as const;

const NOTIFY_ACTIONS = {
    done: AuditAction.QUOTE_REQUEST_PARTNER_NOTIFIED,
    failed: AuditAction.QUOTE_REQUEST_PARTNER_NOTIFY_FAILED,
} as const;

const statusUnchanged = (): ConflictException =>
    new ConflictException(QUOTE_MESSAGES.STATUS_UNCHANGED, 'QUOTE_REQUEST_STATUS_UNCHANGED');

const otherStatus = (status: QuoteRequestStatusCode): QuoteRequestStatusCode =>
    status === QuoteRequestStatus.ACTIVE ? QuoteRequestStatus.INACTIVE : QuoteRequestStatus.ACTIVE;

export class QuoteRequestConsoleService implements IQuoteRequestConsoleService {
    constructor(
        private readonly records: QuoteRequestRecords,
        private readonly notificationService: INotificationService,
    ) {}

    async list(filters: ConsoleQuoteFilters, pagination: PaginationQuery): Promise<ConsoleQuotePage> {
        const [rows, total] = await Promise.all([
            this.records.repository.listForConsole(this.records.db, filters, pagination),
            this.records.repository.countForConsole(this.records.db, filters),
        ]);
        return { items: rows.map(toConsole), total };
    }

    async detail(id: number): Promise<ConsoleQuoteRequestDto> {
        return toConsole(await this.records.row(id));
    }

    async setStatus(id: number, status: QuoteRequestStatusCode, actorId: number): Promise<ConsoleQuoteRequestDto> {
        return this.records.audited(STATUS_ACTIONS[status], id, { status }, async () => {
            const from = otherStatus(status);
            await this.records.row(id);
            if (!(await this.records.repository.setStatus(this.records.db, id, from, status, actorId))) {
                throw statusUnchanged();
            }
            return {
                result: toConsole(await this.records.row(id)),
                id,
                changes: { status: { from, to: status } },
            };
        });
    }

    async notifyPartner(id: number, message: string, actorId: number): Promise<ConsoleQuoteRequestDto> {
        return this.records.audited(NOTIFY_ACTIONS, id, { message }, async () => {
            const row = await this.records.row(id);
            await this.notificationService.notify([
                {
                    userId: row.partner_user_id,
                    notificationKind: NotificationKind.QUOTE_REQUEST_ADMIN_MESSAGE,
                    entityType: AuditEntity.QUOTE_REQUEST,
                    entityId: id,
                    clientApp: ClientApp.PARTNER,
                    ownerType: null,
                    ownerId: null,
                    title: row.user_name,
                    excerpt: message,
                    actorId,
                },
            ]);
            return {
                result: toConsole(row),
                id,
                changes: { partnerId: row.partner_id, partnerUserId: row.partner_user_id, message },
            };
        });
    }
}
