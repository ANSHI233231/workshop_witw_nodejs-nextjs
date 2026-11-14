export const QUOTE_LIMITS = {
    TRAVELLERS_MIN: 1,
    TRAVELLERS_MAX: 100,
    NOTES_MAX: 1000,
} as const;

export type QuoteRequestInput = {
    readonly packageId: number;
    readonly travellerCount: number;
    readonly startDate: string;
    readonly notes: string;
};

export type MyQuoteRequest = {
    readonly id: number;
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
    readonly sentAt: string;
};

export type MyQuoteRequests = {
    readonly isPartner: boolean;
    readonly items: readonly MyQuoteRequest[];
};
