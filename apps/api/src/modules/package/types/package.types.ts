import type { RowDataPacket } from '../../../database/connection';

export const PackageWebsiteStatus = { NOT_LIVE: 1, ACTIVE: 2, INACTIVE: 3, DELETED_BY_ADMIN: 4, DISCARDED: -1 } as const;

export type PackageWebsiteStatusCode = (typeof PackageWebsiteStatus)[keyof typeof PackageWebsiteStatus];

export const PackageVersionStatus = { DRAFT: 1, WAITING: 2, REJECTED: 3, LIVE: 4, REPLACED: 5, DISCARDED: -1 } as const;

export type PackageVersionStatusCode = (typeof PackageVersionStatus)[keyof typeof PackageVersionStatus];

export const SafariType = { SHARED: 1, PRIVATE: 2 } as const;

export type SafariTypeCode = (typeof SafariType)[keyof typeof SafariType];

export const Vehicle = { GYPSY_JEEP: 1, CANTER_BUS: 2, OTHER: 3 } as const;

export type VehicleCode = (typeof Vehicle)[keyof typeof Vehicle];

export const PackageTheme = { PHOTOGRAPHY: 1, SAFARI_EXPERIENCE: 2, WILDLIFE_EXPLORATION: 3 } as const;

export type PackageThemeCode = (typeof PackageTheme)[keyof typeof PackageTheme];

export const Stay = {
    PREMIUM: 1,
    STANDARD: 2,
    ECONOMICAL: 3,
    NOT_INCLUDED: 4,
    FOREST_REST_HOUSE: 5,
    HOME_STAY: 6,
} as const;

export type StayCode = (typeof Stay)[keyof typeof Stay];

export const PackageFeature = {
    MULTIPLE_PARKS: 1,
    CUSTOMIZABLE: 2,
    PRIVATE_ROOM: 3,
    SHARED_ROOM: 4,
    PRIVATE_SAFARI: 5,
    SHARED_SAFARI: 6,
    PHOTOGRAPHY_SPECIAL: 7,
    FOREST_REST_HOUSE_STAY: 8,
    OTHER_ACTIVITIES: 9,
} as const;

export type PackageFeatureCode = (typeof PackageFeature)[keyof typeof PackageFeature];

export const Inclusion = {
    ACCOMMODATION: 1,
    MEALS: 2,
    PICK_DROP: 3,
    CAMERA_FEE: 4,
    PERMIT: 5,
    GUIDE_FEE: 6,
} as const;

export type InclusionCode = (typeof Inclusion)[keyof typeof Inclusion];

export const Meal = { BREAKFAST: 1, LUNCH: 2, DINNER: 3 } as const;

export type MealCode = (typeof Meal)[keyof typeof Meal];

export const DeleteReasonStatus = { ACTIVE: 1, INACTIVE: 2 } as const;

export type DeleteReasonStatusCode = (typeof DeleteReasonStatus)[keyof typeof DeleteReasonStatus];

export const PackageRowStatus = { ACTIVE: 1, DELETED: -1 } as const;

const valuesOf = <T extends Readonly<Record<string, number>>>(codes: T): readonly T[keyof T][] =>
    Object.values(codes) as T[keyof T][];

export const SAFARI_TYPES = valuesOf(SafariType);
export const VEHICLES = valuesOf(Vehicle);
export const PACKAGE_THEMES = valuesOf(PackageTheme);
export const STAYS = valuesOf(Stay);
export const PACKAGE_FEATURES = valuesOf(PackageFeature);
export const INCLUSIONS = valuesOf(Inclusion);
export const DELETE_REASON_STATUSES = valuesOf(DeleteReasonStatus);

export const WORKING_STATUSES: readonly PackageVersionStatusCode[] = [
    PackageVersionStatus.DRAFT,
    PackageVersionStatus.WAITING,
    PackageVersionStatus.REJECTED,
];

export const PARTNER_EDITABLE_STATUSES: readonly PackageVersionStatusCode[] = [
    PackageVersionStatus.DRAFT,
    PackageVersionStatus.REJECTED,
];

export const ADMIN_EDITABLE_STATUSES: readonly PackageVersionStatusCode[] = [
    PackageVersionStatus.WAITING,
    PackageVersionStatus.LIVE,
];

export const LISTED_WEBSITE_STATUSES: readonly PackageWebsiteStatusCode[] = [
    PackageWebsiteStatus.NOT_LIVE,
    PackageWebsiteStatus.ACTIVE,
    PackageWebsiteStatus.INACTIVE,
    PackageWebsiteStatus.DELETED_BY_ADMIN,
];

export const LIVE_WEBSITE_STATUSES: readonly PackageWebsiteStatusCode[] = [
    PackageWebsiteStatus.ACTIVE,
    PackageWebsiteStatus.INACTIVE,
];

export const CONSOLE_WEBSITE_STATUSES: readonly PackageWebsiteStatusCode[] = [
    PackageWebsiteStatus.ACTIVE,
    PackageWebsiteStatus.INACTIVE,
    PackageWebsiteStatus.DELETED_BY_ADMIN,
];

export const PACKAGE_LIMITS = {
    NAME_MAX: 215,
    PLACE_MAX: 215,
    DAYS_MIN: 1,
    DAYS_MAX: 15,
    SAFARIS_MIN: 1,
    SAFARIS_MAX: 99,
    PARKS_MAX: 50,
    PRICE_MIN: 1000,
    PRICE_MAX: 9_999_999,
    MESSAGE_MAX: 255,
    OVERVIEW_MAX: 2000,
    DAY_TITLE_MAX: 255,
    DAY_DESCRIPTION_MAX: 2000,
    DAY_TEXT_MAX: 255,
    DAY_NOTE_MAX: 500,
    INCLUSION_TEXT_MAX: 512,
    GETTING_THERE_MAX: 2000,
    QUESTION_MAX: 512,
    ANSWER_MAX: 100_000,
    FAQS_MAX: 200,
    REASON_MAX: 512,
    DELETE_DETAILS_MAX: 1000,
    DELETE_REASON_NAME_MAX: 100,
    SEARCH: 100,
    IMAGE_MAX_BYTES: 250 * 1024,
    DAY_IMAGE_MAX_BYTES: 20 * 1024 * 1024,
    SLUG_MAX: 200,
    WEBSITE_PAGE_SIZE: 12,
    WEBSITE_PRICE_OPEN_FROM: 50_000,
    WEBSITE_NIGHTS_OPEN_FROM: 10,
    WEBSITE_SAFARIS_OPEN_FROM: 10,
    DASHBOARD_PACKAGES: 2,
} as const;

export const PACKAGE_SLUG_FALLBACK = 'package';

export const PACKAGE_FOLDER = 'package';

export const PLACE_PATTERN = /^[\p{L}\s-]+$/u;

export const COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export const FILE_NAME_PATTERN = /^[A-Za-z0-9._-]{1,255}$/;

export const IMAGE_CONTENT_TYPES: readonly string[] = ['image/jpeg', 'image/png'];

export const DEFAULT_TAG_COLORS = { BACKGROUND: '#C0392B', TEXT: '#FFFFFF' } as const;

export const PackageImageKind = { PACKAGE: 'package', BANNER: 'banner' } as const;

export type PackageImageKindKey = (typeof PackageImageKind)[keyof typeof PackageImageKind];

export const PackageSection = {
    BASIC: 'basic',
    ITINERARY: 'itinerary',
    INCLUSIONS: 'inclusions',
    GETTING_THERE: 'getting-there',
    FAQS: 'faqs',
} as const;

export type PackageSectionKey = (typeof PackageSection)[keyof typeof PackageSection];

export const WebsiteSort = {
    POPULAR: 'popular',
    NEWEST: 'newest',
    FEWEST_SAFARIS: 'fewest-safaris',
    MOST_SAFARIS: 'most-safaris',
    PRICE_LOW: 'price-low',
} as const;

export type WebsiteSortKey = (typeof WebsiteSort)[keyof typeof WebsiteSort];

export const WEBSITE_SORTS: readonly WebsiteSortKey[] = Object.values(WebsiteSort);

export const PortalAction = {
    VIEW: 'view',
    EDIT: 'edit',
    SEND: 'send',
    DELETE: 'delete',
    DELETE_DRAFT: 'deleteDraft',
    MAKE_INACTIVE: 'makeInactive',
    MAKE_ACTIVE: 'makeActive',
} as const;

export type PortalActionKey = (typeof PortalAction)[keyof typeof PortalAction];

export interface PackageRow extends RowDataPacket {
    id: number;
    partner_id: number;
    slug: string;
    website_status: PackageWebsiteStatusCode;
    is_popular: number;
    is_best_deal: number;
    first_live_at: Date | null;
    master_package_delete_reason_id: number | null;
    delete_reason_name: string | null;
    delete_details: string | null;
    deleted_at: Date | null;
    created_at: Date;
    updated_at: Date;
    business_name: string | null;
    partner_status: number | null;
    live_version_id: number | null;
    live_version_number: number | null;
    working_version_id: number | null;
    working_version_number: number | null;
    working_status: PackageVersionStatusCode | null;
}

export interface PackageListRow extends PackageRow {
    name: string;
    park_names: string | null;
    shown_version_id: number | null;
    package_image: string | null;
    last_changed_at: Date;
}

export interface VersionRow extends RowDataPacket {
    id: number;
    package_id: number;
    version_number: number;
    name: string;
    day_count: number;
    safari_count: number;
    safari_type: SafariTypeCode;
    vehicle: VehicleCode;
    theme: PackageThemeCode;
    stay: StayCode;
    start_place: string | null;
    end_place: string | null;
    price_per_person: number;
    total_price: number;
    price_before_discount: number | null;
    activity_message: string | null;
    price_message: string | null;
    tag_text: string | null;
    tag_background_color: string;
    tag_text_color: string;
    package_image: string | null;
    banner_image: string | null;
    gallery_id: number | null;
    gallery_title: string | null;
    overview: string | null;
    more_inclusions: string | null;
    exclusions: string | null;
    getting_there: string | null;
    is_itinerary_saved: number;
    is_inclusions_saved: number;
    is_getting_there_saved: number;
    is_faqs_saved: number;
    reject_reason: string | null;
    sent_at: Date | null;
    decided_at: Date | null;
    replaced_at: Date | null;
    admin_edited_at: Date | null;
    deleted_at: Date | null;
    created_at: Date;
    updated_at: Date;
    status: PackageVersionStatusCode;
}

export interface VersionParkRow extends RowDataPacket {
    package_version_id: number;
    master_park_id: number;
    sort_order: number;
    name: string | null;
    slug: string | null;
    feature_image: string | null;
}

export interface VersionCodeRow extends RowDataPacket {
    package_version_id: number;
    code: number;
    is_included: number;
}

export interface DayRow extends RowDataPacket {
    id: number;
    package_version_id: number;
    day_number: number;
    title: string;
    description: string;
    start_location: string | null;
    end_location: string | null;
    hotel_name: string | null;
    has_breakfast: number;
    has_lunch: number;
    has_dinner: number;
    activity: string | null;
    accommodation: string | null;
    note: string | null;
    day_image: string | null;
    gallery_id: number | null;
    gallery_title: string | null;
}

export interface FaqRow extends RowDataPacket {
    id: number;
    question: string;
    answer: string;
    sort_order: number;
}

export interface PhotoRow extends RowDataPacket {
    id: number;
    package_version_id: number;
    package_version_day_id: number | null;
    file_name: string;
    title: string | null;
    caption: string | null;
    sort_order: number;
    status: number;
}

export interface ApprovalRow extends RowDataPacket {
    version_id: number;
    package_id: number;
    version_number: number;
    name: string;
    park_names: string | null;
    package_image: string | null;
    business_name: string | null;
    partner_id: number;
    live_version_number: number | null;
    sent_at: Date | null;
}

export interface DeleteReasonRow extends RowDataPacket {
    id: number;
    name: string;
    status: DeleteReasonStatusCode;
    used_count: number;
    created_at: Date;
}

export interface WebsiteCardRow extends RowDataPacket {
    package_id: number;
    slug: string;
    is_popular: number;
    is_best_deal: number;
    first_live_at: Date | null;
    partner_id: number;
    partner_user_id: number;
    business_name: string;
    version_id: number;
    version_number: number;
}

export interface PriceRangeRow extends RowDataPacket {
    master_park_id: number;
    lowest: number;
    highest: number;
    package_count: number;
}

export interface CountRow extends RowDataPacket {
    total: number;
}
