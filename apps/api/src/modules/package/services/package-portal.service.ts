import { ClientApp } from '../../../core/context';
import { ConflictException, ForbiddenException } from '../../../core/exceptions';
import { freeSlug, slugOf } from '../../../core/validation';
import { AuditAction, AuditEntity } from '../../audit';
import type { IGalleryService } from '../../gallery';
import { type INotificationService, NotificationKind } from '../../notification';
import { ParkStatus } from '../../park';
import type { IPartnerService, PartnerRef } from '../../partner';
import { type IUsersService, MetaRole } from '../../users';
import type { IPackagePortalService } from '../contracts/package-portal-service.contract';
import type {
    BasicSection,
    DeletedVersionDto,
    FaqsSection,
    FormOptionsDto,
    GettingThereSection,
    ImageTarget,
    IncomingImage,
    InclusionsSection,
    ItinerarySection,
    PackageFile,
    PackageListItemDto,
    PackageViewDto,
    PartnerDashboardDto,
    PortalListFilters,
    SavedSectionDto,
} from '../dto/package.dto';
import { mainParkOf, toListItem } from '../mappers/package.mapper';
import {
    LIVE_WEBSITE_STATUSES,
    PACKAGE_LIMITS,
    PACKAGE_SLUG_FALLBACK,
    PARTNER_EDITABLE_STATUSES,
    type PackageRow,
    PackageVersionStatus,
    PackageWebsiteStatus,
    type PackageWebsiteStatusCode,
    type VersionRow,
} from '../types/package.types';
import { PACKAGE_MESSAGES } from '../validators/package.validators';
import type { EditContext, PackageEditorService } from './package-editor';
import { fieldError, filesOfVersion, notEditable, packageDeleted, packageNotFound, type PackageRecords } from './package-records';
import { partnerIsActive, portalActionsOf } from './package-rules';

const notActivePartner = (): ForbiddenException =>
    new ForbiddenException(PACKAGE_MESSAGES.NOT_ACTIVE_PARTNER, 'PACKAGE_PARTNER_NOT_ACTIVE');

const ACTIONS = {
    created: { done: AuditAction.PACKAGE_CREATED, failed: AuditAction.PACKAGE_CREATE_FAILED },
    editStarted: { done: AuditAction.PACKAGE_EDIT_STARTED, failed: AuditAction.PACKAGE_EDIT_START_FAILED },
    sent: { done: AuditAction.PACKAGE_VERSION_SENT, failed: AuditAction.PACKAGE_VERSION_SEND_FAILED },
    draftDeleted: { done: AuditAction.PACKAGE_DRAFT_DELETED, failed: AuditAction.PACKAGE_DRAFT_DELETE_FAILED },
    madeActive: { done: AuditAction.PACKAGE_MADE_ACTIVE, failed: AuditAction.PACKAGE_MAKE_ACTIVE_FAILED },
    madeInactive: { done: AuditAction.PACKAGE_MADE_INACTIVE, failed: AuditAction.PACKAGE_MAKE_INACTIVE_FAILED },
} as const;

export class PackagePortalService implements IPackagePortalService {
    constructor(
        private readonly records: PackageRecords,
        private readonly editor: PackageEditorService,
        private readonly partnerService: IPartnerService,
        private readonly galleryService: IGalleryService,
        private readonly usersService: IUsersService,
        private readonly notificationService: INotificationService,
    ) {}

    async dashboard(userId: number): Promise<PartnerDashboardDto> {
        const partner = await this.activePartner(userId);
        const rows = await this.records.repository.latestActiveOfPartner(
            this.records.db,
            partner.id,
            PACKAGE_LIMITS.DASHBOARD_PACKAGES,
        );
        const liveIds = rows.flatMap((row) => (row.live_version_id === null ? [] : [row.live_version_id]));
        const [liveVersions, mainParks] = await Promise.all([
            this.records.repository.versionsByIds(this.records.db, liveIds),
            this.records.mainParksOf(liveIds),
        ]);
        const versions = new Map(liveVersions.map((version) => [version.id, version]));
        return {
            latestActivePackages: rows.flatMap((row) => {
                const live = row.live_version_id === null ? undefined : versions.get(row.live_version_id);
                if (!live) return [];
                return [
                    {
                        id: row.id,
                        name: live.name,
                        parkNames: row.park_names,
                        dayCount: live.day_count,
                        nightCount: live.day_count - 1,
                        pricePerPerson: live.price_per_person,
                        liveVersionId: live.id,
                        liveVersionNumber: live.version_number,
                        packageImage: live.package_image,
                        mainPark: mainParkOf(mainParks, live.id),
                    },
                ];
            }),
        };
    }

    async list(userId: number, filters: PortalListFilters): Promise<PackageListItemDto[]> {
        const partner = await this.activePartner(userId);
        const rows = await this.records.repository.listOfPartner(this.records.db, partner.id, filters);
        const mainParks = await this.records.mainParksOf(rows.map((row) => row.shown_version_id));
        return rows.map((row) => toListItem(row, portalActionsOf(row), partnerIsActive(row), mainParks));
    }

    async formOptions(userId: number): Promise<FormOptionsDto> {
        const partner = await this.activePartner(userId);
        return this.formOptionsOf(partner.id);
    }

    async formOptionsOf(partnerId: number): Promise<FormOptionsDto> {
        const [parks, galleries] = await Promise.all([
            this.partnerService.parksOf(partnerId),
            this.galleryService.approvedGalleriesOf(partnerId),
        ]);
        return {
            parks: parks.filter((park) => park.status === ParkStatus.ACTIVE).map((park) => ({ id: park.id, name: park.name })),
            galleries: galleries.map((gallery) => ({
                id: gallery.id,
                title: gallery.title,
                park: gallery.park,
                photoCount: gallery.photoCount,
            })),
        };
    }

    async create(userId: number, basic: BasicSection): Promise<PackageViewDto> {
        const partner = await this.activePartner(userId);
        const { galleryId, ...rest } = basic;
        await this.checkCreateParks(partner.id, basic.masterParkIds);
        const created = await this.records.audited(ACTIONS.created, undefined, { ...basic }, async () => {
            const slug = await freeSlug(slugOf(basic.name, PACKAGE_LIMITS.SLUG_MAX - 10, PACKAGE_SLUG_FALLBACK), (candidate) =>
                this.records.repository.slugTaken(this.records.db, candidate),
            );
            const packageId = await this.records.repository.insert(this.records.db, partner.id, slug, userId);
            const versionId = await this.records.repository.insertVersion(this.records.db, packageId, 1, basic, userId);
            await this.records.repository.replaceParks(this.records.db, versionId, basic.masterParkIds, userId);
            await this.records.repository.replaceFeatures(this.records.db, versionId, basic.features, userId);
            return {
                result: { packageId, versionId },
                id: packageId,
                changes: { slug, versionNumber: 1, status: PackageVersionStatus.DRAFT, basic: { ...rest, galleryId } },
            };
        });
        if (galleryId !== null) {
            const context = await this.contextOf(partner, created.packageId, created.versionId);
            await this.editor.attachGalleryOnCreate(context, galleryId);
        }
        return this.view(partner, created.packageId, created.versionId);
    }

    async detail(userId: number, packageId: number): Promise<PackageViewDto> {
        const partner = await this.activePartner(userId);
        const pkg = await this.ownPackage(partner, packageId);
        const versionId = pkg.working_version_id ?? pkg.live_version_id;
        if (versionId === null) throw packageNotFound();
        return this.view(partner, packageId, versionId);
    }

    async version(userId: number, packageId: number, versionId: number): Promise<PackageViewDto> {
        const partner = await this.activePartner(userId);
        await this.ownPackage(partner, packageId);
        await this.records.versionRow(packageId, versionId);
        return this.view(partner, packageId, versionId);
    }

    async saveBasic(userId: number, packageId: number, versionId: number, basic: BasicSection): Promise<SavedSectionDto> {
        return this.saveWith(userId, packageId, versionId, (context) => this.editor.saveBasic(context, basic));
    }

    async saveItinerary(userId: number, packageId: number, versionId: number, section: ItinerarySection): Promise<SavedSectionDto> {
        return this.saveWith(userId, packageId, versionId, (context) => this.editor.saveItinerary(context, section));
    }

    async saveInclusions(userId: number, packageId: number, versionId: number, section: InclusionsSection): Promise<SavedSectionDto> {
        return this.saveWith(userId, packageId, versionId, (context) => this.editor.saveInclusions(context, section));
    }

    async saveGettingThere(
        userId: number,
        packageId: number,
        versionId: number,
        section: GettingThereSection,
    ): Promise<SavedSectionDto> {
        return this.saveWith(userId, packageId, versionId, (context) => this.editor.saveGettingThere(context, section));
    }

    async saveFaqs(userId: number, packageId: number, versionId: number, section: FaqsSection): Promise<SavedSectionDto> {
        return this.saveWith(userId, packageId, versionId, (context) => this.editor.saveFaqs(context, section));
    }

    async setImage(
        userId: number,
        packageId: number,
        versionId: number,
        target: ImageTarget,
        image: IncomingImage | null,
    ): Promise<SavedSectionDto> {
        return this.saveWith(userId, packageId, versionId, (context) => this.editor.setImage(context, target, image));
    }

    async startEdit(userId: number, packageId: number): Promise<PackageViewDto> {
        const partner = await this.activePartner(userId);
        const pkg = await this.ownPackage(partner, packageId);
        this.requireLiveNotDeleted(pkg);
        if (pkg.working_version_id !== null) {
            throw new ConflictException(PACKAGE_MESSAGES.WORKING_EXISTS, 'PACKAGE_WORKING_VERSION_EXISTS');
        }
        const liveId = pkg.live_version_id;
        if (liveId === null) throw new ConflictException(PACKAGE_MESSAGES.NO_LIVE, 'PACKAGE_NOT_LIVE');
        const live = await this.records.versionRow(packageId, liveId);
        const nextNumber = await this.records.repository.nextVersionNumber(this.records.db, packageId);
        const files = filesOfVersion(live, await this.records.children(live.id));
        const copied = await this.records.copyFiles(packageId, live.version_number, nextNumber, files);
        const versionId = await this.records.audited(
            ACTIONS.editStarted,
            packageId,
            { fromVersionId: live.id },
            async () => {
                const id = await this.records.repository.copyVersion(this.records.db, live.id, nextNumber, userId);
                await this.records.repository.copyChildren(this.records.db, live.id, id, userId);
                await this.records.repository.touch(this.records.db, packageId, userId);
                return {
                    result: id,
                    id: packageId,
                    changes: { fromVersionNumber: live.version_number, versionNumber: nextNumber, versionId: id },
                };
            },
            () => this.records.discardCopiedVersion(packageId, nextNumber, copied),
        );
        return this.view(partner, packageId, versionId);
    }

    async send(userId: number, packageId: number, versionId: number): Promise<PackageViewDto> {
        const partner = await this.activePartner(userId);
        const context = await this.contextOf(partner, packageId, versionId);
        const { version } = context;
        await this.records.audited(ACTIONS.sent, packageId, { versionId }, async () => {
            if (!(await this.records.repository.send(this.records.db, versionId, userId))) {
                throw new ConflictException(PACKAGE_MESSAGES.NOT_SENDABLE, 'PACKAGE_VERSION_NOT_SENDABLE');
            }
            await this.editor.checkVersionParks(partner.id, versionId);
            await this.records.repository.touch(this.records.db, packageId, userId);
            await this.notifySuperAdmins(partner, packageId, version, userId);
            return {
                result: undefined,
                id: packageId,
                changes: {
                    versionId,
                    versionNumber: version.version_number,
                    status: { from: version.status, to: PackageVersionStatus.WAITING },
                },
            };
        });
        return this.view(partner, packageId, versionId);
    }

    async deleteWorking(userId: number, packageId: number, versionId: number): Promise<DeletedVersionDto> {
        const partner = await this.activePartner(userId);
        const { pkg, version } = await this.contextOf(partner, packageId, versionId);
        const leavesList = pkg.website_status === PackageWebsiteStatus.NOT_LIVE;
        await this.records.audited(ACTIONS.draftDeleted, packageId, { versionId }, async () => {
            if (!(await this.records.repository.discard(this.records.db, versionId, userId))) {
                throw new ConflictException(PACKAGE_MESSAGES.NOT_DELETABLE, 'PACKAGE_VERSION_NOT_DELETABLE');
            }
            if (
                leavesList &&
                !(await this.records.repository.setWebsiteStatus(
                    this.records.db,
                    packageId,
                    PackageWebsiteStatus.NOT_LIVE,
                    PackageWebsiteStatus.DISCARDED,
                    userId,
                ))
            ) {
                throw notEditable();
            }
            await this.records.repository.touch(this.records.db, packageId, userId);
            return {
                result: undefined,
                id: packageId,
                changes: {
                    versionId,
                    versionNumber: version.version_number,
                    status: { from: version.status, to: PackageVersionStatus.DISCARDED },
                    websiteStatus: leavesList ? { from: pkg.website_status, to: PackageWebsiteStatus.DISCARDED } : undefined,
                },
            };
        });
        if (leavesList) return { package: null, packageLeftList: true };
        const after = await this.records.packageRow(packageId);
        return { package: await this.records.summary(after, portalActionsOf(after)), packageLeftList: false };
    }

    async setWebsiteStatus(userId: number, packageId: number, status: PackageWebsiteStatusCode): Promise<PackageListItemDto> {
        const partner = await this.activePartner(userId);
        const pkg = await this.ownPackage(partner, packageId);
        this.requireLiveNotDeleted(pkg);
        const from = pkg.website_status;
        if (from === status) throw new ConflictException(PACKAGE_MESSAGES.WEBSITE_STATUS_SAME, 'PACKAGE_WEBSITE_STATUS_SAME');
        const actions = status === PackageWebsiteStatus.ACTIVE ? ACTIONS.madeActive : ACTIONS.madeInactive;
        await this.records.audited(actions, packageId, { websiteStatus: status }, async () => {
            if (!(await this.records.repository.setWebsiteStatus(this.records.db, packageId, from, status, userId))) {
                throw new ConflictException(PACKAGE_MESSAGES.NOT_LIVE_PACKAGE, 'PACKAGE_NOT_LIVE');
            }
            return { result: undefined, id: packageId, changes: { websiteStatus: { from, to: status } } };
        });
        const rows = await this.records.repository.listOfPartner(this.records.db, partner.id, {
            search: undefined,
            websiteStatus: undefined,
        });
        const row = rows.find((candidate) => candidate.id === packageId);
        if (!row) throw packageNotFound();
        const mainParks = await this.records.mainParksOf([row.shown_version_id]);
        return toListItem(row, portalActionsOf(row), partnerIsActive(row), mainParks);
    }

    async file(userId: number, packageId: number, versionId: number, fileName: string): Promise<PackageFile> {
        const partner = await this.activePartner(userId);
        await this.ownPackage(partner, packageId);
        return this.records.readVersionFile(await this.records.versionRow(packageId, versionId), fileName);
    }

    private async saveWith(
        userId: number,
        packageId: number,
        versionId: number,
        save: (context: EditContext) => Promise<boolean | undefined | void>,
    ): Promise<SavedSectionDto> {
        const partner = await this.activePartner(userId);
        const context = await this.contextOf(partner, packageId, versionId);
        const mealsTicked = (await save(context)) === true;
        const view = await this.view(partner, packageId, versionId);
        return { ...view, mealsTicked };
    }

    private async view(partner: PartnerRef, packageId: number, versionId: number): Promise<PackageViewDto> {
        const pkg = await this.ownPackage(partner, packageId);
        const version = await this.records.versionRow(packageId, versionId);
        const canEdit =
            pkg.website_status !== PackageWebsiteStatus.DELETED_BY_ADMIN && PARTNER_EDITABLE_STATUSES.includes(version.status);
        return {
            package: await this.records.summary(pkg, portalActionsOf(pkg)),
            version: await this.records.versionDetail(version, canEdit),
        };
    }

    private async contextOf(partner: PartnerRef, packageId: number, versionId: number): Promise<EditContext> {
        const pkg = await this.ownPackage(partner, packageId);
        if (pkg.website_status === PackageWebsiteStatus.DELETED_BY_ADMIN) throw packageDeleted();
        const version = await this.records.versionRow(packageId, versionId);
        if (!PARTNER_EDITABLE_STATUSES.includes(version.status)) throw notEditable();
        return { editor: { kind: 'partner', userId: partner.userId, partnerId: partner.id }, pkg, version };
    }

    private requireLiveNotDeleted(pkg: PackageRow): void {
        if (pkg.website_status === PackageWebsiteStatus.DELETED_BY_ADMIN) throw packageDeleted();
        if (pkg.live_version_id === null || !LIVE_WEBSITE_STATUSES.includes(pkg.website_status)) {
            throw new ConflictException(PACKAGE_MESSAGES.NO_LIVE, 'PACKAGE_NOT_LIVE');
        }
    }

    private async activePartner(userId: number): Promise<PartnerRef> {
        const partner = await this.partnerService.activePartnerOf(userId);
        if (!partner) throw notActivePartner();
        return partner;
    }

    private async ownPackage(partner: PartnerRef, packageId: number): Promise<PackageRow> {
        const pkg = await this.records.packageRow(packageId);
        if (pkg.partner_id !== partner.id) throw packageNotFound();
        return pkg;
    }

    private async checkCreateParks(partnerId: number, chosen: readonly number[]): Promise<void> {
        const options = await this.formOptionsOf(partnerId);
        const allowed = new Set(options.parks.map((park) => park.id));
        if (chosen.some((parkId) => !allowed.has(parkId))) {
            throw fieldError('masterParkIds', PACKAGE_MESSAGES.PARK_NOT_AVAILABLE, 'PACKAGE_PARK_NOT_AVAILABLE');
        }
    }

    private async notifySuperAdmins(
        partner: PartnerRef,
        packageId: number,
        version: VersionRow,
        actorId: number,
    ): Promise<void> {
        const superAdminIds = await this.usersService.activeUserIdsWithRole(MetaRole.SUPER_ADMIN);
        await this.notificationService.notify(
            superAdminIds.map((superAdminId) => ({
                userId: superAdminId,
                notificationKind: NotificationKind.PACKAGE_VERSION_SENT,
                entityType: AuditEntity.PACKAGE,
                entityId: packageId,
                clientApp: ClientApp.MANAGE,
                ownerType: null,
                ownerId: null,
                title: `${version.name} (v${version.version_number})`,
                excerpt: null,
                actorId,
                actorName: partner.businessName,
            })),
        );
    }
}
