import type { PaginationQuery } from '../../../core/validation';
import type {
    AdminDeleteInput,
    ApprovalItemDto,
    BasicSection,
    ConsoleListFilters,
    FaqsSection,
    FormOptionsDto,
    GettingThereSection,
    ImageTarget,
    InclusionsSection,
    IncomingImage,
    ItinerarySection,
    PackageFile,
    PackageListItemDto,
    PackageSummaryDto,
    PackageViewDto,
    Page,
    SavedSectionDto,
} from '../dto/package.dto';

export interface IPackageConsoleService {
    approvals(search: string | undefined, pagination: PaginationQuery): Promise<Page<ApprovalItemDto>>;
    list(filters: ConsoleListFilters, pagination: PaginationQuery): Promise<Page<PackageListItemDto>>;
    detail(packageId: number): Promise<PackageSummaryDto>;
    version(packageId: number, versionId: number): Promise<PackageViewDto>;
    formOptions(packageId: number): Promise<FormOptionsDto>;
    saveBasic(actorId: number, packageId: number, versionId: number, basic: BasicSection): Promise<SavedSectionDto>;
    saveItinerary(actorId: number, packageId: number, versionId: number, section: ItinerarySection): Promise<SavedSectionDto>;
    saveInclusions(actorId: number, packageId: number, versionId: number, section: InclusionsSection): Promise<SavedSectionDto>;
    saveGettingThere(actorId: number, packageId: number, versionId: number, section: GettingThereSection): Promise<SavedSectionDto>;
    saveFaqs(actorId: number, packageId: number, versionId: number, section: FaqsSection): Promise<SavedSectionDto>;
    setImage(actorId: number, packageId: number, versionId: number, target: ImageTarget, image: IncomingImage | null): Promise<SavedSectionDto>;
    approve(actorId: number, packageId: number, versionId: number): Promise<PackageViewDto>;
    reject(actorId: number, packageId: number, versionId: number, reason: string): Promise<PackageViewDto>;
    remove(actorId: number, packageId: number, input: AdminDeleteInput): Promise<PackageSummaryDto>;
    setPopular(actorId: number, packageId: number, on: boolean): Promise<PackageSummaryDto>;
    setBestDeal(actorId: number, packageId: number, on: boolean): Promise<PackageSummaryDto>;
    file(packageId: number, versionId: number, fileName: string): Promise<PackageFile>;
}
