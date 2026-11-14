import { ForbiddenException } from '../../../core/exceptions';
import { AuditAction } from '../../audit';
import type { IPartnerService, PartnerRef } from '../../partner';
import type { IQuoteRequestPortalService } from '../contracts/quote-request-portal-service.contract';
import type {
    PortalQuoteRequestDto,
    PortalQuoteRequestsDto,
    PortalQuoteSummaryDto,
} from '../dto/quote-request.dto';
import { toPortal } from '../mappers/quote-request.mapper';
import { type QuoteMarkCode, QuoteRequestStatus } from '../types/quote-request.types';
import { QUOTE_MESSAGES } from '../validators/quote-request.validators';
import { quoteNotActive, quoteNotFound, type QuoteRequestRecords } from './quote-request-records';

const ACTIONS = { done: AuditAction.QUOTE_REQUEST_MARKED, failed: AuditAction.QUOTE_REQUEST_MARK_FAILED } as const;

const notActivePartner = (): ForbiddenException =>
    new ForbiddenException(QUOTE_MESSAGES.NOT_ACTIVE_PARTNER, 'QUOTE_REQUEST_PARTNER_NOT_ACTIVE');

export class QuoteRequestPortalService implements IQuoteRequestPortalService {
    constructor(
        private readonly records: QuoteRequestRecords,
        private readonly partnerService: IPartnerService,
    ) {}

    async list(userId: number): Promise<PortalQuoteRequestsDto> {
        const partner = await this.activePartner(userId);
        const rows = await this.records.repository.listOfPartner(this.records.db, partner.id);
        return {
            isPhoneShown: partner.isPhoneShown,
            total: rows.length,
            items: rows.map((row) => toPortal(row, partner.isPhoneShown)),
        };
    }

    async summary(userId: number): Promise<PortalQuoteSummaryDto> {
        const partner = await this.activePartner(userId);
        return { activeCount: await this.records.repository.countOfPartner(this.records.db, partner.id) };
    }

    async mark(userId: number, id: number, mark: QuoteMarkCode): Promise<PortalQuoteRequestDto> {
        const partner = await this.activePartner(userId);
        return this.records.audited(ACTIONS, id, { mark }, async () => {
            const before = await this.records.repository.findById(this.records.db, id);
            if (!before || before.partner_id !== partner.id || before.status !== QuoteRequestStatus.ACTIVE) {
                throw quoteNotFound();
            }
            if (!(await this.records.repository.mark(this.records.db, id, partner.id, mark, userId))) throw quoteNotActive();
            return {
                result: toPortal(await this.records.row(id), partner.isPhoneShown),
                id,
                changes: { mark: { from: before.mark, to: mark } },
            };
        });
    }

    private async activePartner(userId: number): Promise<PartnerRef> {
        const partner = await this.partnerService.activePartnerOf(userId);
        if (!partner) throw notActivePartner();
        return partner;
    }
}
