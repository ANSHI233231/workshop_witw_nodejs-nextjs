export const QuoteRequestStatus = {
    ACTIVE: 1,
    INACTIVE: 2,
} as const;

export type QuoteRequestStatusCode = (typeof QuoteRequestStatus)[keyof typeof QuoteRequestStatus];

export const QUOTE_REQUEST_STATUSES: readonly QuoteRequestStatusCode[] = [
    QuoteRequestStatus.ACTIVE,
    QuoteRequestStatus.INACTIVE,
];

export const QuoteMark = {
    HOT: 1,
    COLD: 2,
} as const;

export type QuoteMarkCode = (typeof QuoteMark)[keyof typeof QuoteMark];

export const QUOTE_REQUEST_LIMITS = {
    SEARCH: 100,
    MESSAGE_MAX: 255,
} as const;

export type QuoteRequest = {
    readonly id: number;
    readonly user: {
        readonly id: number;
        readonly name: string;
        readonly email: string | null;
        readonly mobile: string | null;
    };
    readonly package: {
        readonly id: number;
        readonly slug: string;
        readonly name: string;
        readonly versionNumber: number;
    };
    readonly partner: { readonly id: number; readonly businessName: string };
    readonly travellerCount: number;
    readonly startDate: string;
    readonly notes: string;
    readonly receivedAt: string;
    readonly mark: QuoteMarkCode | null;
    readonly markedAt: string | null;
    readonly status: QuoteRequestStatusCode;
};

export type QuoteRequestFilters = {
    readonly search: string;
    readonly status: QuoteRequestStatusCode | undefined;
    readonly page: number;
};
