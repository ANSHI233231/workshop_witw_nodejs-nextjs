import type { ParkRegionCode, ParkStatusCode, ParkWebsiteSortKey } from '../types/park.types';

export type ParkOptionDto = {
    readonly id: number;
    readonly name: string;
};

export type ParkStateDto = {
    readonly id: number;
    readonly name: string;
    readonly status: ParkStatusCode;
};

export type ParkPrice = {
    readonly avgSafariPriceMin: number | null;
    readonly avgSafariPriceMax: number | null;
    readonly packageCount: number;
};

export type ParkDto = ParkPrice & {
    readonly id: number;
    readonly name: string;
    readonly slug: string;
    readonly region: ParkRegionCode;
    readonly featureImage: string | null;
    readonly upcomingSafariCount: number;
    readonly status: ParkStatusCode;
};

export type UpcomingSafariDto = {
    readonly id: number;
    readonly title: string;
    readonly startDate: string;
    readonly endDate: string;
    readonly status: number;
    readonly hostName: string;
};

export type ParkDetailDto = ParkDto & {
    readonly shortDescription: string | null;
    readonly latitude: number | null;
    readonly longitude: number | null;
    readonly officialWebsite: string | null;
    readonly upcomingSafaris: readonly UpcomingSafariDto[];
};

export type ParkInput = {
    readonly name: string;
    readonly region: ParkRegionCode;
    readonly shortDescription: string | null;
    readonly latitude: number | null;
    readonly longitude: number | null;
};

export type ParkUpdate = ParkInput & { readonly status: ParkStatusCode };

export type ParkFilters = {
    readonly search: string | undefined;
    readonly region: ParkRegionCode | undefined;
    readonly status: ParkStatusCode | undefined;
};

export type ParkPage = {
    readonly items: readonly ParkDto[];
    readonly total: number;
};

export type ParkPriceRange = {
    readonly masterParkId: number;
    readonly lowestPricePerPerson: number;
    readonly highestPricePerPerson: number;
    readonly packageCount: number;
};

export type WebsiteParkQuery = {
    readonly search: string | undefined;
    readonly region: ParkRegionCode | undefined;
    readonly sort: ParkWebsiteSortKey;
    readonly page: number;
};

export type WebsiteParkCardDto = ParkPrice & {
    readonly id: number;
    readonly name: string;
    readonly slug: string;
    readonly region: ParkRegionCode;
    readonly featureImage: string | null;
};

export type WebsiteParkPageDto = WebsiteParkCardDto & {
    readonly shortDescription: string | null;
    readonly latitude: number | null;
    readonly longitude: number | null;
    readonly officialWebsite: string | null;
};

export type WebsiteParkList = {
    readonly items: readonly WebsiteParkCardDto[];
    readonly page: number;
    readonly limit: number;
    readonly total: number;
};

export type ParkFeatureImage = {
    readonly content: Buffer;
    readonly contentType: string;
};
