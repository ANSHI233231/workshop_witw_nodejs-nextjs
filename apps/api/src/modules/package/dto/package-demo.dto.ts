import type {
    InclusionCode,
    MealCode,
    PackageFeatureCode,
    PackageThemeCode,
    PackageVersionStatusCode,
    PackageWebsiteStatusCode,
    SafariTypeCode,
    StayCode,
    VehicleCode,
} from '../types/package.types';

export type DemoPackagePhoto = {
    readonly picture: string;
    readonly title: string | null;
    readonly caption: string | null;
};

export type DemoPackageGallery = {
    readonly galleryId: number;
    readonly title: string;
    readonly photos: readonly DemoPackagePhoto[];
};

export type DemoPackageDay = {
    readonly title: string;
    readonly description: string;
    readonly startLocation: string | null;
    readonly endLocation: string | null;
    readonly hotelName: string | null;
    readonly meals: readonly MealCode[];
    readonly activity: string | null;
    readonly accommodation: string | null;
    readonly note: string | null;
    readonly picture: string | null;
    readonly gallery: DemoPackageGallery | null;
};

export type DemoPackageVersion = {
    readonly status: PackageVersionStatusCode;
    readonly createdAt: Date;
    readonly sentAt: Date | null;
    readonly decidedAt: Date | null;
    readonly rejectReason: string | null;
    readonly name: string;
    readonly masterParkIds: readonly number[];
    readonly dayCount: number;
    readonly safariType: SafariTypeCode;
    readonly vehicle: VehicleCode;
    readonly theme: PackageThemeCode;
    readonly stay: StayCode;
    readonly safariCount: number;
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
    readonly packagePicture: string | null;
    readonly bannerPicture: string | null;
    readonly gallery: DemoPackageGallery | null;
    readonly overview: string | null;
    readonly days: readonly DemoPackageDay[];
    readonly inclusions: readonly { readonly inclusion: InclusionCode; readonly isIncluded: boolean }[];
    readonly moreInclusions: string | null;
    readonly exclusions: string | null;
    readonly gettingThere: string | null;
    readonly faqs: readonly { readonly question: string; readonly answer: string }[];
    readonly saved: {
        readonly itinerary: boolean;
        readonly inclusions: boolean;
        readonly gettingThere: boolean;
        readonly faqs: boolean;
    };
};

export type DemoPackage = {
    readonly partnerId: number;
    readonly userId: number;
    readonly slug: string;
    readonly websiteStatus: PackageWebsiteStatusCode;
    readonly isPopular: boolean;
    readonly isBestDeal: boolean;
    readonly deleteReasonName: string | null;
    readonly deleteDetails: string | null;
    readonly deletedAt: Date | null;
    readonly versions: readonly DemoPackageVersion[];
};

export type DemoPackageOutcome = {
    readonly slug: string;
    readonly packageId: number;
    readonly created: boolean;
};
