import { ConflictException, NotFoundException } from '../../../core/exceptions';
import { AuditAction } from '../../audit';
import type { GalleryCopy, IGalleryService } from '../../gallery';
import { ParkStatus } from '../../park';
import type { IPartnerService } from '../../partner';
import type {
    BasicSection,
    FaqsSection,
    GettingThereSection,
    ImageTarget,
    IncomingImage,
    InclusionsSection,
    ItinerarySection,
    PackageEditor,
} from '../dto/package.dto';
import type { DayWrite, NewPhoto } from '../repositories/package.repository';
import {
    Inclusion,
    PackageImageKind,
    PackageSection,
    type PackageSectionKey,
    type PackageRow,
    type VersionRow,
} from '../types/package.types';
import { PACKAGE_MESSAGES } from '../validators/package.validators';
import { type AuditPair, fieldError, notEditable, type PackageRecords } from './package-records';

export type EditContext = {
    readonly editor: PackageEditor;
    readonly pkg: PackageRow;
    readonly version: VersionRow;
};

type CopiedGallery = { readonly galleryId: number; readonly title: string; readonly photos: readonly NewPhoto[] };

type PreparedGalleries = { readonly byId: ReadonlyMap<number, CopiedGallery>; readonly copied: readonly string[] };

const SECTION_ACTIONS: AuditPair = {
    done: AuditAction.PACKAGE_SECTION_SAVED,
    failed: AuditAction.PACKAGE_SECTION_SAVE_FAILED,
};

const IMAGE_ACTIONS: AuditPair = { done: AuditAction.PACKAGE_IMAGE_CHANGED, failed: AuditAction.PACKAGE_IMAGE_CHANGE_FAILED };

const ADMIN_ACTIONS: AuditPair = {
    done: AuditAction.PACKAGE_EDITED_BY_ADMIN,
    failed: AuditAction.PACKAGE_EDIT_BY_ADMIN_FAILED,
};

const dayRange = (from: number, to: number): string => (from === to ? `${from}` : `${from}–${to}`);

export class PackageEditorService {
    constructor(
        private readonly records: PackageRecords,
        private readonly partnerService: IPartnerService,
        private readonly galleryService: IGalleryService,
    ) {}

    async saveBasic(context: EditContext, basic: BasicSection): Promise<void> {
        const { pkg, version } = context;
        const before = await this.records.children(version.id);
        await this.checkParks(pkg.partner_id, basic.masterParkIds, before.parks.map((park) => park.master_park_id));
        const highestDay = before.days.reduce((highest, day) => Math.max(highest, day.day_number), 0);
        if (basic.dayCount < highestDay && !basic.confirmDayRemoval) {
            throw new ConflictException(
                `Confirm removing ${basic.dayCount + 1 === highestDay ? 'day' : 'days'} ${dayRange(basic.dayCount + 1, highestDay)} first.`,
                'PACKAGE_DAYS_REMOVAL_UNCONFIRMED',
            );
        }
        const prepared = await this.prepareGalleries(context, [basic.galleryId], 'galleryId');
        const input = { section: PackageSection.BASIC, versionId: version.id, ...basic };
        await this.records.audited(
            this.actionsOf(context, SECTION_ACTIONS),
            pkg.id,
            input,
            async () => {
                await this.touch(context);
                await this.records.repository.updateBasic(this.records.db, version.id, basic, context.editor.userId);
                await this.records.repository.replaceParks(this.records.db, version.id, basic.masterParkIds, context.editor.userId);
                await this.records.repository.replaceFeatures(this.records.db, version.id, basic.features, context.editor.userId);
                await this.writeGallery(context, null, basic.galleryId, prepared);
                const removedDays =
                    basic.dayCount < highestDay
                        ? await this.records.repository.removeDaysAfter(
                              this.records.db,
                              version.id,
                              basic.dayCount,
                              context.editor.userId,
                          )
                        : 0;
                return { result: undefined, id: pkg.id, changes: { ...this.changesBase(context, PackageSection.BASIC), basic, removedDays } };
            },
            () => this.records.discardUnusedFiles(version, prepared.copied),
        );
    }

    async attachGalleryOnCreate(context: EditContext, galleryId: number): Promise<void> {
        const prepared = await this.prepareGalleries(context, [galleryId], 'galleryId');
        await this.records.audited(
            SECTION_ACTIONS,
            context.pkg.id,
            { section: PackageSection.BASIC, versionId: context.version.id, galleryId },
            async () => {
                await this.touch(context);
                await this.writeGallery(context, null, galleryId, prepared);
                return {
                    result: undefined,
                    id: context.pkg.id,
                    changes: { ...this.changesBase(context, PackageSection.BASIC), galleryId },
                };
            },
            () => this.records.discardUnusedFiles(context.version, prepared.copied),
        );
    }

    async saveItinerary(context: EditContext, itinerary: ItinerarySection): Promise<void> {
        const { pkg, version } = context;
        if (itinerary.days.length !== version.day_count) {
            throw fieldError('days', PACKAGE_MESSAGES.DAYS_MISMATCH, 'PACKAGE_DAYS_MISMATCH');
        }
        const prepared = await this.prepareGalleries(
            context,
            itinerary.days.map((day) => day.galleryId),
            'days',
        );
        await this.records.audited(
            this.actionsOf(context, SECTION_ACTIONS),
            pkg.id,
            { section: PackageSection.ITINERARY, versionId: version.id, ...itinerary },
            async () => {
                await this.touch(context);
                const existing = new Map(
                    (await this.records.repository.daysOf(this.records.db, version.id)).map((day) => [day.day_number, day]),
                );
                for (const day of itinerary.days) {
                    const current = existing.get(day.dayNumber);
                    const write: DayWrite = {
                        ...day,
                        dayImage: current?.day_image ?? null,
                        galleryTitle: day.galleryId === null ? null : (prepared.byId.get(day.galleryId)?.title ?? null),
                    };
                    const dayId = await this.writeDay(context, current?.id ?? null, write);
                    await this.writeGallery(context, dayId, day.galleryId, prepared);
                }
                await this.records.repository.removeDaysAfter(this.records.db, version.id, version.day_count, context.editor.userId);
                await this.records.repository.markItinerarySaved(this.records.db, version.id, context.editor.userId);
                return {
                    result: undefined,
                    id: pkg.id,
                    changes: { ...this.changesBase(context, PackageSection.ITINERARY), days: itinerary.days },
                };
            },
            () => this.records.discardUnusedFiles(version, prepared.copied),
        );
    }

    async saveInclusions(context: EditContext, section: InclusionsSection): Promise<boolean> {
        const { pkg, version } = context;
        return this.records.audited(
            this.actionsOf(context, SECTION_ACTIONS),
            pkg.id,
            { section: PackageSection.INCLUSIONS, versionId: version.id, ...section },
            async () => {
                await this.touch(context);
                const before = await this.records.repository.inclusionsOf(this.records.db, [version.id]);
                const mealsBefore = before.find((choice) => choice.code === Inclusion.MEALS)?.is_included === 1;
                const mealsNow = section.inclusions.some((choice) => choice.inclusion === Inclusion.MEALS && choice.isIncluded);
                const actor = context.editor.userId;
                await this.records.repository.replaceInclusions(this.records.db, version.id, section.inclusions, actor);
                await this.records.repository.updateInclusionTexts(
                    this.records.db,
                    version.id,
                    section.moreInclusions,
                    section.exclusions,
                    actor,
                );
                const mealsTicked = mealsNow && !mealsBefore;
                if (mealsTicked) await this.records.repository.tickAllMeals(this.records.db, version.id, actor);
                return {
                    result: mealsTicked,
                    id: pkg.id,
                    changes: { ...this.changesBase(context, PackageSection.INCLUSIONS), ...section, mealsTicked },
                };
            },
        );
    }

    async saveGettingThere(context: EditContext, section: GettingThereSection): Promise<void> {
        await this.simpleSave(context, PackageSection.GETTING_THERE, { ...section }, () =>
            this.records.repository.updateGettingThere(
                this.records.db,
                context.version.id,
                section.gettingThere,
                context.editor.userId,
            ),
        );
    }

    async saveFaqs(context: EditContext, section: FaqsSection): Promise<void> {
        await this.simpleSave(context, PackageSection.FAQS, { ...section }, () =>
            this.records.repository.replaceFaqs(this.records.db, context.version.id, section.faqs, context.editor.userId),
        );
    }

    async setImage(context: EditContext, target: ImageTarget, image: IncomingImage | null): Promise<void> {
        const { pkg, version } = context;
        const dayId = await this.dayIdOf(context, target);
        const fileName = image ? await this.records.storeImage(pkg.id, version.version_number, image, 'image') : null;
        await this.records.audited(
            this.actionsOf(context, IMAGE_ACTIONS),
            pkg.id,
            { versionId: version.id, target, file: image?.originalName ?? null },
            async () => {
                await this.touch(context);
                const actor = context.editor.userId;
                if ('kind' in target) {
                    await this.records.repository.setImage(this.records.db, version.id, target.kind, fileName, actor);
                } else if (dayId === null || !(await this.records.repository.setDayImage(this.records.db, version.id, dayId, fileName, actor))) {
                    throw this.dayNotFound();
                }
                return { result: undefined, id: pkg.id, changes: { ...this.changesBase(context, null), target, fileName } };
            },
            () => this.records.discardUnusedFiles(version, fileName ? [fileName] : []),
        );
    }

    private async simpleSave(
        context: EditContext,
        section: PackageSectionKey,
        input: Readonly<Record<string, unknown>>,
        write: () => Promise<void>,
    ): Promise<void> {
        await this.records.audited(
            this.actionsOf(context, SECTION_ACTIONS),
            context.pkg.id,
            { section, versionId: context.version.id, ...input },
            async () => {
                await this.touch(context);
                await write();
                return { result: undefined, id: context.pkg.id, changes: { ...this.changesBase(context, section), ...input } };
            },
        );
    }

    private async dayIdOf(context: EditContext, target: ImageTarget): Promise<number | null> {
        if ('kind' in target) {
            if (target.kind !== PackageImageKind.PACKAGE && target.kind !== PackageImageKind.BANNER) throw this.dayNotFound();
            return null;
        }
        const days = await this.records.repository.daysOf(this.records.db, context.version.id);
        const day = days.find((candidate) => candidate.day_number === target.dayNumber);
        if (!day || target.dayNumber > context.version.day_count) throw this.dayNotFound();
        return day.id;
    }

    private async writeDay(context: EditContext, dayId: number | null, write: DayWrite): Promise<number> {
        const { db, repository } = this.records;
        if (dayId === null) return repository.insertDay(db, context.version.id, write, context.editor.userId);
        await repository.updateDay(db, context.version.id, dayId, write, context.editor.userId);
        return dayId;
    }

    private dayNotFound(): NotFoundException {
        return new NotFoundException(PACKAGE_MESSAGES.DAY_NOT_FOUND, 'PACKAGE_DAY_NOT_FOUND');
    }

    private async touch(context: EditContext): Promise<void> {
        const { editor, version } = context;
        const touched =
            editor.kind === 'partner'
                ? await this.records.repository.touchByPartner(this.records.db, version.id, editor.userId)
                : await this.records.repository.touchByAdmin(this.records.db, version.id, editor.userId);
        if (!touched) throw notEditable();
        await this.records.repository.touch(this.records.db, context.pkg.id, editor.userId);
    }

    private actionsOf(context: EditContext, partnerActions: AuditPair): AuditPair {
        return context.editor.kind === 'admin' ? ADMIN_ACTIONS : partnerActions;
    }

    private changesBase(context: EditContext, section: PackageSectionKey | null) {
        return {
            versionId: context.version.id,
            versionNumber: context.version.version_number,
            versionStatus: context.version.status,
            section,
            by: context.editor.kind,
        };
    }

    private async checkParks(partnerId: number, chosen: readonly number[], current: readonly number[]): Promise<void> {
        const parks = await this.partnerService.parksOf(partnerId);
        const allowed = new Set(
            parks
                .filter((park) => park.status === ParkStatus.ACTIVE || current.includes(park.id))
                .map((park) => park.id),
        );
        if (chosen.some((parkId) => !allowed.has(parkId))) {
            throw fieldError('masterParkIds', PACKAGE_MESSAGES.PARK_NOT_AVAILABLE, 'PACKAGE_PARK_NOT_AVAILABLE');
        }
    }

    private async prepareGalleries(
        context: EditContext,
        galleryIds: readonly (number | null)[],
        field: string,
    ): Promise<PreparedGalleries> {
        const ids = [...new Set(galleryIds.filter((id): id is number => id !== null))];
        const { pkg, version } = context;
        const existing = new Set((await this.records.repository.photosOf(this.records.db, version.id)).map((photo) => photo.file_name));
        const byId = new Map<number, CopiedGallery>();
        const copied: string[] = [];
        try {
            for (const galleryId of ids) {
                const copy = await this.approvedCopy(pkg.partner_id, galleryId, field);
                const photos: NewPhoto[] = [];
                for (const [index, photo] of copy.photos.entries()) {
                    const fileName = `g${galleryId}-${photo.fileName}`;
                    if (!existing.has(fileName) && !copied.includes(fileName)) {
                        const content = await this.galleryService.photoContent(galleryId, photo.fileName);
                        await this.records.saveFile(pkg.id, version.version_number, fileName, content);
                        copied.push(fileName);
                    }
                    photos.push({ fileName, title: photo.title, caption: photo.caption, sortOrder: index });
                }
                byId.set(galleryId, { galleryId, title: copy.title, photos });
            }
        } catch (error) {
            await this.records.discardUnusedFiles(version, copied);
            throw error;
        }
        return { byId, copied };
    }

    private async approvedCopy(partnerId: number, galleryId: number, field: string): Promise<GalleryCopy> {
        try {
            return await this.galleryService.approvedCopyOf(partnerId, galleryId);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw fieldError(field, PACKAGE_MESSAGES.GALLERY_NOT_AVAILABLE, 'PACKAGE_GALLERY_NOT_AVAILABLE');
            }
            throw error;
        }
    }

    private async writeGallery(
        context: EditContext,
        dayId: number | null,
        galleryId: number | null,
        prepared: PreparedGalleries,
    ): Promise<void> {
        const gallery = galleryId === null ? undefined : prepared.byId.get(galleryId);
        const actor = context.editor.userId;
        await this.records.repository.replacePhotos(this.records.db, context.version.id, dayId, gallery?.photos ?? [], actor);
        if (dayId === null) {
            await this.records.repository.setGallery(
                this.records.db,
                context.version.id,
                gallery ? { id: gallery.galleryId, title: gallery.title } : null,
                actor,
            );
        }
    }
}

