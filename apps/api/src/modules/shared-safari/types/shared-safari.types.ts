import type { RowDataPacket } from '../../../database/connection';

export const SharedSafariStatus = {
    ACTIVE: 1,
    INACTIVE: 2,
    SEAT_FULL: 3,
    DELETED_BY_ADMIN: 4,
    DELETED_BY_HOST: -1,
} as const;

export type SharedSafariStatusCode = (typeof SharedSafariStatus)[keyof typeof SharedSafariStatus];

export const HOST_STATUSES: readonly number[] = [
    SharedSafariStatus.ACTIVE,
    SharedSafariStatus.SEAT_FULL,
    SharedSafariStatus.INACTIVE,
];

export const PUBLIC_STATUSES: readonly number[] = [SharedSafariStatus.ACTIVE, SharedSafariStatus.SEAT_FULL];

export const ACTIVE_USER = 1;

export const ACTIVE_PARK = 1;

export const SharedSafariTheme = { PHOTOGRAPHY: 1, SAFARI_EXPERIENCE: 2 } as const;

export const StayCategory = {
    PREMIUM: 1,
    STANDARD: 2,
    ECONOMICAL: 3,
    NOT_INCLUDED: 4,
    FOREST_REST_HOUSE: 5,
    HOME_STAY: 6,
} as const;

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

export const SharedSafariMemberStatus = { JOINED: 1, LEFT: 2 } as const;

export const SharedSafariCommentStatus = { ACTIVE: 1, DELETED: -1 } as const;

export const CommentFlagStatus = { OPEN: 1, IGNORED: 2, CLOSED: 3 } as const;

export const SortKey = {
    NEWEST: 'newest',
    MOST_SAFARIS: 'most-safaris',
    FEWEST_SAFARIS: 'fewest-safaris',
    PRICE_LOW: 'price-low',
    STARTING_SOONEST: 'starting-soonest',
    STARTING_LATEST: 'starting-latest',
} as const;

export type SortKeyCode = (typeof SortKey)[keyof typeof SortKey];

export const MyTab = { ORGANISED: 'organised', JOINED: 'joined' } as const;

export type MyTabCode = (typeof MyTab)[keyof typeof MyTab];

export const SHARED_SAFARI_LIMITS = {
    TITLE_MAX: 255,
    SLUG_MAX: 280,
    PLAN_WORDS_BELOW: 1000,
    COMMENT_WORDS_BELOW: 200,
    SAFARIS_MIN: 1,
    SAFARIS_MAX: 10,
    SEATS_MIN: 2,
    SEATS_MAX: 6,
    SHARED_MIN: 1,
    PRICE_MAX: 1_000_000,
    FLAG_DETAILS_MAX: 500,
    DELETE_DETAILS_MAX: 1000,
    SEARCH_MAX: 100,
    IMAGE_MAX_BYTES: 5 * 1024 * 1024,
    START_WITHIN_DAYS: 366,
    INTERESTED_SHOWN: 8,
    CARD_FACES: 3,
    PAGE_SIZE: 12,
    CONSOLE_PAGE_SIZE: 20,
} as const;

export const IMAGE_TYPES: readonly string[] = ['image/png', 'image/jpeg'];

export const COVER_FOLDER = { PARENT: 'shared_safari', FEATURE: 'cover_image' } as const;

export const INDIA_TIME_ZONE = 'Asia/Kolkata';

export interface CountRow extends RowDataPacket {
    total: number;
}

export interface IdRow extends RowDataPacket {
    id: number;
}

export interface SafariRow extends RowDataPacket {
    id: number;
    userId: number;
    hostName: string;
    hostEmail: string | null;
    hostStatus: number;
    masterParkId: number;
    parkName: string;
    parkStatus: number;
    slug: string;
    title: string;
    theme: number;
    startDate: string;
    endDate: string;
    safariCount: number;
    totalSeats: number;
    sharedSeats: number;
    pricePerPersonMin: number;
    pricePerPersonMax: number;
    stayCategory: number | null;
    coverImage: string | null;
    safariPlan: string;
    isPinned: number;
    deleteReason: number | null;
    deleteDetails: string | null;
    status: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    deletedByName: string | null;
    joinedCount: number;
    leftCount: number;
    commentCount: number;
}

export interface FaceRow extends RowDataPacket {
    sharedSafariId: number;
    userId: number;
    name: string;
    joinedAt: Date;
    leftAt: Date | null;
}

export interface MemberRow extends RowDataPacket {
    id: number;
    sharedSafariId: number;
    userId: number;
    status: number;
    firstJoinedAt: Date;
    joinedAt: Date;
    leftAt: Date | null;
}

export interface CommentRow extends RowDataPacket {
    id: number;
    sharedSafariId: number;
    sharedSafariCommentId: number | null;
    userId: number;
    writerName: string;
    writerStatus: number;
    commentText: string;
    status: number;
    createdAt: Date;
    updatedAt: Date;
    openFlags: number;
    allFlags: number;
}

export interface FlaggedRow extends RowDataPacket {
    id: number;
    sharedSafariId: number;
    sharedSafariCommentId: number | null;
    safariTitle: string;
    safariSlug: string;
    writerName: string;
    commentText: string;
    reasons: string | null;
    openFlags: number;
    lastFlaggedAt: Date;
}

export interface FlagRow extends RowDataPacket {
    id: number;
    reasonName: string;
    details: string;
    flaggerName: string;
    createdAt: Date;
}

export interface HostOptionRow extends RowDataPacket {
    id: number;
    name: string;
}
