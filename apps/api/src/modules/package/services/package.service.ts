import type { IPackageService } from '../contracts/package-service.contract';
import type {
    PackageFile,
    ParkPriceRange,
    ShownPackageRef,
    WebsiteCardDto,
    WebsitePackageView,
    WebsitePageDto,
    WebsiteQuery,
} from '../dto/package.dto';
import { toContent, toPark, type VersionChildren } from '../mappers/package.mapper';
import type { PackageWebsiteRepository } from '../repositories/package-website.repository';
import { PACKAGE_LIMITS, type VersionRow, type WebsiteCardRow } from '../types/package.types';
import { packageNotFound, type PackageRecords } from './package-records';
import { hasBeenLive, SHOWN } from './package-rules';

const openEnded = (value: number | undefined, openFrom: number): number | undefined =>
    value === undefined || value >= openFrom ? undefined : value;

const emptyChildren: Omit<VersionChildren, 'parks'> = { features: [], inclusions: [], days: [], faqs: [], photos: [] };

export class PackageService implements IPackageService {
    constructor(
        private readonly records: PackageRecords,
        private readonly website: PackageWebsiteRepository,
    ) {}

    async shownPackage(packageId: number): Promise<ShownPackageRef | null> {
        const row = await this.website.shownById(this.records.db, SHOWN, packageId);
        if (!row) return null;
        const [version] = await this.records.repository.versionsByIds(this.records.db, [row.version_id]);
        if (!version) return null;
        return {
            packageId: row.package_id,
            slug: row.slug,
            partnerId: row.partner_id,
            partnerUserId: row.partner_user_id,
            businessName: row.business_name,
            liveVersionId: row.version_id,
            liveVersionNumber: row.version_number,
            name: version.name,
            pricePerPerson: version.price_per_person,
        };
    }

    async listShown(query: WebsiteQuery): Promise<WebsitePageDto> {
        const effective: WebsiteQuery = {
            ...query,
            priceMax: openEnded(query.priceMax, PACKAGE_LIMITS.WEBSITE_PRICE_OPEN_FROM),
            nightsMax: openEnded(query.nightsMax, PACKAGE_LIMITS.WEBSITE_NIGHTS_OPEN_FROM),
            safarisMax: openEnded(query.safarisMax, PACKAGE_LIMITS.WEBSITE_SAFARIS_OPEN_FROM),
        };
        const [rows, total] = await Promise.all([
            this.website.list(this.records.db, SHOWN, effective),
            this.website.count(this.records.db, SHOWN, effective),
        ]);
        const size = PACKAGE_LIMITS.WEBSITE_PAGE_SIZE;
        const items = await this.cardsOf(rows);
        return { items, total, page: query.page, pageSize: size, hasMore: query.page * size < total };
    }

    async shownCards(packageIds: readonly number[]): Promise<WebsiteCardDto[]> {
        return this.cardsOf(await this.website.shownByIds(this.records.db, SHOWN, [...new Set(packageIds)]));
    }

    async listShownOfPartner(partnerId: number, page: number): Promise<WebsitePageDto> {
        const size = PACKAGE_LIMITS.WEBSITE_PAGE_SIZE;
        const [rows, total] = await Promise.all([
            this.website.shownOfPartner(this.records.db, SHOWN, partnerId, page, size),
            this.website.countShownOfPartner(this.records.db, SHOWN, partnerId),
        ]);
        const items = await this.cardsOf(rows);
        return { items, total, page, pageSize: size, hasMore: page * size < total };
    }

    private async cardsOf(rows: readonly WebsiteCardRow[]): Promise<WebsiteCardDto[]> {
        const versionIds = rows.map((row) => row.version_id);
        const [versions, parks] = await Promise.all([
            this.records.repository.versionsByIds(this.records.db, versionIds),
            this.records.repository.parksOf(this.records.db, versionIds),
        ]);
        const versionOf = new Map(versions.map((version) => [version.id, version]));
        return rows.flatMap((row) => {
            const version = versionOf.get(row.version_id);
            if (!version) return [];
            const own = parks.filter((park) => park.package_version_id === row.version_id);
            return [this.card(row, version, { parks: own, ...emptyChildren })];
        });
    }

    async pageBySlug(slug: string): Promise<WebsitePackageView> {
        const pkg = await this.records.repository.findBySlug(this.records.db, slug);
        if (!pkg || !hasBeenLive(pkg)) throw packageNotFound();
        const row = await this.website.shownBySlug(this.records.db, SHOWN, slug);
        if (!row) return { inUse: false, package: null };
        const version = await this.records.versionRow(row.package_id, row.version_id);
        const children = await this.records.children(version.id);
        return {
            inUse: true,
            package: {
                ...toContent(version, children),
                ...this.card(row, version, children),
                versionId: version.id,
                versionNumber: version.version_number,
            },
        };
    }

    async priceRangesOfParks(masterParkIds: readonly number[]): Promise<ParkPriceRange[]> {
        const rows = await this.website.priceRanges(this.records.db, SHOWN, masterParkIds);
        return rows.map((row) => ({
            masterParkId: row.master_park_id,
            lowestPricePerPerson: Number(row.lowest),
            highestPricePerPerson: Number(row.highest),
            packageCount: Number(row.package_count),
        }));
    }

    async websiteFile(slug: string, fileName: string): Promise<PackageFile> {
        const row = await this.website.shownBySlug(this.records.db, SHOWN, slug);
        if (!row) throw packageNotFound();
        return this.records.readVersionFile(await this.records.versionRow(row.package_id, row.version_id), fileName);
    }

    private card(row: WebsiteCardRow, version: VersionRow, children: VersionChildren): WebsiteCardDto {
        const parks = children.parks.map(toPark);
        return {
            id: row.package_id,
            slug: row.slug,
            name: version.name,
            mainPark: parks[0] ?? null,
            parks,
            dayCount: version.day_count,
            nightCount: version.day_count - 1,
            safariCount: version.safari_count,
            safariType: version.safari_type,
            activityMessage: version.activity_message,
            pricePerPerson: version.price_per_person,
            totalPrice: version.total_price,
            priceBeforeDiscount: version.price_before_discount,
            priceMessage: version.price_message,
            tag: {
                text: version.tag_text,
                backgroundColor: version.tag_background_color,
                textColor: version.tag_text_color,
            },
            packageImage: version.package_image,
            isPopular: row.is_popular === 1,
            isBestDeal: row.is_best_deal === 1,
            partner: { id: row.partner_id, businessName: row.business_name },
        };
    }
}
