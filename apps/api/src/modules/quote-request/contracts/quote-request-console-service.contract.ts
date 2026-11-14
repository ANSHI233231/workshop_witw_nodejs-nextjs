import type { PaginationQuery } from '../../../core/validation';
import type { ConsoleQuoteFilters, ConsoleQuotePage, ConsoleQuoteRequestDto } from '../dto/quote-request.dto';
import type { QuoteRequestStatusCode } from '../types/quote-request.types';

export interface IQuoteRequestConsoleService {
    list(filters: ConsoleQuoteFilters, pagination: PaginationQuery): Promise<ConsoleQuotePage>;
    detail(id: number): Promise<ConsoleQuoteRequestDto>;
    setStatus(id: number, status: QuoteRequestStatusCode, actorId: number): Promise<ConsoleQuoteRequestDto>;
    notifyPartner(id: number, message: string, actorId: number): Promise<ConsoleQuoteRequestDto>;
}
