import { ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { DemoPackage, DemoPackageGallery, DemoPackageOutcome, DemoPackageVersion } from '../dto/package-demo.dto';
import type { DeleteReasonRepository } from '../repositories/delete-reason.repository';
import type { NewPhoto, PackageRepository } from '../repositories/package.repository';
import { Meal, PackageVersionStatus } from '../types/package.types';
import { filePath } from './package-records';

type PendingFile = { readonly path: string; readonly picture: string };

const demoName = (picture: string): string => `demo-${picture}`;

const galleryFileName = (galleryId: number, picture: string): string => `g${galleryId}-${demoName(picture)}`;

const photosOf = (gallery: DemoPackageGallery): NewPhoto[] =>
    gallery.photos.map((photo, index) => ({
        fileName: galleryFileName(gallery.galleryId, photo.picture),
        title: photo.title,
        caption: photo.caption,
        sortOrder: index,
    }));

const WAS_LIVE: readonly number[] = [PackageVersionStatus.LIVE, PackageVersionStatus.REPLACED];

export class PackageDemoService {
    constructor(
        private readonly db: Database,
        private readonly repository: PackageRepository,
        private readonly reasons: DeleteReasonRepository,
        private readonly auditService: IAuditService,
        private readonly fileStorage: IFileStorage,
        private readonly isProduction: boolean,
    ) {}

    async existing(slugs: readonly string[]): Promise<string[]> {
        this.refuseInProduction();
        const found: string[] = [];
        for (const slug of slugs) if (await this.repository.findBySlug(this.db, slug)) found.push(slug);
        return found;
    }

    async add(
        packages: readonly DemoPackage[],
        pictures: ReadonlyMap<string, Buffer>,
        adminId: number,
    ): Promise<DemoPackageOutcome[]> {
        this.refuseInProduction();
        const event = { action: AuditAction.PACKAGE_DEMO_ADDED, entityType: AuditEntity.PACKAGE } as const;
        const pending: PendingFile[] = [];
        try {
            const outcomes = await this.db.transaction(async () => {
                const done: DemoPackageOutcome[] = [];
                for (const plan of packages) done.push(await this.addPackage(plan, adminId, pending));
                const created = done.filter((outcome) => outcome.created);
                if (created.length > 0) {
                    await this.auditService.record({
                        ...event,
                        details: { created: created.map((outcome) => ({ id: outcome.packageId, slug: outcome.slug })) },
                    });
                }
                return done;
            });
            for (const file of pending) {
                const content = pictures.get(file.picture);
                if (content) await this.fileStorage.save(file.path, content);
            }
            return outcomes;
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.PACKAGE_DEMO_ADD_FAILED }, error);
            throw error;
        }
    }

    async remove(partnerIds: readonly number[], write: boolean): Promise<number> {
        this.refuseInProduction();
        const rows = await this.repository.demoPackagesOf(this.db, partnerIds);
        if (!write || rows.length === 0) return rows.length;
        const ids = rows.map((row) => row.id);
        const event = { action: AuditAction.PACKAGE_DEMO_REMOVED, entityType: AuditEntity.PACKAGE } as const;
        try {
            await this.db.transaction(async () => {
                await this.repository.deleteDemoPackages(this.db, ids);
                await this.auditService.record({ ...event, details: { removed: rows.map((row) => ({ id: row.id, slug: row.slug })) } });
            });
            return rows.length;
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.PACKAGE_DEMO_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private async addPackage(plan: DemoPackage, adminId: number, pending: PendingFile[]): Promise<DemoPackageOutcome> {
        const found = await this.repository.findBySlug(this.db, plan.slug);
        if (found) return { slug: plan.slug, packageId: found.id, created: false };
        const reason = plan.deleteReasonName === null ? undefined : await this.reasons.findByName(this.db, plan.deleteReasonName);
        const decided = plan.versions.filter((version) => WAS_LIVE.includes(version.status)).map((version) => version.decidedAt);
        const firstLive = decided.reduce<Date | null>((first, at) => (at && (!first || at < first) ? at : first), null);
        const packageId = await this.repository.insertDemoPackage(this.db, {
            partnerId: plan.partnerId,
            slug: plan.slug,
            websiteStatus: plan.websiteStatus,
            isPopular: plan.isPopular,
            isBestDeal: plan.isBestDeal,
            firstLiveAt: firstLive,
            deleteReasonId: reason?.id ?? null,
            deleteReasonName: plan.deleteReasonName,
            deleteDetails: plan.deleteDetails,
            deletedAt: plan.deletedAt,
            deletedBy: plan.deletedAt === null ? null : adminId,
            createdAt: plan.versions[0]?.createdAt ?? new Date(),
            actorId: plan.userId,
        });
        for (const [index, version] of plan.versions.entries()) {
            const next = plan.versions[index + 1];
            await this.addVersion(packageId, index + 1, version, next?.decidedAt ?? null, plan.userId, adminId, pending);
        }
        return { slug: plan.slug, packageId, created: true };
    }

    private async addVersion(
        packageId: number,
        versionNumber: number,
        version: DemoPackageVersion,
        replacedAt: Date | null,
        userId: number,
        adminId: number,
        pending: PendingFile[],
    ): Promise<void> {
        const folder = (fileName: string): string => filePath(packageId, versionNumber, fileName);
        const keep = (picture: string | null, fileName: string | null): string | null => {
            if (picture === null || fileName === null) return null;
            if (!pending.some((file) => file.path === folder(fileName))) pending.push({ path: folder(fileName), picture });
            return fileName;
        };
        const versionId = await this.repository.insertDemoVersion(this.db, packageId, {
            versionNumber,
            basic: {
                name: version.name,
                dayCount: version.dayCount,
                safariCount: version.safariCount,
                safariType: version.safariType,
                vehicle: version.vehicle,
                theme: version.theme,
                stay: version.stay,
                startPlace: version.startPlace,
                endPlace: version.endPlace,
                pricePerPerson: version.pricePerPerson,
                totalPrice: version.totalPrice,
                priceBeforeDiscount: version.priceBeforeDiscount,
                activityMessage: version.activityMessage,
                priceMessage: version.priceMessage,
                tagText: version.tagText,
                tagBackgroundColor: version.tagBackgroundColor,
                tagTextColor: version.tagTextColor,
                overview: version.overview,
            },
            packageImage: keep(version.packagePicture, version.packagePicture && demoName(version.packagePicture)),
            bannerImage: keep(version.bannerPicture, version.bannerPicture && demoName(version.bannerPicture)),
            galleryId: version.gallery?.galleryId ?? null,
            galleryTitle: version.gallery?.title ?? null,
            moreInclusions: version.moreInclusions,
            exclusions: version.exclusions,
            gettingThere: version.gettingThere,
            saved: version.saved,
            rejectReason: version.rejectReason,
            sentAt: version.sentAt,
            decidedAt: version.decidedAt,
            decidedBy: version.decidedAt === null ? null : adminId,
            replacedAt: version.status === PackageVersionStatus.REPLACED ? replacedAt : null,
            status: version.status,
            createdAt: version.createdAt,
            actorId: userId,
        });
        await this.repository.replaceParks(this.db, versionId, version.masterParkIds, userId);
        await this.repository.replaceFeatures(this.db, versionId, version.features, userId);
        if (version.saved.inclusions) await this.repository.replaceInclusions(this.db, versionId, version.inclusions, userId);
        if (version.saved.faqs) await this.repository.replaceFaqs(this.db, versionId, version.faqs, userId);
        if (version.gallery) {
            for (const photo of version.gallery.photos) keep(photo.picture, galleryFileName(version.gallery.galleryId, photo.picture));
            await this.repository.replacePhotos(this.db, versionId, null, photosOf(version.gallery), userId);
        }
        if (!version.saved.itinerary) return;
        for (const [index, day] of version.days.entries()) {
            const dayId = await this.repository.insertDay(
                this.db,
                versionId,
                {
                    dayNumber: index + 1,
                    title: day.title,
                    description: day.description,
                    startLocation: day.startLocation,
                    endLocation: day.endLocation,
                    hotelName: day.hotelName,
                    hasBreakfast: day.meals.includes(Meal.BREAKFAST),
                    hasLunch: day.meals.includes(Meal.LUNCH),
                    hasDinner: day.meals.includes(Meal.DINNER),
                    activity: day.activity,
                    accommodation: day.accommodation,
                    note: day.note,
                    dayImage: keep(day.picture, day.picture && demoName(day.picture)),
                    galleryId: day.gallery?.galleryId ?? null,
                    galleryTitle: day.gallery?.title ?? null,
                },
                userId,
            );
            if (day.gallery) {
                for (const photo of day.gallery.photos) keep(photo.picture, galleryFileName(day.gallery.galleryId, photo.picture));
                await this.repository.replacePhotos(this.db, versionId, dayId, photosOf(day.gallery), userId);
            }
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) throw new ForbiddenException('Demo data is never written in production.', 'DEMO_IN_PRODUCTION');
    }
}
