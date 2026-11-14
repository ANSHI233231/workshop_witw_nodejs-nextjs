import { ConflictException } from '../../../core/exceptions';
import type { PaginationQuery } from '../../../core/validation';
import { AuditAction } from '../../audit';
import type { IDeleteReasonService } from '../contracts/delete-reason-service.contract';
import type { IPackageConsoleService } from '../contracts/package-console-service.contract';
import type { IPackagePortalService } from '../contracts/package-portal-service.contract';
import type {
    AdminDeleteInput,
    ApprovalItemDto,
    BasicSection,
    ConsoleListFilters,
    FaqsSection,
    FormOptionsDto,
    GettingThereSection,
    ImageTarget,
    IncomingImage,
    InclusionsSection,
    ItinerarySection,
    PackageFile,
    PackageListItemDto,
    PackageSummaryDto,
    PackageViewDto,
    Page,
    SavedSectionDto,
} from '../dto/package.dto';
import { toApprovalItem, toListItem } from '../mappers/package.mapper';
import {
    ADMIN_EDITABLE_STATUSES,
    DeleteReasonStatus,
    LIVE_WEBSITE_STATUSES,
    type PackageRow,
    PackageVersionStatus,
    PackageWebsiteStatus,
} from '../types/package.types';
import { PACKAGE_MESSAGES } from '../validators/package.validators';
import type { EditContext, PackageEditorService } from './package-editor';
import { fieldError, notEditable, packageDeleted, type PackageRecords } from './package-records';
import { consoleActionsOf, partnerIsActive } from './package-rules';

const ACTIONS = {
    approved: { done: AuditAction.PACKAGE_VERSION_APPROVED, failed: AuditAction.PACKAGE_VERSION_APPROVE_FAILED },
    rejected: { done: AuditAction.PACKAGE_VERSION_REJECTED, failed: AuditAction.PACKAGE_VERSION_REJECT_FAILED },
    deleted: { done: AuditAction.PACKAGE_DELETED_BY_ADMIN, failed: AuditAction.PACKAGE_DELETE_BY_ADMIN_FAILED },
    popularOn: { done: AuditAction.PACKAGE_POPULAR_ON, failed: AuditAction.PACKAGE_POPULAR_CHANGE_FAILED },
    popularOff: { done: AuditAction.PACKAGE_POPULAR_OFF, failed: AuditAction.PACKAGE_POPULAR_CHANGE_FAILED },
    bestDealOn: { done: AuditAction.PACKAGE_BEST_DEAL_ON, failed: AuditAction.PACKAGE_BEST_DEAL_CHANGE_FAILED },
    bestDealOff: { done: AuditAction.PACKAGE_BEST_DEAL_OFF, failed: AuditAction.PACKAGE_BEST_DEAL_CHANGE_FAILED },
} as const;

const notWaiting = (): ConflictException => new ConflictException(PACKAGE_MESSAGES.NOT_WAITING, 'PACKAGE_VERSION_NOT_WAITING');

const notLivePackage = (): ConflictException => new ConflictException(PACKAGE_MESSAGES.NOT_LIVE_PACKAGE, 'PACKAGE_NOT_LIVE');

export class PackageConsoleService implements IPackageConsoleService {
    constructor(
        private readonly records: PackageRecords,
        private readonly editor: PackageEditorService,
        private readonly portal: IPackagePortalService,
        private readonly deleteReasons: IDeleteReasonService,
    ) {}

    async approvals(search: string | undefined, pagination: PaginationQuery): Promise<Page<ApprovalItemDto>> {
        const [rows, total] = await Promise.all([
            this.records.repository.waitingList(this.records.db, search, pagination),
            this.records.repository.waitingCount(this.records.db, search),
        ]);
        const mainParks = await this.records.mainParksOf(rows.map((row) => row.version_id));
        return { items: rows.map((row) => toApprovalItem(row, mainParks)), total };
    }

    async list(filters: ConsoleListFilters, pagination: PaginationQuery): Promise<Page<PackageListItemDto>> {
        const [rows, total] = await Promise.all([
            this.records.repository.listForConsole(this.records.db, filters, pagination),
            this.records.repository.countForConsole(this.records.db, filters),
        ]);
        const mainParks = await this.records.mainParksOf(rows.map((row) => row.shown_version_id));
        return {
            items: rows.map((row) => toListItem(row, consoleActionsOf(row), partnerIsActive(row), mainParks)),
            total,
        };
    }

    async detail(packageId: number): Promise<PackageSummaryDto> {
        const pkg = await this.records.packageRow(packageId);
        return this.records.summary(pkg, consoleActionsOf(pkg));
    }

    async version(packageId: number, versionId: number): Promise<PackageViewDto> {
        await this.records.packageRow(packageId);
        await this.records.versionRow(packageId, versionId);
        return this.view(packageId, versionId);
    }

    async formOptions(packageId: number): Promise<FormOptionsDto> {
        const pkg = await this.records.packageRow(packageId);
        return this.portal.formOptionsOf(pkg.partner_id);
    }

    async saveBasic(actorId: number, packageId: number, versionId: number, basic: BasicSection): Promise<SavedSectionDto> {
        return this.saveWith(actorId, packageId, versionId, (context) => this.editor.saveBasic(context, basic));
    }

    async saveItinerary(actorId: number, packageId: number, versionId: number, section: ItinerarySection): Promise<SavedSectionDto> {
        return this.saveWith(actorId, packageId, versionId, (context) => this.editor.saveItinerary(context, section));
    }

    async saveInclusions(actorId: number, packageId: number, versionId: number, section: InclusionsSection): Promise<SavedSectionDto> {
        return this.saveWith(actorId, packageId, versionId, (context) => this.editor.saveInclusions(context, section));
    }

    async saveGettingThere(
        actorId: number,
        packageId: number,
        versionId: number,
        section: GettingThereSection,
    ): Promise<SavedSectionDto> {
        return this.saveWith(actorId, packageId, versionId, (context) => this.editor.saveGettingThere(context, section));
    }

    async saveFaqs(actorId: number, packageId: number, versionId: number, section: FaqsSection): Promise<SavedSectionDto> {
        return this.saveWith(actorId, packageId, versionId, (context) => this.editor.saveFaqs(context, section));
    }

    async setImage(
        actorId: number,
        packageId: number,
        versionId: number,
        target: ImageTarget,
        image: IncomingImage | null,
    ): Promise<SavedSectionDto> {
        return this.saveWith(actorId, packageId, versionId, (context) => this.editor.setImage(context, target, image));
    }

    async approve(actorId: number, packageId: number, versionId: number): Promise<PackageViewDto> {
        const pkg = await this.notDeleted(packageId);
        const version = await this.records.versionRow(packageId, versionId);
        if (version.status !== PackageVersionStatus.WAITING) throw notWaiting();
        await this.records.audited(ACTIONS.approved, packageId, { versionId }, async () => {
            const replaced = await this.records.repository.replaceLive(this.records.db, packageId, actorId);
            if (!(await this.records.repository.approve(this.records.db, versionId, actorId))) throw notWaiting();
            if (!(await this.records.repository.goLive(this.records.db, packageId, actorId))) throw packageDeleted();
            return {
                result: undefined,
                id: packageId,
                changes: {
                    versionId,
                    versionNumber: version.version_number,
                    status: { from: PackageVersionStatus.WAITING, to: PackageVersionStatus.LIVE },
                    replacedVersionId: pkg.live_version_id,
                    replaced,
                    websiteStatus: { from: pkg.website_status, to: PackageWebsiteStatus.ACTIVE },
                    isPopular: { from: pkg.is_popular === 1, to: false },
                    firstLive: pkg.first_live_at === null,
                },
            };
        });
        return this.view(packageId, versionId);
    }

    async reject(actorId: number, packageId: number, versionId: number, reason: string): Promise<PackageViewDto> {
        await this.notDeleted(packageId);
        const version = await this.records.versionRow(packageId, versionId);
        if (version.status !== PackageVersionStatus.WAITING) throw notWaiting();
        await this.records.audited(ACTIONS.rejected, packageId, { versionId, reason }, async () => {
            if (!(await this.records.repository.reject(this.records.db, versionId, reason, actorId))) throw notWaiting();
            return {
                result: undefined,
                id: packageId,
                changes: {
                    versionId,
                    versionNumber: version.version_number,
                    status: { from: PackageVersionStatus.WAITING, to: PackageVersionStatus.REJECTED },
                    reason,
                },
            };
        });
        return this.view(packageId, versionId);
    }

    async remove(actorId: number, packageId: number, input: AdminDeleteInput): Promise<PackageSummaryDto> {
        const pkg = await this.liveNotDeleted(packageId);
        const reason = await this.deleteReasons.findActive(input.masterPackageDeleteReasonId);
        if (!reason || reason.status !== DeleteReasonStatus.ACTIVE) {
            throw fieldError('masterPackageDeleteReasonId', PACKAGE_MESSAGES.REASON_NOT_AVAILABLE, 'PACKAGE_DELETE_REASON_NOT_AVAILABLE');
        }
        await this.records.audited(ACTIONS.deleted, packageId, { ...input }, async () => {
            const done = await this.records.repository.deleteByAdmin(
                this.records.db,
                packageId,
                { id: reason.id, name: reason.name },
                input.details,
                actorId,
            );
            if (!done) throw notLivePackage();
            return {
                result: undefined,
                id: packageId,
                changes: {
                    websiteStatus: { from: pkg.website_status, to: PackageWebsiteStatus.DELETED_BY_ADMIN },
                    reasonId: reason.id,
                    reasonName: reason.name,
                    details: input.details,
                    isPopular: { from: pkg.is_popular === 1, to: false },
                },
            };
        });
        return this.detail(packageId);
    }

    async setPopular(actorId: number, packageId: number, on: boolean): Promise<PackageSummaryDto> {
        const pkg = await this.liveNotDeleted(packageId);
        await this.records.audited(on ? ACTIONS.popularOn : ACTIONS.popularOff, packageId, { on }, async () => {
            if (!(await this.records.repository.setPopular(this.records.db, packageId, on, actorId))) throw notLivePackage();
            return { result: undefined, id: packageId, changes: { isPopular: { from: pkg.is_popular === 1, to: on } } };
        });
        return this.detail(packageId);
    }

    async setBestDeal(actorId: number, packageId: number, on: boolean): Promise<PackageSummaryDto> {
        const pkg = await this.liveNotDeleted(packageId);
        await this.records.audited(on ? ACTIONS.bestDealOn : ACTIONS.bestDealOff, packageId, { on }, async () => {
            if (!(await this.records.repository.setBestDeal(this.records.db, packageId, on, actorId))) throw notLivePackage();
            return { result: undefined, id: packageId, changes: { isBestDeal: { from: pkg.is_best_deal === 1, to: on } } };
        });
        return this.detail(packageId);
    }

    async file(packageId: number, versionId: number, fileName: string): Promise<PackageFile> {
        await this.records.packageRow(packageId);
        return this.records.readVersionFile(await this.records.versionRow(packageId, versionId), fileName);
    }

    private async saveWith(
        actorId: number,
        packageId: number,
        versionId: number,
        save: (context: EditContext) => Promise<boolean | undefined | void>,
    ): Promise<SavedSectionDto> {
        const pkg = await this.notDeleted(packageId);
        const version = await this.records.versionRow(packageId, versionId);
        if (!ADMIN_EDITABLE_STATUSES.includes(version.status)) throw notEditable();
        const mealsTicked = (await save({ editor: { kind: 'admin', userId: actorId }, pkg, version })) === true;
        return { ...(await this.view(packageId, versionId)), mealsTicked };
    }

    private async view(packageId: number, versionId: number): Promise<PackageViewDto> {
        const pkg = await this.records.packageRow(packageId);
        const version = await this.records.versionRow(packageId, versionId);
        const canEdit =
            pkg.website_status !== PackageWebsiteStatus.DELETED_BY_ADMIN && ADMIN_EDITABLE_STATUSES.includes(version.status);
        return {
            package: await this.records.summary(pkg, consoleActionsOf(pkg)),
            version: await this.records.versionDetail(version, canEdit),
        };
    }

    private async notDeleted(packageId: number): Promise<PackageRow> {
        const pkg = await this.records.packageRow(packageId);
        if (pkg.website_status === PackageWebsiteStatus.DELETED_BY_ADMIN) throw packageDeleted();
        return pkg;
    }

    private async liveNotDeleted(packageId: number): Promise<PackageRow> {
        const pkg = await this.notDeleted(packageId);
        if (pkg.live_version_id === null || !LIVE_WEBSITE_STATUSES.includes(pkg.website_status)) throw notLivePackage();
        return pkg;
    }
}
