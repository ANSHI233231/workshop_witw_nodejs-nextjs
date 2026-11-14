export const QuoteMark = {
    HOT: 1,
    COLD: 2,
} as const;

export type QuoteMarkCode = (typeof QuoteMark)[keyof typeof QuoteMark];

export type PortalQuoteRequest = {
    readonly id: number;
    readonly user: { readonly name: string; readonly phone: string | null };
    readonly package: {
        readonly id: number;
        readonly slug: string;
        readonly name: string;
        readonly versionNumber: number;
    };
    readonly travellerCount: number;
    readonly startDate: string;
    readonly notes: string;
    readonly receivedAt: string;
    readonly mark: QuoteMarkCode | null;
    readonly markedAt: string | null;
};

export type PortalQuoteRequestList = {
    readonly isPhoneShown: boolean;
    readonly total: number;
    readonly items: readonly PortalQuoteRequest[];
};

export type PortalQuoteSummary = {
    readonly activeCount: number;
};
