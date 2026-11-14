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

export const PARK_LIMITS = { SEARCH: 100, PAGE_SIZE: 12 } as const;

export const PARK_SORT_OPTIONS = [
    { value: 'az', label: 'Sort by: A–Z' },
    { value: 'za', label: 'Z–A' },
] as const;

export type ParkSort = (typeof PARK_SORT_OPTIONS)[number]['value'];

export type ParkFilters = {
    readonly search: string;
    readonly region: string;
    readonly sort: ParkSort;
};

export type ParkCard = {
    readonly id: number;
    readonly name: string;
    readonly slug: string;
    readonly region: ParkRegionCode;
    readonly featureImage: string | null;
    readonly avgSafariPriceMin: number | null;
    readonly avgSafariPriceMax: number | null;
    readonly packageCount: number;
};

export type ParkPageData = ParkCard & {
    readonly shortDescription: string | null;
    readonly latitude: number | null;
    readonly longitude: number | null;
    readonly officialWebsite: string | null;
};

export type ParkList = {
    readonly items: readonly ParkCard[];
    readonly total: number;
    readonly page: number;
};
