export const ParkStatus = { ACTIVE: 1, INACTIVE: 2 } as const;

export type ParkStatusCode = (typeof ParkStatus)[keyof typeof ParkStatus];

export const ParkRegion = {
    NORTH_INDIA: 1,
    CENTRAL_INDIA: 2,
    WEST_INDIA: 3,
    EAST_INDIA: 4,
    SOUTH_INDIA: 5,
    NORTH_EAST_INDIA: 6,
} as const;

export type ParkRegionCode = (typeof ParkRegion)[keyof typeof ParkRegion];

export const PARK_REGION_LABEL: Readonly<Record<ParkRegionCode, string>> = {
    [ParkRegion.NORTH_INDIA]: 'North India',
    [ParkRegion.CENTRAL_INDIA]: 'Central India',
    [ParkRegion.WEST_INDIA]: 'West India',
    [ParkRegion.EAST_INDIA]: 'East India',
    [ParkRegion.SOUTH_INDIA]: 'South India',
    [ParkRegion.NORTH_EAST_INDIA]: 'North East India',
};

export const PARK_REGIONS: readonly ParkRegionCode[] = Object.values(ParkRegion);

export const PARK_STATUSES: readonly ParkStatusCode[] = Object.values(ParkStatus);

export const PARK_LIMITS = {
    NAME_MAX: 150,
    SEARCH: 100,
    PRICE_MAX: 1_000_000,
} as const;

export const UpcomingSafariStatus = { ACTIVE: 1, SEAT_FULL: 3 } as const;

export type Park = {
    readonly id: number;
    readonly name: string;
    readonly slug: string;
    readonly region: ParkRegionCode;
    readonly avgSafariPriceMin: number | null;
    readonly avgSafariPriceMax: number | null;
    readonly upcomingSafariCount: number;
    readonly status: ParkStatusCode;
};

export type UpcomingSafari = {
    readonly id: number;
    readonly title: string;
    readonly startDate: string;
    readonly endDate: string;
    readonly status: number;
    readonly hostName: string;
};

export type ParkDetail = Park & {
    readonly shortDescription: string | null;
    readonly featureImage: string | null;
    readonly latitude: number | null;
    readonly longitude: number | null;
    readonly officialWebsite: string | null;
    readonly upcomingSafaris: readonly UpcomingSafari[];
};

export type ParkInput = {
    readonly name: string;
    readonly region: ParkRegionCode | null;
    readonly avgSafariPriceMin: number | null;
    readonly avgSafariPriceMax: number | null;
};

export type ParkUpdate = ParkInput & { readonly status: ParkStatusCode };

export type ParkFilters = {
    readonly search: string;
    readonly region: ParkRegionCode | undefined;
    readonly status: ParkStatusCode | undefined;
    readonly page: number;
};
