import { ClientApp } from '../../../core/context';
import { ForbiddenException, NotFoundException } from '../../../core/exceptions';
import { AuditAction, AuditEntity } from '../../audit';
import { type INotificationService, NotificationKind } from '../../notification';
import type { IPackageService, ShownPackageRef } from '../../package';
import type { IPartnerService } from '../../partner';
import type { IUsersService } from '../../users';
import type { IQuoteRequestWebsiteService } from '../contracts/quote-request-website-service.contract';
import type {
    MyQuoteRequestsDto,
    NewQuoteRequest,
    QuoteSender,
    SentQuoteRequestDto,
} from '../dto/quote-request.dto';
import { toMine } from '../mappers/quote-request.mapper';
import { QUOTE_LIMITS, QuoteRequestStatus } from '../types/quote-request.types';
import { QUOTE_MESSAGES } from '../validators/quote-request.validators';
import type { QuoteRequestRecords } from './quote-request-records';

const ACTIONS = { done: AuditAction.QUOTE_REQUEST_SENT, failed: AuditAction.QUOTE_REQUEST_SEND_FAILED } as const;

const partnerCannotSend = (): ForbiddenException =>
    new ForbiddenException(QUOTE_MESSAGES.PARTNER_CANNOT_SEND, 'QUOTE_REQUEST_PARTNER');

const packageNotAvailable = (): NotFoundException =>
    new NotFoundException(QUOTE_MESSAGES.PACKAGE_NOT_AVAILABLE, 'QUOTE_PACKAGE_NOT_AVAILABLE');

const accountNotFound = (): NotFoundException =>
    new NotFoundException(QUOTE_MESSAGES.ACCOUNT_NOT_FOUND, 'USER_NOT_FOUND');

export class QuoteRequestWebsiteService implements IQuoteRequestWebsiteService {
    constructor(
        private readonly records: QuoteRequestRecords,
        private readonly packageService: IPackageService,
        private readonly partnerService: IPartnerService,
        private readonly usersService: IUsersService,
        private readonly notificationService: INotificationService,
    ) {}

    async send(userId: number, quote: NewQuoteRequest): Promise<SentQuoteRequestDto> {
        return this.records.audited(ACTIONS, undefined, { ...quote }, async () => {
            const partner = await this.partnerService.partnerOf(userId);
            if (partner) throw partnerCannotSend();
            const shown = await this.packageService.shownPackage(quote.packageId);
            if (!shown) throw packageNotAvailable();
            if (shown.partnerUserId === userId) throw partnerCannotSend();
            const sender = await this.senderOf(userId);
            const id = await this.records.repository.insert(this.records.db, {
                userId,
                partnerId: shown.partnerId,
                packageId: shown.packageId,
                packageVersionId: shown.liveVersionId,
                travellerCount: quote.travellerCount,
                startDate: quote.startDate,
                notes: quote.notes,
                userName: sender.name,
                userEmail: sender.email,
                userMobile: sender.mobile,
            });
            await this.notifyPartner(id, shown, userId);
            return {
                result: toMine(await this.records.row(id)),
                id,
                changes: {
                    packageId: shown.packageId,
                    packageVersionId: shown.liveVersionId,
                    versionNumber: shown.liveVersionNumber,
                    partnerId: shown.partnerId,
                    travellerCount: quote.travellerCount,
                    startDate: quote.startDate,
                    status: QuoteRequestStatus.ACTIVE,
                },
            };
        });
    }

    async mine(userId: number): Promise<MyQuoteRequestsDto> {
        const [partner, rows] = await Promise.all([
            this.partnerService.partnerOf(userId),
            this.records.repository.listOfUser(this.records.db, userId),
        ]);
        return { isPartner: partner !== null, items: rows.map(toMine) };
    }

    private async senderOf(userId: number): Promise<QuoteSender> {
        const user = await this.usersService.findActiveById(userId);
        if (!user) throw accountNotFound();
        return {
            userId,
            name: user.name.slice(0, QUOTE_LIMITS.USER_NAME_MAX),
            email: user.email,
            mobile: user.mobile,
        };
    }

    private async notifyPartner(id: number, shown: ShownPackageRef, actorId: number): Promise<void> {
        await this.notificationService.notify([
            {
                userId: shown.partnerUserId,
                notificationKind: NotificationKind.QUOTE_REQUEST_RECEIVED,
                entityType: AuditEntity.QUOTE_REQUEST,
                entityId: id,
                clientApp: ClientApp.PARTNER,
                ownerType: null,
                ownerId: null,
                title: shown.name,
                excerpt: null,
                actorId,
            },
        ]);
    }
}
