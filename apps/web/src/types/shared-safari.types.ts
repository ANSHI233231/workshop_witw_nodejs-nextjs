export const SafariStatus = {
    ACTIVE: 1,
    INACTIVE: 2,
    SEAT_FULL: 3,
} as const;

export type HostStatus = (typeof SafariStatus)[keyof typeof SafariStatus];

export const SafariTheme = { PHOTOGRAPHY: 1, SAFARI_EXPERIENCE: 2 } as const;

export const THEME_OPTIONS: ReadonlyArray<{ readonly value: number; readonly label: string }> = [
    { value: SafariTheme.PHOTOGRAPHY, label: 'Photography' },
    { value: SafariTheme.SAFARI_EXPERIENCE, label: 'Safari Experience' },
];

export const STAY_OPTIONS: ReadonlyArray<{ readonly value: number; readonly label: string }> = [
    { value: 1, label: 'Premium' },
    { value: 2, label: 'Standard' },
    { value: 3, label: 'Economical' },
    { value: 4, label: 'Not Included' },
    { value: 5, label: 'Forest Rest House' },
    { value: 6, label: 'Home Stay' },
];

export const SORT_OPTIONS = [
    { value: 'newest', label: 'Sort by: Newest first' },
    { value: 'most-safaris', label: 'Most safaris' },
    { value: 'fewest-safaris', label: 'Fewest safaris' },
    { value: 'price-low', label: 'Price low to high' },
    { value: 'starting-soonest', label: 'Starting soonest' },
    { value: 'starting-latest', label: 'Starting latest' },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export const SAFARI_LIMITS = {
    TITLE_MAX: 255,
    PLAN_WORDS_BELOW: 1000,
    COMMENT_WORDS_BELOW: 200,
    SAFARIS_MIN: 1,
    SAFARIS_MAX: 10,
    SEATS_MIN: 2,
    SEATS_MAX: 6,
    PRICE_MAX: 1_000_000,
    FLAG_DETAILS_MAX: 500,
    IMAGE_MAX_BYTES: 5 * 1024 * 1024,
    INTERESTED_SHOWN: 8,
    CARD_FACES: 3,
    PAGE_SIZE: 12,
    BUDGET_MIN: 100,
    BUDGET_MAX: 50_000,
    BUDGET_STEP: 100,
} as const;

export type Person = { readonly id: number; readonly name: string; readonly initials: string };

export type Member = Person & { readonly joinedAt: string; readonly leftAt: string | null };

export type ViewerState = {
    readonly signedIn: boolean;
    readonly isHost: boolean;
    readonly joined: boolean;
    readonly hasLeft: boolean;
    readonly canJoin: boolean;
    readonly canComment: boolean;
};

export type SafariCard = {
    readonly id: number;
    readonly slug: string;
    readonly title: string;
    readonly host: Person;
    readonly park: { readonly id: number; readonly name: string };
    readonly startDate: string;
    readonly endDate: string;
    readonly safariCount: number;
    readonly totalSeats: number;
    readonly sharedSeats: number;
    readonly pricePerPersonMin: number;
    readonly pricePerPersonMax: number;
    readonly theme: number;
    readonly stayCategory: number | null;
    readonly hasCover: boolean;
    readonly coverVersion: string | null;
    readonly status: number;
    readonly isStarted: boolean;
    readonly joinedCount: number;
    readonly faces: readonly Person[];
    readonly createdAt: string;
    readonly viewer: ViewerState;
};

export type SafariComment = {
    readonly id: number;
    readonly writer: Person;
    readonly isHost: boolean;
    readonly text: string;
    readonly createdAt: string;
    readonly isMine: boolean;
    readonly canEdit: boolean;
    readonly canFlag: boolean;
    readonly replies: readonly SafariComment[];
};

export type SafariView = SafariCard & {
    readonly safariPlan: string;
    readonly commentCount: number;
    readonly interested: readonly Member[];
    readonly comments: readonly SafariComment[];
};

export type SafariInput = {
    readonly title: string;
    readonly masterParkId: number | null;
    readonly startDate: string;
    readonly endDate: string;
    readonly safariCount: number | null;
    readonly theme: number | null;
    readonly totalSeats: number | null;
    readonly sharedSeats: number | null;
    readonly pricePerPersonMin: number | null;
    readonly pricePerPersonMax: number | null;
    readonly stayCategory: number | null;
    readonly safariPlan: string;
};

export type SafariEdit = {
    readonly id: number;
    readonly slug: string;
    readonly title: string;
    readonly masterParkId: number;
    readonly parkName: string;
    readonly parkActive: boolean;
    readonly startDate: string;
    readonly endDate: string;
    readonly safariCount: number;
    readonly theme: number;
    readonly totalSeats: number;
    readonly sharedSeats: number;
    readonly pricePerPersonMin: number;
    readonly pricePerPersonMax: number;
    readonly stayCategory: number | null;
    readonly safariPlan: string;
    readonly hasCover: boolean;
    readonly coverVersion: string | null;
};

export type SafariPage = {
    readonly items: readonly SafariCard[];
    readonly total: number;
    readonly activeTotal: number;
};

export type SafariFilters = {
    readonly parkId: string;
    readonly month: string;
    readonly priceFrom: number;
    readonly priceTo: number;
    readonly safarisFrom: number;
    readonly safarisTo: number;
    readonly themes: readonly number[];
    readonly stays: readonly number[];
};

export type ParkOption = { readonly id: number; readonly name: string };

export type FlagReason = { readonly id: number; readonly name: string };

export type MyTab = 'organised' | 'joined';
