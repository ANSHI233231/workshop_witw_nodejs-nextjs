import { type PaginationQuery, toOffset } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { BasicSection, ConsoleListFilters, FaqInput, InclusionChoice, PortalListFilters } from '../dto/package.dto';
import { DEMO_CHILD_TABLES, PackageDemoSQL } from '../sql/package-demo.sql';
import { PackageSQL, type PackageListShape } from '../sql/package.sql';
import { VersionSQL } from '../sql/package-version.sql';
import {
    type ApprovalRow,
    CONSOLE_WEBSITE_STATUSES,
    type CountRow,
    type DayRow,
    type FaqRow,
    LISTED_WEBSITE_STATUSES,
    LIVE_WEBSITE_STATUSES,
    type PackageFeatureCode,
    type PackageImageKindKey,
    PackageImageKind,
    type PackageListRow,
    PackageRowStatus,
    type PackageRow,
    PackageVersionStatus,
    type PackageVersionStatusCode,
    PackageWebsiteStatus,
    type PackageWebsiteStatusCode,
    PARTNER_EDITABLE_STATUSES,
    ADMIN_EDITABLE_STATUSES,
    type PhotoRow,
    type VersionCodeRow,
    type VersionParkRow,
    type VersionRow,
} from '../types/package.types';

const ACTIVE = PackageRowStatus.ACTIVE;
const DELETED = PackageRowStatus.DELETED;

export const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

export type NewPhoto = {
    readonly fileName: string;
    readonly title: string | null;
    readonly caption: string | null;
    readonly sortOrder: number;
};

export type DayWrite = {
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
    readonly galleryId: number | null;
    readonly galleryTitle: string | null;
};

export type DemoVersionWrite = {
    readonly versionNumber: number;
    readonly basic: Omit<BasicSection, 'masterParkIds' | 'features' | 'galleryId' | 'confirmDayRemoval'>;
    readonly packageImage: string | null;
    readonly bannerImage: string | null;
    readonly galleryId: number | null;
    readonly galleryTitle: string | null;
    readonly moreInclusions: string | null;
    readonly exclusions: string | null;
    readonly gettingThere: string | null;
    readonly saved: { readonly itinerary: boolean; readonly inclusions: boolean; readonly gettingThere: boolean; readonly faqs: boolean };
    readonly rejectReason: string | null;
    readonly sentAt: Date | null;
    readonly decidedAt: Date | null;
    readonly decidedBy: number | null;
    readonly replacedAt: Date | null;
    readonly status: PackageVersionStatusCode;
    readonly createdAt: Date;
    readonly actorId: number;
};

export type DemoPackageWrite = {
    readonly partnerId: number;
    readonly slug: string;
    readonly websiteStatus: PackageWebsiteStatusCode;
    readonly isPopular: boolean;
    readonly isBestDeal: boolean;
    readonly firstLiveAt: Date | null;
    readonly deleteReasonId: number | null;
    readonly deleteReasonName: string | null;
    readonly deleteDetails: string | null;
    readonly deletedAt: Date | null;
    readonly deletedBy: number | null;
    readonly createdAt: Date;
    readonly actorId: number;
};

const listShape = (filters: PortalListFilters, partner: boolean, statusCount: number): PackageListShape => ({
    websiteStatus: filters.websiteStatus !== undefined,
    partner,
    search: filters.search !== undefined,
    statusCount,
});

const listValues = (filters: PortalListFilters, partnerId: number | undefined): unknown[] => [
    ...(filters.websiteStatus === undefined ? [] : [filters.websiteStatus]),
    ...(partnerId === undefined ? [] : [partnerId]),
    ...(filters.search === undefined ? [] : [likeAnywhere(filters.search)]),
];

const basicValues = (basic: DemoVersionWrite['basic']): unknown[] => [
    basic.name,
    basic.dayCount,
    basic.safariCount,
    basic.safariType,
    basic.vehicle,
    basic.theme,
    basic.stay,
    basic.startPlace,
    basic.endPlace,
    basic.pricePerPerson,
    basic.totalPrice,
    basic.priceBeforeDiscount,
    basic.activityMessage,
    basic.priceMessage,
    basic.tagText,
    basic.tagBackgroundColor,
    basic.tagTextColor,
    basic.overview,
];

const flag = (value: boolean): number => (value ? 1 : 0);

export class PackageRepository {
    async findById(db: DbExecutor, id: number): Promise<PackageRow | undefined> {
        return (await db.query<PackageRow>(PackageSQL.findById, [id]))[0];
    }

    async findBySlug(db: DbExecutor, slug: string): Promise<PackageRow | undefined> {
        return (await db.query<PackageRow>(PackageSQL.findBySlug, [slug]))[0];
    }

    async slugTaken(db: DbExecutor, slug: string): Promise<boolean> {
        const rows = await db.query<CountRow>(PackageSQL.slugTaken, [slug]);
        return Number(rows[0]?.total ?? 0) > 0;
    }

    async listOfPartner(db: DbExecutor, partnerId: number, filters: PortalListFilters): Promise<PackageListRow[]> {
        return db.query<PackageListRow>(
            PackageSQL.listOfPartner(listShape(filters, true, LISTED_WEBSITE_STATUSES.length)),
            [...LISTED_WEBSITE_STATUSES, ...listValues(filters, partnerId)],
        );
    }

    async listForConsole(db: DbExecutor, filters: ConsoleListFilters, pagination: PaginationQuery): Promise<PackageListRow[]> {
        const shape = listShape(filters, filters.partnerId !== undefined, CONSOLE_WEBSITE_STATUSES.length);
        return db.query<PackageListRow>(PackageSQL.listForConsole(shape), [
            ...CONSOLE_WEBSITE_STATUSES,
            ...listValues(filters, filters.partnerId),
            pagination.limit,
            toOffset(pagination),
        ]);
    }

    async countForConsole(db: DbExecutor, filters: ConsoleListFilters): Promise<number> {
        const shape = listShape(filters, filters.partnerId !== undefined, CONSOLE_WEBSITE_STATUSES.length);
        const rows = await db.query<CountRow>(PackageSQL.countForConsole(shape), [
            ...CONSOLE_WEBSITE_STATUSES,
            ...listValues(filters, filters.partnerId),
        ]);
        return Number(rows[0]?.total ?? 0);
    }

    async latestActiveOfPartner(db: DbExecutor, partnerId: number, limit: number): Promise<PackageListRow[]> {
        return db.query<PackageListRow>(PackageSQL.latestActiveOfPartner, [partnerId, PackageWebsiteStatus.ACTIVE, limit]);
    }

    async insert(db: DbExecutor, partnerId: number, slug: string, actorId: number): Promise<number> {
        const result = await db.execute(PackageSQL.insert, [partnerId, slug, PackageWebsiteStatus.NOT_LIVE, actorId, actorId]);
        return result.insertId;
    }

    async setWebsiteStatus(
        db: DbExecutor,
        id: number,
        from: PackageWebsiteStatusCode,
        to: PackageWebsiteStatusCode,
        actorId: number,
    ): Promise<boolean> {
        const result = await db.execute(PackageSQL.setWebsiteStatus, [to, actorId, id, from]);
        return result.affectedRows > 0;
    }

    async goLive(db: DbExecutor, id: number, actorId: number): Promise<boolean> {
        const from = [PackageWebsiteStatus.NOT_LIVE, ...LIVE_WEBSITE_STATUSES];
        const result = await db.execute(PackageSQL.goLive(from.length), [PackageWebsiteStatus.ACTIVE, actorId, id, ...from]);
        return result.affectedRows > 0;
    }

    async deleteByAdmin(
        db: DbExecutor,
        id: number,
        reason: { readonly id: number; readonly name: string },
        details: string,
        actorId: number,
    ): Promise<boolean> {
        const result = await db.execute(PackageSQL.deleteByAdmin(LIVE_WEBSITE_STATUSES.length), [
            PackageWebsiteStatus.DELETED_BY_ADMIN,
            reason.id,
            reason.name,
            details,
            actorId,
            actorId,
            id,
            ...LIVE_WEBSITE_STATUSES,
        ]);
        return result.affectedRows > 0;
    }

    async setPopular(db: DbExecutor, id: number, isPopular: boolean, actorId: number): Promise<boolean> {
        const result = await db.execute(PackageSQL.setPopular(LIVE_WEBSITE_STATUSES.length), [
            flag(isPopular),
            actorId,
            id,
            ...LIVE_WEBSITE_STATUSES,
        ]);
        return result.affectedRows > 0;
    }

    async setBestDeal(db: DbExecutor, id: number, isBestDeal: boolean, actorId: number): Promise<boolean> {
        const result = await db.execute(PackageSQL.setBestDeal(LIVE_WEBSITE_STATUSES.length), [
            flag(isBestDeal),
            actorId,
            id,
            ...LIVE_WEBSITE_STATUSES,
        ]);
        return result.affectedRows > 0;
    }

    async touch(db: DbExecutor, id: number, actorId: number): Promise<void> {
        await db.execute(PackageSQL.touch, [actorId, id]);
    }

    async findVersion(db: DbExecutor, packageId: number, versionId: number): Promise<VersionRow | undefined> {
        return (await db.query<VersionRow>(VersionSQL.findById, [versionId, packageId]))[0];
    }

    async versionsOf(db: DbExecutor, packageId: number): Promise<VersionRow[]> {
        return db.query<VersionRow>(VersionSQL.versionsOf, [packageId]);
    }

    async versionsByIds(db: DbExecutor, ids: readonly number[]): Promise<VersionRow[]> {
        if (ids.length === 0) return [];
        return db.query<VersionRow>(VersionSQL.byIds(ids.length), [...ids]);
    }

    async nextVersionNumber(db: DbExecutor, packageId: number): Promise<number> {
        const rows = await db.query<CountRow>(VersionSQL.nextNumber, [packageId]);
        return Number(rows[0]?.total ?? 1);
    }

    async parksOf(db: DbExecutor, versionIds: readonly number[]): Promise<VersionParkRow[]> {
        if (versionIds.length === 0) return [];
        return db.query<VersionParkRow>(VersionSQL.parksOf(versionIds.length), [...versionIds, ACTIVE]);
    }

    async featuresOf(db: DbExecutor, versionIds: readonly number[]): Promise<VersionCodeRow[]> {
        if (versionIds.length === 0) return [];
        return db.query<VersionCodeRow>(VersionSQL.featuresOf(versionIds.length), [...versionIds, ACTIVE]);
    }

    async inclusionsOf(db: DbExecutor, versionIds: readonly number[]): Promise<VersionCodeRow[]> {
        if (versionIds.length === 0) return [];
        return db.query<VersionCodeRow>(VersionSQL.inclusionsOf(versionIds.length), [...versionIds, ACTIVE]);
    }

    async daysOf(db: DbExecutor, versionId: number): Promise<DayRow[]> {
        return db.query<DayRow>(VersionSQL.daysOf, [versionId, ACTIVE]);
    }

    async faqsOf(db: DbExecutor, versionId: number): Promise<FaqRow[]> {
        return db.query<FaqRow>(VersionSQL.faqsOf, [versionId, ACTIVE]);
    }

    async photosOf(db: DbExecutor, versionId: number): Promise<PhotoRow[]> {
        return db.query<PhotoRow>(VersionSQL.photosOf, [versionId]);
    }

    async insertVersion(
        db: DbExecutor,
        packageId: number,
        versionNumber: number,
        basic: BasicSection,
        actorId: number,
    ): Promise<number> {
        const result = await db.execute(VersionSQL.insert, [
            packageId,
            versionNumber,
            ...basicValues(basic),
            PackageVersionStatus.DRAFT,
            actorId,
            actorId,
        ]);
        return result.insertId;
    }

    async copyVersion(db: DbExecutor, fromId: number, versionNumber: number, actorId: number): Promise<number> {
        const result = await db.execute(VersionSQL.copyFrom, [
            versionNumber,
            PackageVersionStatus.DRAFT,
            actorId,
            actorId,
            fromId,
        ]);
        return result.insertId;
    }

    async copyChildren(db: DbExecutor, fromId: number, toId: number, actorId: number): Promise<void> {
        for (const sql of [VersionSQL.copyParks, VersionSQL.copyFeatures, VersionSQL.copyInclusions, VersionSQL.copyFaqs]) {
            await db.execute(sql, [toId, actorId, actorId, fromId, ACTIVE]);
        }
        await db.execute(VersionSQL.copyPhotos, [toId, null, actorId, actorId, fromId, null, ACTIVE]);
        for (const day of await this.daysOf(db, fromId)) {
            const dayId = await this.insertDay(db, toId, { ...this.dayWriteOf(day) }, actorId);
            await db.execute(VersionSQL.copyPhotos, [toId, dayId, actorId, actorId, fromId, day.id, ACTIVE]);
        }
    }

    async touchByPartner(db: DbExecutor, versionId: number, actorId: number): Promise<boolean> {
        const result = await db.execute(VersionSQL.touchByPartner(PARTNER_EDITABLE_STATUSES.length), [
            PackageVersionStatus.DRAFT,
            actorId,
            versionId,
            ...PARTNER_EDITABLE_STATUSES,
        ]);
        return result.affectedRows > 0;
    }

    async touchByAdmin(db: DbExecutor, versionId: number, actorId: number): Promise<boolean> {
        const result = await db.execute(VersionSQL.touchByAdmin(ADMIN_EDITABLE_STATUSES.length), [
            actorId,
            actorId,
            versionId,
            ...ADMIN_EDITABLE_STATUSES,
        ]);
        return result.affectedRows > 0;
    }

    async updateBasic(db: DbExecutor, versionId: number, basic: BasicSection, actorId: number): Promise<void> {
        await db.execute(VersionSQL.updateBasic, [...basicValues(basic), actorId, versionId]);
    }

    async setGallery(
        db: DbExecutor,
        versionId: number,
        gallery: { readonly id: number; readonly title: string } | null,
        actorId: number,
    ): Promise<void> {
        await db.execute(VersionSQL.setGallery, [gallery?.id ?? null, gallery?.title ?? null, actorId, versionId]);
    }

    async setImage(
        db: DbExecutor,
        versionId: number,
        kind: PackageImageKindKey,
        fileName: string | null,
        actorId: number,
    ): Promise<void> {
        const column = kind === PackageImageKind.BANNER ? 'banner_image' : 'package_image';
        await db.execute(VersionSQL.setImage(column), [fileName, actorId, versionId]);
    }

    async replaceParks(db: DbExecutor, versionId: number, parkIds: readonly number[], actorId: number): Promise<void> {
        await db.execute(VersionSQL.clearParks, [DELETED, actorId, versionId]);
        for (const [index, parkId] of parkIds.entries()) {
            await db.execute(VersionSQL.upsertPark, [versionId, parkId, index, ACTIVE, actorId, actorId]);
        }
    }

    async replaceFeatures(
        db: DbExecutor,
        versionId: number,
        features: readonly PackageFeatureCode[],
        actorId: number,
    ): Promise<void> {
        await db.execute(VersionSQL.clearFeatures, [DELETED, actorId, versionId]);
        for (const feature of features) {
            await db.execute(VersionSQL.upsertFeature, [versionId, feature, ACTIVE, actorId, actorId]);
        }
    }

    async replaceInclusions(
        db: DbExecutor,
        versionId: number,
        inclusions: readonly InclusionChoice[],
        actorId: number,
    ): Promise<void> {
        await db.execute(VersionSQL.clearInclusions, [DELETED, actorId, versionId]);
        for (const choice of inclusions) {
            await db.execute(VersionSQL.upsertInclusion, [
                versionId,
                choice.inclusion,
                flag(choice.isIncluded),
                ACTIVE,
                actorId,
                actorId,
            ]);
        }
    }

    async insertDay(db: DbExecutor, versionId: number, day: DayWrite, actorId: number): Promise<number> {
        const result = await db.execute(VersionSQL.insertDay, [
            versionId,
            day.dayNumber,
            day.title,
            day.description,
            day.startLocation,
            day.endLocation,
            day.hotelName,
            flag(day.hasBreakfast),
            flag(day.hasLunch),
            flag(day.hasDinner),
            day.activity,
            day.accommodation,
            day.note,
            day.dayImage,
            day.galleryId,
            day.galleryTitle,
            ACTIVE,
            actorId,
            actorId,
        ]);
        return result.insertId;
    }

    async updateDay(db: DbExecutor, versionId: number, dayId: number, day: DayWrite, actorId: number): Promise<void> {
        await db.execute(VersionSQL.updateDay, [
            day.title,
            day.description,
            day.startLocation,
            day.endLocation,
            day.hotelName,
            flag(day.hasBreakfast),
            flag(day.hasLunch),
            flag(day.hasDinner),
            day.activity,
            day.accommodation,
            day.note,
            day.galleryId,
            day.galleryTitle,
            actorId,
            dayId,
            versionId,
            ACTIVE,
        ]);
    }

    async markItinerarySaved(db: DbExecutor, versionId: number, actorId: number): Promise<void> {
        await db.execute(VersionSQL.markItinerarySaved, [actorId, versionId]);
    }

    async setDayImage(
        db: DbExecutor,
        versionId: number,
        dayId: number,
        fileName: string | null,
        actorId: number,
    ): Promise<boolean> {
        const result = await db.execute(VersionSQL.setDayImage, [fileName, actorId, dayId, versionId, ACTIVE]);
        return result.affectedRows > 0;
    }

    async removeDaysAfter(db: DbExecutor, versionId: number, dayCount: number, actorId: number): Promise<number> {
        const result = await db.execute(VersionSQL.removeDaysAfter, [DELETED, actorId, versionId, dayCount, ACTIVE]);
        await db.execute(VersionSQL.clearPhotosOfRemovedDays, [DELETED, actorId, versionId, DELETED, ACTIVE]);
        return result.affectedRows;
    }

    async tickAllMeals(db: DbExecutor, versionId: number, actorId: number): Promise<void> {
        await db.execute(VersionSQL.tickAllMeals, [actorId, versionId, ACTIVE]);
    }

    async updateInclusionTexts(
        db: DbExecutor,
        versionId: number,
        moreInclusions: string | null,
        exclusions: string | null,
        actorId: number,
    ): Promise<void> {
        await db.execute(VersionSQL.updateInclusionTexts, [moreInclusions, exclusions, actorId, versionId]);
    }

    async updateGettingThere(db: DbExecutor, versionId: number, gettingThere: string | null, actorId: number): Promise<void> {
        await db.execute(VersionSQL.updateGettingThere, [gettingThere, actorId, versionId]);
    }

    async replaceFaqs(db: DbExecutor, versionId: number, faqs: readonly FaqInput[], actorId: number): Promise<void> {
        await db.execute(VersionSQL.clearFaqs, [DELETED, actorId, versionId, ACTIVE]);
        for (const [index, faq] of faqs.entries()) {
            await db.execute(VersionSQL.insertFaq, [versionId, faq.question, faq.answer, index, ACTIVE, actorId, actorId]);
        }
        await db.execute(VersionSQL.markFaqsSaved, [actorId, versionId]);
    }

    async replacePhotos(
        db: DbExecutor,
        versionId: number,
        dayId: number | null,
        photos: readonly NewPhoto[],
        actorId: number,
    ): Promise<void> {
        if (dayId === null) await db.execute(VersionSQL.clearVersionPhotos, [DELETED, actorId, versionId, ACTIVE]);
        else await db.execute(VersionSQL.clearDayPhotos, [DELETED, actorId, versionId, dayId, ACTIVE]);
        for (const photo of photos) {
            await db.execute(VersionSQL.insertPhoto, [
                versionId,
                dayId,
                photo.fileName,
                photo.title,
                photo.caption,
                photo.sortOrder,
                ACTIVE,
                actorId,
                actorId,
            ]);
        }
    }

    async send(db: DbExecutor, versionId: number, actorId: number): Promise<boolean> {
        const result = await db.execute(VersionSQL.send(PARTNER_EDITABLE_STATUSES.length), [
            PackageVersionStatus.WAITING,
            actorId,
            versionId,
            ...PARTNER_EDITABLE_STATUSES,
        ]);
        return result.affectedRows > 0;
    }

    async discard(db: DbExecutor, versionId: number, actorId: number): Promise<boolean> {
        const result = await db.execute(VersionSQL.discard(PARTNER_EDITABLE_STATUSES.length), [
            PackageVersionStatus.DISCARDED,
            actorId,
            actorId,
            versionId,
            ...PARTNER_EDITABLE_STATUSES,
        ]);
        return result.affectedRows > 0;
    }

    async replaceLive(db: DbExecutor, packageId: number, actorId: number): Promise<number> {
        const result = await db.execute(VersionSQL.replaceLive, [
            PackageVersionStatus.REPLACED,
            actorId,
            packageId,
            PackageVersionStatus.LIVE,
        ]);
        return result.affectedRows;
    }

    async approve(db: DbExecutor, versionId: number, actorId: number): Promise<boolean> {
        const result = await db.execute(VersionSQL.approve, [
            PackageVersionStatus.LIVE,
            actorId,
            actorId,
            versionId,
            PackageVersionStatus.WAITING,
        ]);
        return result.affectedRows > 0;
    }

    async reject(db: DbExecutor, versionId: number, reason: string, actorId: number): Promise<boolean> {
        const result = await db.execute(VersionSQL.reject, [
            PackageVersionStatus.REJECTED,
            reason,
            actorId,
            actorId,
            versionId,
            PackageVersionStatus.WAITING,
        ]);
        return result.affectedRows > 0;
    }

    async waitingList(db: DbExecutor, search: string | undefined, pagination: PaginationQuery): Promise<ApprovalRow[]> {
        const statuses = [PackageWebsiteStatus.NOT_LIVE, ...LIVE_WEBSITE_STATUSES];
        return db.query<ApprovalRow>(VersionSQL.waitingList(search !== undefined, statuses.length), [
            PackageVersionStatus.WAITING,
            ...statuses,
            ...(search === undefined ? [] : [likeAnywhere(search), likeAnywhere(search)]),
            pagination.limit,
            toOffset(pagination),
        ]);
    }

    async waitingCount(db: DbExecutor, search: string | undefined): Promise<number> {
        const statuses = [PackageWebsiteStatus.NOT_LIVE, ...LIVE_WEBSITE_STATUSES];
        const rows = await db.query<CountRow>(VersionSQL.waitingCount(search !== undefined, statuses.length), [
            PackageVersionStatus.WAITING,
            ...statuses,
            ...(search === undefined ? [] : [likeAnywhere(search), likeAnywhere(search)]),
        ]);
        return Number(rows[0]?.total ?? 0);
    }

    async insertDemoPackage(db: DbExecutor, write: DemoPackageWrite): Promise<number> {
        const result = await db.execute(PackageSQL.insertDemo, [
            write.partnerId,
            write.slug,
            write.websiteStatus,
            flag(write.isPopular),
            flag(write.isBestDeal),
            write.firstLiveAt,
            write.deleteReasonId,
            write.deleteReasonName,
            write.deleteDetails,
            write.deletedAt,
            write.deletedBy,
            write.createdAt,
            write.actorId,
            write.actorId,
        ]);
        return result.insertId;
    }

    async insertDemoVersion(db: DbExecutor, packageId: number, write: DemoVersionWrite): Promise<number> {
        const result = await db.execute(VersionSQL.insertDemo, [
            packageId,
            write.versionNumber,
            ...basicValues(write.basic),
            write.packageImage,
            write.bannerImage,
            write.galleryId,
            write.galleryTitle,
            write.moreInclusions,
            write.exclusions,
            write.gettingThere,
            flag(write.saved.itinerary),
            flag(write.saved.inclusions),
            flag(write.saved.gettingThere),
            flag(write.saved.faqs),
            write.rejectReason,
            write.sentAt,
            write.decidedAt,
            write.decidedBy,
            write.replacedAt,
            write.status,
            write.createdAt,
            write.actorId,
            write.actorId,
        ]);
        return result.insertId;
    }

    async demoPackagesOf(db: DbExecutor, partnerIds: readonly number[]): Promise<PackageRow[]> {
        if (partnerIds.length === 0) return [];
        return db.query<PackageRow>(PackageSQL.demoPackagesOf(partnerIds.length), [...partnerIds]);
    }

    async deleteDemoPackages(db: DbExecutor, ids: readonly number[]): Promise<void> {
        if (ids.length === 0) return;
        for (const table of DEMO_CHILD_TABLES) await db.execute(PackageDemoSQL.deleteChildren(table, ids.length), [...ids]);
        await db.execute(PackageDemoSQL.deleteVersions(ids.length), [...ids]);
        await db.execute(PackageDemoSQL.deletePackages(ids.length), [...ids]);
    }

    private dayWriteOf(day: DayRow): DayWrite {
        return {
            dayNumber: day.day_number,
            title: day.title,
            description: day.description,
            startLocation: day.start_location,
            endLocation: day.end_location,
            hotelName: day.hotel_name,
            hasBreakfast: day.has_breakfast === 1,
            hasLunch: day.has_lunch === 1,
            hasDinner: day.has_dinner === 1,
            activity: day.activity,
            accommodation: day.accommodation,
            note: day.note,
            dayImage: day.day_image,
            galleryId: day.gallery_id,
            galleryTitle: day.gallery_title,
        };
    }
}
