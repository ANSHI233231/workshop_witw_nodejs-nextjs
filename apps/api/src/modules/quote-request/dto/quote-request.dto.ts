import type { QuoteMarkCode, QuoteRequestStatusCode } from '../types/quote-request.types';

export type NewQuoteRequest = {
    readonly packageId: number;
    readonly travellerCount: number;
    readonly startDate: string;
    readonly notes: string;
};

export type QuotePackageDto = {
    readonly id: number;
    readonly slug: string;
    readonly name: string;
    readonly versionNumber: number;
};

export type MyQuoteRequestDto = {
    readonly id: number;
    readonly package: QuotePackageDto;
    readonly partner: { readonly id: number; readonly businessName: string };
    readonly travellerCount: number;
    readonly startDate: string;
    readonly notes: string;
    readonly sentAt: string;
};

export type MyQuoteRequestsDto = {
    readonly isPartner: boolean;
    readonly items: readonly MyQuoteRequestDto[];
};

export type SentQuoteRequestDto = MyQuoteRequestDto;

export type PortalQuoteRequestDto = {
    readonly id: number;
    readonly user: { readonly name: string; readonly phone: string | null };
    readonly package: QuotePackageDto;
    readonly travellerCount: number;
    readonly startDate: string;
    readonly notes: string;
    readonly receivedAt: string;
    readonly mark: QuoteMarkCode | null;
    readonly markedAt: string | null;
};

export type PortalQuoteRequestsDto = {
    readonly isPhoneShown: boolean;
    readonly total: number;
    readonly items: readonly PortalQuoteRequestDto[];
};

export type PortalQuoteSummaryDto = { readonly activeCount: number };

export type ConsoleQuoteRequestDto = {
    readonly id: number;
    readonly user: { readonly id: number; readonly name: string; readonly email: string | null; readonly mobile: string | null };
    readonly package: QuotePackageDto;
    readonly partner: { readonly id: number; readonly businessName: string };
    readonly travellerCount: number;
    readonly startDate: string;
    readonly notes: string;
    readonly receivedAt: string;
    readonly mark: QuoteMarkCode | null;
    readonly markedAt: string | null;
    readonly status: QuoteRequestStatusCode;
};

export type ConsoleQuoteFilters = {
    readonly search: string | undefined;
    readonly status: QuoteRequestStatusCode | undefined;
};

export type ConsoleQuotePage = {
    readonly items: readonly ConsoleQuoteRequestDto[];
    readonly total: number;
};

export type QuoteSender = {
    readonly userId: number;
    readonly name: string;
    readonly email: string | null;
    readonly mobile: string | null;
};

export type QuoteRequestInsert = {
    readonly userId: number;
    readonly partnerId: number;
    readonly packageId: number;
    readonly packageVersionId: number;
    readonly travellerCount: number;
    readonly startDate: string;
    readonly notes: string;
    readonly userName: string;
    readonly userEmail: string | null;
    readonly userMobile: string | null;
};
