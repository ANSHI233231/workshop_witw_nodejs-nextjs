export const PackageVersionStatus = { DRAFT: 1, WAITING: 2, REJECTED: 3, LIVE: 4, REPLACED: 5, DISCARDED: -1 } as const;

export type PackageVersionStatusCode = (typeof PackageVersionStatus)[keyof typeof PackageVersionStatus];

export const PackageWebsiteStatus = { NOT_LIVE: 1, ACTIVE: 2, INACTIVE: 3, DELETED_BY_ADMIN: 4 } as const;

export type PackageWebsiteStatusCode = (typeof PackageWebsiteStatus)[keyof typeof PackageWebsiteStatus];

export const CONSOLE_WEBSITE_STATUSES: readonly PackageWebsiteStatusCode[] = [
    PackageWebsiteStatus.ACTIVE,
    PackageWebsiteStatus.INACTIVE,
    PackageWebsiteStatus.DELETED_BY_ADMIN,
];

export const DeleteReasonStatus = { ACTIVE: 1, INACTIVE: 2 } as const;

export type DeleteReasonStatusCode = (typeof DeleteReasonStatus)[keyof typeof DeleteReasonStatus];

export const DELETE_REASON_STATUSES: readonly DeleteReasonStatusCode[] = [
    DeleteReasonStatus.ACTIVE,
    DeleteReasonStatus.INACTIVE,
];

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

export const PACKAGE_LIMITS = {
    NAME_MAX: 215,
    PLACE_MAX: 215,
    DAYS_MIN: 1,
    DAYS_MAX: 15,
    SAFARIS_MIN: 1,
    SAFARIS_MAX: 99,
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
} as const;

export const PLACE_PATTERN = /^[\p{L}\s-]+$/u;

export const COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export const DEFAULT_TAG_COLORS = { BACKGROUND: '#C0392B', TEXT: '#FFFFFF' } as const;

export const IMAGE_ACCEPT = '.jpg,.jpeg,.png';

export const PackageImageKind = { PACKAGE: 'package', BANNER: 'banner' } as const;

export type PackageImageKindKey = (typeof PackageImageKind)[keyof typeof PackageImageKind];

export type ParkOfVersion = {
    readonly id: number;
    readonly name: string | null;
    readonly slug: string | null;
    readonly featureImage: string | null;
    readonly isMain: boolean;
};

export type PhotoItem = {
    readonly id: number;
    readonly fileName: string;
    readonly title: string | null;
    readonly caption: string | null;
};

export type GalleryCopy = {
    readonly galleryId: number;
    readonly title: string | null;
    readonly photos: readonly PhotoItem[];
};

export type DayDetail = {
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
    readonly gallery: GalleryCopy | null;
};

export type InclusionChoice = { readonly inclusion: number; readonly isIncluded: boolean };

export type VersionSummary = {
    readonly id: number;
    readonly versionNumber: number;
    readonly status: PackageVersionStatusCode;
    readonly rejectReason: string | null;
    readonly createdAt: string;
    readonly sentAt: string | null;
    readonly decidedAt: string | null;
    readonly replacedAt: string | null;
    readonly deletedAt: string | null;
    readonly adminEditedAt: string | null;
};

export type VersionDetail = VersionSummary & {
    readonly packageId: number;
    readonly name: string;
    readonly dayCount: number;
    readonly nightCount: number;
    readonly safariCount: number;
    readonly safariType: number;
    readonly vehicle: number;
    readonly theme: number;
    readonly stay: number;
    readonly startPlace: string | null;
    readonly endPlace: string | null;
    readonly pricePerPerson: number;
    readonly totalPrice: number;
    readonly priceBeforeDiscount: number | null;
    readonly activityMessage: string | null;
    readonly priceMessage: string | null;
    readonly tag: { readonly text: string | null; readonly backgroundColor: string; readonly textColor: string };
    readonly packageImage: string | null;
    readonly bannerImage: string | null;
    readonly parks: readonly ParkOfVersion[];
    readonly features: readonly number[];
    readonly gallery: GalleryCopy | null;
    readonly overview: string | null;
    readonly days: readonly DayDetail[];
    readonly inclusions: readonly InclusionChoice[];
    readonly moreInclusions: string | null;
    readonly exclusions: string | null;
    readonly gettingThere: string | null;
    readonly faqs: readonly { readonly id: number; readonly question: string; readonly answer: string }[];
    readonly saved: {
        readonly basic: boolean;
        readonly itinerary: boolean;
        readonly inclusions: boolean;
        readonly gettingThere: boolean;
        readonly faqs: boolean;
    };
    readonly canEdit: boolean;
};

export type PackagePartnerRef = {
    readonly id: number;
    readonly businessName: string | null;
    readonly isActive: boolean;
};

export type PackageSummary = {
    readonly id: number;
    readonly slug: string;
    readonly websiteStatus: PackageWebsiteStatusCode;
    readonly isPopular: boolean;
    readonly isBestDeal: boolean;
    readonly firstLiveAt: string | null;
    readonly partner: PackagePartnerRef;
    readonly live: { readonly id: number; readonly versionNumber: number } | null;
    readonly working: {
        readonly id: number;
        readonly versionNumber: number;
        readonly status: PackageVersionStatusCode;
    } | null;
    readonly deleted: {
        readonly reasonName: string | null;
        readonly details: string | null;
        readonly deletedAt: string | null;
    } | null;
    readonly actions: readonly PortalActionKey[];
    readonly versions: readonly VersionSummary[];
};

export type PackageListItem = {
    readonly id: number;
    readonly slug: string;
    readonly name: string;
    readonly parkNames: string | null;
    readonly websiteStatus: PackageWebsiteStatusCode;
    readonly isPopular: boolean;
    readonly isBestDeal: boolean;
    readonly partner: PackagePartnerRef;
    readonly live: { readonly id: number; readonly versionNumber: number } | null;
    readonly working: {
        readonly id: number;
        readonly versionNumber: number;
        readonly status: PackageVersionStatusCode;
    } | null;
    readonly actions: readonly PortalActionKey[];
    readonly updatedAt: string;
    readonly shownVersionId: number | null;
    readonly packageImage: string | null;
    readonly mainPark: ParkOfVersion | null;
};

export type ApprovalItem = {
    readonly versionId: number;
    readonly packageId: number;
    readonly versionNumber: number;
    readonly name: string;
    readonly parkNames: string | null;
    readonly partner: { readonly id: number; readonly businessName: string | null };
    readonly liveVersionNumber: number | null;
    readonly sentAt: string | null;
    readonly packageImage: string | null;
    readonly mainPark: ParkOfVersion | null;
};

export type PackageView = { readonly package: PackageSummary; readonly version: VersionDetail };

export type SavedSection = PackageView & { readonly mealsTicked: boolean };

export type DeletedVersion = { readonly package: PackageSummary | null; readonly packageLeftList: boolean };

export type FormOptions = {
    readonly parks: readonly { readonly id: number; readonly name: string }[];
    readonly galleries: readonly {
        readonly id: number;
        readonly title: string;
        readonly park: { readonly id: number; readonly name: string | null };
        readonly photoCount: number;
    }[];
};

export type DashboardPackage = {
    readonly id: number;
    readonly name: string;
    readonly parkNames: string | null;
    readonly dayCount: number;
    readonly nightCount: number;
    readonly pricePerPerson: number;
    readonly liveVersionId: number;
    readonly liveVersionNumber: number;
    readonly packageImage: string | null;
    readonly mainPark: ParkOfVersion | null;
};

export type PartnerDashboard = { readonly latestActivePackages: readonly DashboardPackage[] };

export type DeleteReason = {
    readonly id: number;
    readonly name: string;
    readonly status: DeleteReasonStatusCode;
    readonly usedCount: number;
    readonly createdAt: string;
};

export type PackageListFilters = {
    readonly search: string;
    readonly websiteStatus: PackageWebsiteStatusCode | undefined;
    readonly partnerId: number | undefined;
    readonly page: number;
};

export type ApprovalFilters = { readonly search: string; readonly page: number };

export type DeleteReasonFilters = {
    readonly search: string;
    readonly status: DeleteReasonStatusCode | undefined;
    readonly page: number;
};

export type EditorMode = 'partner' | 'admin';

export type BasicBody = {
    readonly name: string;
    readonly masterParkIds: readonly number[];
    readonly dayCount: number;
    readonly safariCount: number;
    readonly safariType: number;
    readonly vehicle: number;
    readonly theme: number;
    readonly stay: number;
    readonly features: readonly number[];
    readonly startPlace: string | null;
    readonly endPlace: string | null;
    readonly pricePerPerson: number;
    readonly totalPrice: number;
    readonly priceBeforeDiscount: number | null;
    readonly activityMessage: string | null;
    readonly priceMessage: string | null;
    readonly tagText: string | null;
    readonly tagBackgroundColor: string;
    readonly tagTextColor: string;
    readonly galleryId: number | null;
    readonly overview: string | null;
    readonly confirmDayRemoval: boolean;
};

export type DayBody = {
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
    readonly galleryId: number | null;
};

export type InclusionsBody = {
    readonly inclusions: readonly InclusionChoice[];
    readonly moreInclusions: string | null;
    readonly exclusions: string | null;
};

export type FaqBody = { readonly question: string; readonly answer: string };
