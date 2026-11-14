import { NotFoundException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import type { IParkRepository } from '../contracts/park-repository.contract';
import type { IParkWebsiteService } from '../contracts/park-website-service.contract';
import type { ParkFeatureImage, WebsiteParkList, WebsiteParkPageDto, WebsiteParkQuery } from '../dto/park.dto';
import { toWebsiteParkCard, toWebsiteParkPage } from '../mappers/park.mapper';
import { PARK_LIMITS } from '../types/park.types';
import { PARK_MESSAGES } from '../validators/park.validators';
import type { ParkImages } from './park-images';
import { type ParkPrices, priceIn } from './park-prices';

const notFound = (): NotFoundException => new NotFoundException(PARK_MESSAGES.NOT_FOUND, 'PARK_NOT_FOUND');

export class ParkWebsiteService implements IParkWebsiteService {
    constructor(
        private readonly db: Database,
        private readonly repository: IParkRepository,
        private readonly prices: ParkPrices,
        private readonly images: ParkImages,
    ) {}

    async list(query: WebsiteParkQuery): Promise<WebsiteParkList> {
        const limit = PARK_LIMITS.WEBSITE_PAGE_SIZE;
        const [rows, total] = await Promise.all([
            this.repository.websiteList(this.db, query, limit),
            this.repository.websiteCount(this.db, query),
        ]);
        const prices = await this.prices.of(rows.map((row) => row.id));
        return {
            items: rows.map((row) => toWebsiteParkCard(row, priceIn(prices, row.id))),
            page: query.page,
            limit,
            total,
        };
    }

    async page(slug: string): Promise<WebsiteParkPageDto> {
        const row = await this.repository.websitePage(this.db, slug);
        if (!row) throw notFound();
        return toWebsiteParkPage(row, await this.prices.ofOne(row.id));
    }

    async featureImage(slug: string): Promise<ParkFeatureImage> {
        const row = await this.repository.featureImageOfActive(this.db, slug);
        if (!row) throw notFound();
        return this.images.read(row.id, row.feature_image);
    }
}
