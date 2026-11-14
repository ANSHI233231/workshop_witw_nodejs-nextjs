import type { QuoteMarkCode, QuoteRequestStatusCode } from '../types/quote-request.types';

export type DemoQuoteRequest = {
    readonly key: string;
    readonly sender: {
        readonly userId: number;
        readonly name: string;
        readonly email: string;
        readonly mobile: string;
    };
    readonly packageSlug: string;
    readonly versionNumber: number;
    readonly travellerCount: number;
    readonly startDate: string;
    readonly notes: string;
    readonly sentAt: Date;
    readonly mark: QuoteMarkCode | null;
    readonly status: QuoteRequestStatusCode;
};

export type DemoPartnerNote =
    | {
          readonly kind: 'received';
          readonly quoteKey: string;
          readonly at: Date;
          readonly isRead: boolean;
      }
    | {
          readonly kind: 'adminMessage';
          readonly quoteKey: string;
          readonly message: string;
          readonly adminId: number;
          readonly at: Date;
          readonly isRead: boolean;
      };

export type DemoQuoteOutcome = {
    readonly key: string;
    readonly quoteRequestId: number | null;
    readonly created: boolean;
    readonly skipped: string | null;
};

export type DemoQuoteResult = {
    readonly quotes: readonly DemoQuoteOutcome[];
    readonly notes: number;
};
