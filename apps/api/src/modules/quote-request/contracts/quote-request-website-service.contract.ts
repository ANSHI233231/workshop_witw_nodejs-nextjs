import type { MyQuoteRequestsDto, NewQuoteRequest, SentQuoteRequestDto } from '../dto/quote-request.dto';

export interface IQuoteRequestWebsiteService {
    send(userId: number, quote: NewQuoteRequest): Promise<SentQuoteRequestDto>;
    mine(userId: number): Promise<MyQuoteRequestsDto>;
}
