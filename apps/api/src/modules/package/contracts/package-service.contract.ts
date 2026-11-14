import type {
    PackageFile,
    ParkPriceRange,
    ShownPackageRef,
    WebsitePackageView,
    WebsitePageDto,
    WebsiteQuery,
} from '../dto/package.dto';

export interface IPackageService {
    shownPackage(packageId: number): Promise<ShownPackageRef | null>;
    listShown(query: WebsiteQuery): Promise<WebsitePageDto>;
    pageBySlug(slug: string): Promise<WebsitePackageView>;
    priceRangesOfParks(masterParkIds: readonly number[]): Promise<ParkPriceRange[]>;
    websiteFile(slug: string, fileName: string): Promise<PackageFile>;
}
