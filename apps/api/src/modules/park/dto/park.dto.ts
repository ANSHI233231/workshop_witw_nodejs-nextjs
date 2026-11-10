import type { ParkRegionCode, ParkStatusCode } from '../types/park.types';

export type ParkOptionDto = {
    readonly id: number;
    readonly name: string;
};

export type ParkStateDto = {
    readonly id: number;
    readonly name: string;
    readonly status: ParkStatusCode;
};

export type ParkDto = {
    readonly id: number;
    readonly name: string;
    readonly slug: string;
    readonly region: ParkRegionCode;
    readonly avgSafariPriceMin: number | null;
    readonly avgSafariPriceMax: number | null;
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
    readonly featureImage: string | null;
    readonly latitude: number | null;
    readonly longitude: number | null;
    readonly officialWebsite: string | null;
    readonly upcomingSafaris: readonly UpcomingSafariDto[];
};

export type ParkInput = {
    readonly name: string;
    readonly region: ParkRegionCode;
    readonly avgSafariPriceMin: number | null;
    readonly avgSafariPriceMax: number | null;
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
