export const SafariStatus = {
    ACTIVE: 1,
    INACTIVE: 2,
    SEAT_FULL: 3,
    DELETED_BY_ADMIN: 4,
    DELETED_BY_HOST: -1,
} as const;

export type SafariStatusCode = (typeof SafariStatus)[keyof typeof SafariStatus];

export const SAFARI_STATUSES: readonly SafariStatusCode[] = Object.values(SafariStatus);

export const SAFARI_STATUS_FILTERS: readonly { readonly value: SafariStatusCode; readonly label: string }[] = [
    { value: SafariStatus.ACTIVE, label: 'Active' },
    { value: SafariStatus.INACTIVE, label: 'Inactive' },
    { value: SafariStatus.SEAT_FULL, label: 'Seat full' },
    { value: SafariStatus.DELETED_BY_ADMIN, label: 'Deleted by admin' },
    { value: SafariStatus.DELETED_BY_HOST, label: 'Deleted by host' },
];

export const SafariTheme = { PHOTOGRAPHY: 1, SAFARI_EXPERIENCE: 2 } as const;

export const SAFARI_THEME_LABEL: Readonly<Record<number, string>> = {
    [SafariTheme.PHOTOGRAPHY]: 'Photography',
    [SafariTheme.SAFARI_EXPERIENCE]: 'Safari Experience',
};

export const StayCategory = {
    PREMIUM: 1,
    STANDARD: 2,
    ECONOMICAL: 3,
    NOT_INCLUDED: 4,
    FOREST_REST_HOUSE: 5,
    HOME_STAY: 6,
} as const;

export const STAY_CATEGORY_LABEL: Readonly<Record<number, string>> = {
    [StayCategory.PREMIUM]: 'Premium',
    [StayCategory.STANDARD]: 'Standard',
    [StayCategory.ECONOMICAL]: 'Economical',
    [StayCategory.NOT_INCLUDED]: 'Not Included',
    [StayCategory.FOREST_REST_HOUSE]: 'Forest Rest House',
    [StayCategory.HOME_STAY]: 'Home Stay',
};

export const AdminDeleteReason = {
    ABUSIVE_OR_ILLEGAL: 1,
    COMMERCIAL_OR_SPAM: 2,
    DATING_OR_SEXUALLY_EXPLICIT: 3,
    FELT_UNSAFE: 4,
    SHOWS_PRIVATE_INFORMATION: 5,
    VIOLATES_GUIDELINES: 6,
    OFF_TOPIC: 7,
    OTHER: 8,
} as const;

export type AdminDeleteReasonCode = (typeof AdminDeleteReason)[keyof typeof AdminDeleteReason];

export const ADMIN_DELETE_REASONS: readonly AdminDeleteReasonCode[] = Object.values(AdminDeleteReason);

export const ADMIN_DELETE_REASON_LABEL: Readonly<Record<number, string>> = {
    [AdminDeleteReason.ABUSIVE_OR_ILLEGAL]: 'Abusive or Illegal',
    [AdminDeleteReason.COMMERCIAL_OR_SPAM]: 'Commercial or Spam',
    [AdminDeleteReason.DATING_OR_SEXUALLY_EXPLICIT]: 'Dating / Sexually Explicit',
    [AdminDeleteReason.FELT_UNSAFE]: 'Felt Unsafe',
    [AdminDeleteReason.SHOWS_PRIVATE_INFORMATION]: 'Shows My Private Information',
    [AdminDeleteReason.VIOLATES_GUIDELINES]: 'Violates Guidelines',
    [AdminDeleteReason.OFF_TOPIC]: 'Off Topic',
    [AdminDeleteReason.OTHER]: 'Other',
};

export const SHARED_SAFARI_LIMITS = { SEARCH: 100, DELETE_DETAILS_MAX: 1000 } as const;

export type Person = { readonly id: number; readonly name: string; readonly initials: string };

export type Member = Person & { readonly joinedAt: string; readonly leftAt: string | null };

export type ConsoleSafari = {
    readonly id: number;
    readonly slug: string;
    readonly title: string;
    readonly host: Person & { readonly isActive: boolean };
    readonly park: { readonly id: number; readonly name: string };
    readonly startDate: string;
    readonly endDate: string;
    readonly totalSeats: number;
    readonly sharedSeats: number;
    readonly joinedCount: number;
    readonly leftCount: number;
    readonly status: SafariStatusCode;
    readonly isPinned: boolean;
    readonly createdAt: string;
};

export type ConsoleComment = {
    readonly id: number;
    readonly writer: Person;
    readonly isHost: boolean;
    readonly text: string;
    readonly createdAt: string;
    readonly replyCount: number;
    readonly flagCount: number;
    readonly openFlagCount: number;
    readonly replies: readonly ConsoleComment[];
};

export type ConsoleSafariDetail = ConsoleSafari & {
    readonly hostEmail: string | null;
    readonly updatedAt: string;
    readonly theme: number;
    readonly stayCategory: number | null;
    readonly safariCount: number;
    readonly pricePerPersonMin: number;
    readonly pricePerPersonMax: number;
    readonly safariPlan: string;
    readonly hasCover: boolean;
    readonly coverVersion: string | null;
    readonly deleteReason: number | null;
    readonly deleteDetails: string | null;
    readonly deletedAt: string | null;
    readonly deletedByName: string | null;
    readonly joined: readonly Member[];
    readonly left: readonly Member[];
    readonly comments: readonly ConsoleComment[];
};

export type HostOption = { readonly id: number; readonly name: string };

export type SafariFilters = {
    readonly search: string;
    readonly status: SafariStatusCode | undefined;
    readonly hostId: number | undefined;
    readonly page: number;
};

export type FlaggedComment = {
    readonly id: number;
    readonly safari: { readonly id: number; readonly title: string; readonly slug: string };
    readonly isReply: boolean;
    readonly writerName: string;
    readonly text: string;
    readonly reasons: readonly string[];
    readonly flagCount: number;
    readonly lastFlaggedAt: string;
};

export type CommentFlag = {
    readonly id: number;
    readonly reason: string;
    readonly details: string;
    readonly flaggerName: string;
    readonly createdAt: string;
};

export type CommentFlags = {
    readonly comment: { readonly id: number; readonly text: string; readonly writer: string };
    readonly flags: readonly CommentFlag[];
};

export type FlaggedFilters = {
    readonly search: string;
    readonly page: number;
};

export type AdminDeleteInput = { readonly reason: AdminDeleteReasonCode; readonly details: string };
