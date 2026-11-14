export type CodeOption = { readonly code: number; readonly label: string };

export const SAFARI_TYPE_OPTIONS: readonly CodeOption[] = [
    { code: 1, label: 'Shared' },
    { code: 2, label: 'Private' },
];

export const VEHICLE_OPTIONS: readonly CodeOption[] = [
    { code: 1, label: 'Gypsy / Jeep' },
    { code: 2, label: 'Canter / Bus' },
    { code: 3, label: 'Other (Elephant, Boat)' },
];

export const THEME_OPTIONS: readonly CodeOption[] = [
    { code: 1, label: 'Photography' },
    { code: 2, label: 'Safari Experience' },
    { code: 3, label: 'Wildlife Exploration' },
];

export const STAY_OPTIONS: readonly CodeOption[] = [
    { code: 1, label: 'Premium' },
    { code: 2, label: 'Standard' },
    { code: 3, label: 'Economical' },
    { code: 4, label: 'Not Included' },
    { code: 5, label: 'Forest Rest House' },
    { code: 6, label: 'Home Stay' },
];

export const FEATURE_OPTIONS: readonly CodeOption[] = [
    { code: 1, label: 'Multiple Parks' },
    { code: 2, label: 'Customizable' },
    { code: 3, label: 'Private Room' },
    { code: 4, label: 'Shared Room' },
    { code: 5, label: 'Private Safari' },
    { code: 6, label: 'Shared Safari' },
    { code: 7, label: 'Photography Special' },
    { code: 8, label: 'Forest Rest House Stay' },
    { code: 9, label: 'Other Activities' },
];

export const INCLUSION_OPTIONS: readonly CodeOption[] = [
    { code: 1, label: 'Accommodation' },
    { code: 2, label: 'Meals' },
    { code: 3, label: 'Pick & Drop' },
    { code: 4, label: 'Camera Fee' },
    { code: 5, label: 'Permit' },
    { code: 6, label: 'Guide Fee' },
];

export const MEALS_INCLUSION = 2;

export const PICK_DROP_INCLUSION = 3;

export const labelOf = (options: readonly CodeOption[], code: number): string =>
    options.find((option) => option.code === code)?.label ?? '';

export const PACKAGE_LIMITS = {
    SEARCH: 100,
    PRICE_MIN: 0,
    PRICE_MAX: 50_000,
    PRICE_STEP: 1000,
    NIGHTS_MIN: 0,
    NIGHTS_MAX: 10,
    SAFARIS_MIN: 1,
    SAFARIS_MAX: 10,
    PAGE_SIZE: 12,
    SLIDE_MS: 3000,
} as const;

export const PACKAGE_SORT_OPTIONS = [
    { value: 'popular', label: 'Sort by: Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'fewest-safaris', label: 'Fewest safaris' },
    { value: 'most-safaris', label: 'Most safaris' },
    { value: 'price-low', label: 'Price low to high' },
] as const;

export type PackageSort = (typeof PACKAGE_SORT_OPTIONS)[number]['value'];

export type PackageFilters = {
    readonly search: string;
    readonly parkId: string;
    readonly priceFrom: number;
    readonly priceTo: number;
    readonly nightsFrom: number;
    readonly nightsTo: number;
    readonly safarisFrom: number;
    readonly safarisTo: number;
    readonly stays: readonly number[];
    readonly features: readonly number[];
    readonly inclusions: readonly number[];
};

export type PackageParkRef = {
    readonly id: number;
    readonly name: string;
    readonly slug: string;
    readonly featureImage: string | null;
    readonly isMain: boolean;
};

export type PackageTag = {
    readonly text: string | null;
    readonly backgroundColor: string;
    readonly textColor: string;
};

export type PackageCard = {
    readonly id: number;
    readonly slug: string;
    readonly name: string;
    readonly mainPark: PackageParkRef;
    readonly parks: readonly PackageParkRef[];
    readonly dayCount: number;
    readonly nightCount: number;
    readonly safariCount: number;
    readonly safariType: number;
    readonly activityMessage: string | null;
    readonly pricePerPerson: number;
    readonly totalPrice: number;
    readonly priceBeforeDiscount: number | null;
    readonly priceMessage: string | null;
    readonly tag: PackageTag;
    readonly packageImage: string | null;
    readonly isPopular: boolean;
    readonly isBestDeal: boolean;
    readonly partner: { readonly id: number; readonly businessName: string };
};

export type PackagePage = {
    readonly items: readonly PackageCard[];
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
    readonly hasMore: boolean;
};

export type GalleryPhoto = {
    readonly id: number;
    readonly fileName: string;
    readonly title: string | null;
    readonly caption: string | null;
};

export type PackageGallery = {
    readonly galleryId: number | null;
    readonly title: string;
    readonly photos: readonly GalleryPhoto[];
};

export type PackageDay = {
    readonly id: number;
    readonly dayNumber: number;
    readonly title: string;
    readonly description: string;
    readonly startLocation: string | null;
    readonly endLocation: string | null;
    readonly hotelName: string | null;
    readonly hasBreakfast: boolean;
    readonly hasLunch: boolean;
    readonly hasDinner: boolean;
    readonly activity: string | null;
    readonly accommodation: string | null;
    readonly note: string | null;
    readonly dayImage: string | null;
    readonly gallery: PackageGallery | null;
};

export type PackageDetail = PackageCard & {
    readonly vehicle: number;
    readonly theme: number;
    readonly stay: number;
    readonly startPlace: string | null;
    readonly endPlace: string | null;
    readonly bannerImage: string | null;
    readonly features: readonly number[];
    readonly gallery: PackageGallery | null;
    readonly overview: string | null;
    readonly days: readonly PackageDay[];
    readonly inclusions: ReadonlyArray<{ readonly inclusion: number; readonly isIncluded: boolean }>;
    readonly moreInclusions: string | null;
    readonly exclusions: string | null;
    readonly gettingThere: string | null;
    readonly faqs: ReadonlyArray<{ readonly id: number; readonly question: string; readonly answer: string }>;
    readonly versionId: number;
    readonly versionNumber: number;
};

export type PackagePageAnswer = {
    readonly inUse: boolean;
    readonly package: PackageDetail | null;
};
