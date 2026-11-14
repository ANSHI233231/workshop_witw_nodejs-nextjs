import type { PortalQuoteRequestDto, PortalQuoteRequestsDto, PortalQuoteSummaryDto } from '../dto/quote-request.dto';
import type { QuoteMarkCode } from '../types/quote-request.types';

export interface IQuoteRequestPortalService {
    list(userId: number): Promise<PortalQuoteRequestsDto>;
    summary(userId: number): Promise<PortalQuoteSummaryDto>;
    mark(userId: number, id: number, mark: QuoteMarkCode): Promise<PortalQuoteRequestDto>;
}
