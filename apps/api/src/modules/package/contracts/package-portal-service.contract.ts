import type {
    BasicSection,
    DeletedVersionDto,
    FaqsSection,
    FormOptionsDto,
    GettingThereSection,
    ImageTarget,
    InclusionsSection,
    IncomingImage,
    ItinerarySection,
    PackageFile,
    PackageListItemDto,
    PackageViewDto,
    PartnerDashboardDto,
    PortalListFilters,
    SavedSectionDto,
} from '../dto/package.dto';
import type { PackageWebsiteStatusCode } from '../types/package.types';

export interface IPackagePortalService {
    dashboard(userId: number): Promise<PartnerDashboardDto>;
    list(userId: number, filters: PortalListFilters): Promise<PackageListItemDto[]>;
    formOptions(userId: number): Promise<FormOptionsDto>;
    formOptionsOf(partnerId: number): Promise<FormOptionsDto>;
    create(userId: number, basic: BasicSection): Promise<PackageViewDto>;
    detail(userId: number, packageId: number): Promise<PackageViewDto>;
    version(userId: number, packageId: number, versionId: number): Promise<PackageViewDto>;
    saveBasic(userId: number, packageId: number, versionId: number, basic: BasicSection): Promise<SavedSectionDto>;
    saveItinerary(userId: number, packageId: number, versionId: number, section: ItinerarySection): Promise<SavedSectionDto>;
    saveInclusions(userId: number, packageId: number, versionId: number, section: InclusionsSection): Promise<SavedSectionDto>;
    saveGettingThere(userId: number, packageId: number, versionId: number, section: GettingThereSection): Promise<SavedSectionDto>;
    saveFaqs(userId: number, packageId: number, versionId: number, section: FaqsSection): Promise<SavedSectionDto>;
    setImage(userId: number, packageId: number, versionId: number, target: ImageTarget, image: IncomingImage | null): Promise<SavedSectionDto>;
    startEdit(userId: number, packageId: number): Promise<PackageViewDto>;
    send(userId: number, packageId: number, versionId: number): Promise<PackageViewDto>;
    deleteWorking(userId: number, packageId: number, versionId: number): Promise<DeletedVersionDto>;
    setWebsiteStatus(userId: number, packageId: number, status: PackageWebsiteStatusCode): Promise<PackageListItemDto>;
    file(userId: number, packageId: number, versionId: number, fileName: string): Promise<PackageFile>;
}
