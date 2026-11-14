import type { DemoPartnerNote, DemoQuoteRequest, DemoQuoteResult } from '../dto/quote-request-demo.dto';

export interface IQuoteRequestDemoService {
    add(quotes: readonly DemoQuoteRequest[], notes: readonly DemoPartnerNote[]): Promise<DemoQuoteResult>;
    remove(partnerIds: readonly number[], userIds: readonly number[], write: boolean): Promise<number>;
}
