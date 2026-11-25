import type {
    DeleteReasonStatusCode,
    InclusionCode,
    PackageFeatureCode,
    PackageImageKindKey,
    PackageThemeCode,
    PackageVersionStatusCode,
    PackageWebsiteStatusCode,
    PortalActionKey,
    SafariTypeCode,
    StayCode,
    VehicleCode,
    WebsiteSortKey,
} from '../types/package.types';

export type BasicSection = {
    readonly name: string;
    readonly masterParkIds: readonly number[];
    readonly dayCount: number;
    readonly safariCount: number;
    readonly safariType: SafariTypeCode;
    readonly vehicle: VehicleCode;
    readonly theme: PackageThemeCode;
    readonly stay: StayCode;
    readonly features: readonly PackageFeatureCode[];
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

export type ItineraryDayInput = {
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

export type ItinerarySection = { readonly days: readonly ItineraryDayInput[] };

export type InclusionChoice = { readonly inclusion: InclusionCode; readonly isIncluded: boolean };

export type InclusionsSection = {
    readonly inclusions: readonly InclusionChoice[];
    readonly moreInclusions: string | null;
    readonly exclusions: string | null;
};

export type GettingThereSection = { readonly gettingThere: string | null };

export type FaqInput = { readonly question: string; readonly answer: string };

export type FaqsSection = { readonly faqs: readonly FaqInput[] };

export type IncomingImage = { readonly originalName: string; readonly content: Buffer };

export type PackageEditor =
    | { readonly kind: 'partner'; readonly userId: number; readonly partnerId: number }
    | { readonly kind: 'admin'; readonly userId: number };

export type ParkOfVersionDto = {
    readonly id: number;
    readonly name: string | null;
    readonly slug: string | null;
    readonly featureImage: string | null;
    readonly isMain: boolean;
};

export type PhotoDto = {
    readonly id: number;
    readonly fileName: string;
    readonly title: string | null;
    readonly caption: string | null;
};

export type GalleryCopyDto = {
    readonly galleryId: number;
    readonly title: string | null;
    readonly photos: readonly PhotoDto[];
};

export type DayDto = {
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
    readonly gallery: GalleryCopyDto | null;
};

export type VersionContentDto = {
    readonly name: string;
    readonly dayCount: number;
    readonly nightCount: number;
    readonly safariCount: number;
    readonly safariType: SafariTypeCode;
    readonly vehicle: VehicleCode;
    readonly theme: PackageThemeCode;
    readonly stay: StayCode;
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
    readonly parks: readonly ParkOfVersionDto[];
    readonly features: readonly PackageFeatureCode[];
    readonly gallery: GalleryCopyDto | null;
    readonly overview: string | null;
    readonly days: readonly DayDto[];
    readonly inclusions: readonly InclusionChoice[];
    readonly moreInclusions: string | null;
    readonly exclusions: string | null;
    readonly gettingThere: string | null;
    readonly faqs: readonly { readonly id: number; readonly question: string; readonly answer: string }[];
};

export type VersionSummaryDto = {
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

export type VersionDetailDto = VersionSummaryDto &
    VersionContentDto & {
        readonly packageId: number;
        readonly saved: {
            readonly basic: boolean;
            readonly itinerary: boolean;
            readonly inclusions: boolean;
            readonly gettingThere: boolean;
            readonly faqs: boolean;
        };
        readonly canEdit: boolean;
    };

export type PackageSummaryDto = {
    readonly id: number;
    readonly slug: string;
    readonly websiteStatus: PackageWebsiteStatusCode;
    readonly isPopular: boolean;
    readonly isBestDeal: boolean;
    readonly firstLiveAt: string | null;
    readonly partner: { readonly id: number; readonly businessName: string | null; readonly isActive: boolean };
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
    readonly versions: readonly VersionSummaryDto[];
};

export type PackageListItemDto = {
    readonly id: number;
    readonly slug: string;
    readonly name: string;
    readonly parkNames: string | null;
    readonly websiteStatus: PackageWebsiteStatusCode;
    readonly isPopular: boolean;
    readonly isBestDeal: boolean;
    readonly partner: { readonly id: number; readonly businessName: string | null; readonly isActive: boolean };
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
    readonly mainPark: ParkOfVersionDto | null;
};

export type PortalListFilters = {
    readonly search: string | undefined;
    readonly websiteStatus: PackageWebsiteStatusCode | undefined;
};

export type ConsoleListFilters = PortalListFilters & { readonly partnerId: number | undefined };

export type Page<T> = { readonly items: readonly T[]; readonly total: number };

export type ApprovalItemDto = {
    readonly versionId: number;
    readonly packageId: number;
    readonly versionNumber: number;
    readonly name: string;
    readonly parkNames: string | null;
    readonly partner: { readonly id: number; readonly businessName: string | null };
    readonly liveVersionNumber: number | null;
    readonly sentAt: string | null;
    readonly packageImage: string | null;
    readonly mainPark: ParkOfVersionDto | null;
};

export type SavedSectionDto = {
    readonly package: PackageSummaryDto;
    readonly version: VersionDetailDto;
    readonly mealsTicked: boolean;
};

export type PackageViewDto = {
    readonly package: PackageSummaryDto;
    readonly version: VersionDetailDto;
};

export type DeletedVersionDto = {
    readonly package: PackageSummaryDto | null;
    readonly packageLeftList: boolean;
};

export type FormOptionsDto = {
    readonly parks: readonly { readonly id: number; readonly name: string }[];
    readonly galleries: readonly {
        readonly id: number;
        readonly title: string;
        readonly park: { readonly id: number; readonly name: string | null };
        readonly photoCount: number;
    }[];
};

export type DashboardPackageDto = {
    readonly id: number;
    readonly name: string;
    readonly parkNames: string | null;
    readonly dayCount: number;
    readonly nightCount: number;
    readonly pricePerPerson: number;
    readonly liveVersionId: number;
    readonly liveVersionNumber: number;
    readonly packageImage: string | null;
    readonly mainPark: ParkOfVersionDto | null;
};

export type PartnerDashboardDto = { readonly latestActivePackages: readonly DashboardPackageDto[] };

export type DeleteReasonDto = {
    readonly id: number;
    readonly name: string;
    readonly status: DeleteReasonStatusCode;
    readonly usedCount: number;
    readonly createdAt: string;
};

export type DeleteReasonFilters = {
    readonly search: string | undefined;
    readonly status: DeleteReasonStatusCode | undefined;
};

export type DeleteReasonInput = { readonly name: string; readonly status: DeleteReasonStatusCode };

export type AdminDeleteInput = { readonly masterPackageDeleteReasonId: number; readonly details: string };

export type PackageFile = { readonly content: Buffer; readonly contentType: string };

export type ImageTarget = { readonly kind: PackageImageKindKey } | { readonly dayNumber: number };

export type WebsiteFilters = {
    readonly search: string | undefined;
    readonly masterParkId: number | undefined;
    readonly priceMin: number | undefined;
    readonly priceMax: number | undefined;
    readonly nightsMin: number | undefined;
    readonly nightsMax: number | undefined;
    readonly safarisMin: number | undefined;
    readonly safarisMax: number | undefined;
    readonly stays: readonly StayCode[];
    readonly features: readonly PackageFeatureCode[];
    readonly inclusions: readonly InclusionCode[];
};

export type WebsiteQuery = WebsiteFilters & { readonly sort: WebsiteSortKey; readonly page: number };

export type WebsiteCardDto = {
    readonly id: number;
    readonly slug: string;
    readonly name: string;
    readonly mainPark: ParkOfVersionDto | null;
    readonly parks: readonly ParkOfVersionDto[];
    readonly dayCount: number;
    readonly nightCount: number;
    readonly safariCount: number;
    readonly safariType: SafariTypeCode;
    readonly activityMessage: string | null;
    readonly pricePerPerson: number;
    readonly totalPrice: number;
    readonly priceBeforeDiscount: number | null;
    readonly priceMessage: string | null;
    readonly tag: { readonly text: string | null; readonly backgroundColor: string; readonly textColor: string };
    readonly packageImage: string | null;
    readonly isPopular: boolean;
    readonly isBestDeal: boolean;
    readonly partner: { readonly id: number; readonly businessName: string };
};

export type WebsitePageDto = {
    readonly items: readonly WebsiteCardDto[];
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
    readonly hasMore: boolean;
};

export type WebsitePackageDto = WebsiteCardDto &
    VersionContentDto & {
        readonly versionId: number;
        readonly versionNumber: number;
    };

export type WebsitePackageView =
    | { readonly inUse: true; readonly package: WebsitePackageDto }
    | { readonly inUse: false; readonly package: null };

export type ShownPackageRef = {
    readonly packageId: number;
    readonly slug: string;
    readonly partnerId: number;
    readonly partnerUserId: number;
    readonly businessName: string;
    readonly liveVersionId: number;
    readonly liveVersionNumber: number;
    readonly name: string;
    readonly pricePerPerson: number;
};

export type ParkPriceRange = {
    readonly masterParkId: number;
    readonly lowestPricePerPerson: number;
    readonly highestPricePerPerson: number;
    readonly packageCount: number;
};
