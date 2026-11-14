import type { QuoteRequestTestData, QuoteRequestTestDataScope } from '../dto/quote-request-test-data.dto';

export interface IQuoteRequestTestDataService {
    find(scope: QuoteRequestTestDataScope): Promise<QuoteRequestTestData>;
    remove(found: QuoteRequestTestData): Promise<number>;
}
