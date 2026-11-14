import type { DbExecutor } from '../../../database/connection';
import type { WebsiteQuery } from '../dto/package.dto';
import { WebsiteSQL, type WebsiteListShape } from '../sql/package-website.sql';
import { type CountRow, PACKAGE_LIMITS, type PriceRangeRow, type WebsiteCardRow } from '../types/package.types';

import { likeAnywhere } from './package.repository';

export type ShownCondition = readonly [websiteStatus: number, partnerStatus: number];

const shapeOf = (query: WebsiteQuery): WebsiteListShape => ({
    search: query.search !== undefined,
    park: query.masterParkId !== undefined,
    priceMin: query.priceMin !== undefined,
    priceMax: query.priceMax !== undefined,
    nightsMin: query.nightsMin !== undefined,
    nightsMax: query.nightsMax !== undefined,
    safarisMin: query.safarisMin !== undefined,
    safarisMax: query.safarisMax !== undefined,
    stays: query.stays.length,
    features: query.features.length,
    inclusions: query.inclusions.length,
});

const filterValues = (query: WebsiteQuery): unknown[] =>
    [
        query.search === undefined ? undefined : likeAnywhere(query.search),
        query.masterParkId,
        query.priceMin,
        query.priceMax,
        query.nightsMin,
        query.nightsMax,
        query.safarisMin,
        query.safarisMax,
    ]
        .filter((value) => value !== undefined)
        .concat([...query.stays, ...query.features, ...query.inclusions]);

export class PackageWebsiteRepository {
    async list(db: DbExecutor, shown: ShownCondition, query: WebsiteQuery): Promise<WebsiteCardRow[]> {
        const size = PACKAGE_LIMITS.WEBSITE_PAGE_SIZE;
        return db.query<WebsiteCardRow>(WebsiteSQL.list(shapeOf(query), query.sort), [
            ...shown,
            ...filterValues(query),
            size,
            (query.page - 1) * size,
        ]);
    }

    async count(db: DbExecutor, shown: ShownCondition, query: WebsiteQuery): Promise<number> {
        const rows = await db.query<CountRow>(WebsiteSQL.count(shapeOf(query)), [...shown, ...filterValues(query)]);
        return Number(rows[0]?.total ?? 0);
    }

    async shownById(db: DbExecutor, shown: ShownCondition, packageId: number): Promise<WebsiteCardRow | undefined> {
        return (await db.query<WebsiteCardRow>(WebsiteSQL.shownById, [...shown, packageId]))[0];
    }

    async shownBySlug(db: DbExecutor, shown: ShownCondition, slug: string): Promise<WebsiteCardRow | undefined> {
        return (await db.query<WebsiteCardRow>(WebsiteSQL.shownBySlug, [...shown, slug]))[0];
    }

    async priceRanges(db: DbExecutor, shown: ShownCondition, parkIds: readonly number[]): Promise<PriceRangeRow[]> {
        return db.query<PriceRangeRow>(WebsiteSQL.priceRanges(parkIds.length), [...shown, ...parkIds]);
    }
}
