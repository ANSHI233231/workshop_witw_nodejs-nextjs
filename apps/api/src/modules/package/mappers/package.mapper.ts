import type {
    ApprovalItemDto,
    DayDto,
    DeleteReasonDto,
    GalleryCopyDto,
    InclusionChoice,
    PackageListItemDto,
    PackageSummaryDto,
    ParkOfVersionDto,
    PhotoDto,
    VersionContentDto,
    VersionDetailDto,
    VersionSummaryDto,
} from '../dto/package.dto';
import {
    type ApprovalRow,
    type DayRow,
    type DeleteReasonRow,
    type FaqRow,
    type InclusionCode,
    type PackageFeatureCode,
    type PackageListRow,
    PackageRowStatus,
    type PackageRow,
    PackageWebsiteStatus,
    type PhotoRow,
    type PortalActionKey,
    type VersionCodeRow,
    type VersionParkRow,
    type VersionRow,
} from '../types/package.types';

export const isoOf = (value: Date | null): string | null => (value === null ? null : value.toISOString());

export type VersionChildren = {
    readonly parks: readonly VersionParkRow[];
    readonly features: readonly VersionCodeRow[];
    readonly inclusions: readonly VersionCodeRow[];
    readonly days: readonly DayRow[];
    readonly faqs: readonly FaqRow[];
    readonly photos: readonly PhotoRow[];
};

export const toPark = (row: VersionParkRow, index: number): ParkOfVersionDto => ({
    id: row.master_park_id,
    name: row.name,
    slug: row.slug,
    featureImage: row.feature_image,
    isMain: index === 0,
});

const toPhoto = (row: PhotoRow): PhotoDto => ({
    id: row.id,
    fileName: row.file_name,
    title: row.title,
    caption: row.caption,
});

const galleryOf = (
    galleryId: number | null,
    title: string | null,
    photos: readonly PhotoRow[],
): GalleryCopyDto | null => (galleryId === null ? null : { galleryId, title, photos: photos.map(toPhoto) });

const activePhotos = (photos: readonly PhotoRow[], dayId: number | null): PhotoRow[] =>
    photos.filter((photo) => photo.status === PackageRowStatus.ACTIVE && photo.package_version_day_id === dayId);

const toDay = (row: DayRow, photos: readonly PhotoRow[]): DayDto => ({
    id: row.id,
    dayNumber: row.day_number,
    title: row.title,
    description: row.description,
    startLocation: row.start_location,
    endLocation: row.end_location,
    hotelName: row.hotel_name,
    hasBreakfast: row.has_breakfast === 1,
    hasLunch: row.has_lunch === 1,
    hasDinner: row.has_dinner === 1,
    activity: row.activity,
    accommodation: row.accommodation,
    note: row.note,
    dayImage: row.day_image,
    gallery: galleryOf(row.gallery_id, row.gallery_title, activePhotos(photos, row.id)),
});

export const toVersionSummary = (row: VersionRow): VersionSummaryDto => ({
    id: row.id,
    versionNumber: row.version_number,
    status: row.status,
    rejectReason: row.reject_reason,
    createdAt: row.created_at.toISOString(),
    sentAt: isoOf(row.sent_at),
    decidedAt: isoOf(row.decided_at),
    replacedAt: isoOf(row.replaced_at),
    deletedAt: isoOf(row.deleted_at),
    adminEditedAt: isoOf(row.admin_edited_at),
});

export const toContent = (row: VersionRow, children: VersionChildren): VersionContentDto => ({
    name: row.name,
    dayCount: row.day_count,
    nightCount: row.day_count - 1,
    safariCount: row.safari_count,
    safariType: row.safari_type,
    vehicle: row.vehicle,
    theme: row.theme,
    stay: row.stay,
    startPlace: row.start_place,
    endPlace: row.end_place,
    pricePerPerson: row.price_per_person,
    totalPrice: row.total_price,
    priceBeforeDiscount: row.price_before_discount,
    activityMessage: row.activity_message,
    priceMessage: row.price_message,
    tag: { text: row.tag_text, backgroundColor: row.tag_background_color, textColor: row.tag_text_color },
    packageImage: row.package_image,
    bannerImage: row.banner_image,
    parks: children.parks.map(toPark),
    features: children.features.map((feature) => feature.code as PackageFeatureCode),
    gallery: galleryOf(row.gallery_id, row.gallery_title, activePhotos(children.photos, null)),
    overview: row.overview,
    days: children.days.map((day) => toDay(day, children.photos)),
    inclusions: children.inclusions.map(
        (choice): InclusionChoice => ({ inclusion: choice.code as InclusionCode, isIncluded: choice.is_included === 1 }),
    ),
    moreInclusions: row.more_inclusions,
    exclusions: row.exclusions,
    gettingThere: row.getting_there,
    faqs: children.faqs.map((faq) => ({ id: faq.id, question: faq.question, answer: faq.answer })),
});

export const toVersionDetail = (row: VersionRow, children: VersionChildren, canEdit: boolean): VersionDetailDto => ({
    ...toVersionSummary(row),
    ...toContent(row, children),
    packageId: row.package_id,
    saved: {
        basic: true,
        itinerary: row.is_itinerary_saved === 1,
        inclusions: row.is_inclusions_saved === 1,
        gettingThere: row.is_getting_there_saved === 1,
        faqs: row.is_faqs_saved === 1,
    },
    canEdit,
});

const packageParts = (row: PackageRow, partnerIsActive: boolean) => ({
    id: row.id,
    slug: row.slug,
    websiteStatus: row.website_status,
    isPopular: row.is_popular === 1,
    isBestDeal: row.is_best_deal === 1,
    partner: { id: row.partner_id, businessName: row.business_name, isActive: partnerIsActive },
    live:
        row.live_version_id === null || row.live_version_number === null
            ? null
            : { id: row.live_version_id, versionNumber: row.live_version_number },
    working:
        row.working_version_id === null || row.working_version_number === null || row.working_status === null
            ? null
            : { id: row.working_version_id, versionNumber: row.working_version_number, status: row.working_status },
});

export const toSummary = (
    row: PackageRow,
    versions: readonly VersionRow[],
    actions: readonly PortalActionKey[],
    partnerIsActive: boolean,
): PackageSummaryDto => ({
    ...packageParts(row, partnerIsActive),
    firstLiveAt: isoOf(row.first_live_at),
    deleted:
        row.website_status === PackageWebsiteStatus.DELETED_BY_ADMIN
            ? { reasonName: row.delete_reason_name, details: row.delete_details, deletedAt: isoOf(row.deleted_at) }
            : null,
    actions,
    versions: versions.map(toVersionSummary),
});

export type MainParks = ReadonlyMap<number, ParkOfVersionDto>;

export const mainParkOf = (mainParks: MainParks, versionId: number | null): ParkOfVersionDto | null =>
    versionId === null ? null : (mainParks.get(versionId) ?? null);

export const toMainParks = (rows: readonly VersionParkRow[]): MainParks => {
    const mainParks = new Map<number, ParkOfVersionDto>();
    for (const row of rows) {
        if (!mainParks.has(row.package_version_id)) mainParks.set(row.package_version_id, toPark(row, 0));
    }
    return mainParks;
};

export const toListItem = (
    row: PackageListRow,
    actions: readonly PortalActionKey[],
    partnerIsActive: boolean,
    mainParks: MainParks,
): PackageListItemDto => ({
    ...packageParts(row, partnerIsActive),
    name: row.name,
    parkNames: row.park_names,
    actions,
    updatedAt: row.last_changed_at.toISOString(),
    shownVersionId: row.shown_version_id,
    packageImage: row.package_image,
    mainPark: mainParkOf(mainParks, row.shown_version_id),
});

export const toApprovalItem = (row: ApprovalRow, mainParks: MainParks): ApprovalItemDto => ({
    versionId: row.version_id,
    packageId: row.package_id,
    versionNumber: row.version_number,
    name: row.name,
    parkNames: row.park_names,
    partner: { id: row.partner_id, businessName: row.business_name },
    liveVersionNumber: row.live_version_number,
    sentAt: isoOf(row.sent_at),
    packageImage: row.package_image,
    mainPark: mainParkOf(mainParks, row.version_id),
});

export const toDeleteReason = (row: DeleteReasonRow): DeleteReasonDto => ({
    id: row.id,
    name: row.name,
    status: row.status,
    usedCount: Number(row.used_count),
    createdAt: row.created_at.toISOString(),
});
