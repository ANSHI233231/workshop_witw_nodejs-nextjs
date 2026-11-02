import { type PaginationQuery, toOffset } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { ILanguageRepository } from '../contracts/language-repository.contract';
import type { LanguageFilters, LanguageInput, NewLanguage } from '../dto/language.dto';
import { MasterLanguageSQL } from '../sql/master-language.sql';
import {
    BASE_LANGUAGE_CODE,
    type CountRow,
    LANGUAGE_SITES,
    type LanguageRecord,
    type LanguageRow,
    type LanguageSite,
    type LanguageSiteRow,
    LanguageSiteStatus,
    LanguageStatus,
    SITE_CODE_OF,
} from '../types/language.types';

const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

const shapeOf = (filters: LanguageFilters) => ({
    status: filters.status !== undefined,
    search: filters.search !== undefined,
});

const filterValues = (filters: LanguageFilters): unknown[] => [
    ...(filters.status !== undefined ? [filters.status] : []),
    ...(filters.search !== undefined
        ? [likeAnywhere(filters.search), likeAnywhere(filters.search), likeAnywhere(filters.search)]
        : []),
];

export class LanguageRepository implements ILanguageRepository {
    async list(db: DbExecutor, filters: LanguageFilters, pagination: PaginationQuery): Promise<LanguageRecord[]> {
        const rows = await db.query<LanguageRow>(MasterLanguageSQL.list(shapeOf(filters)), [
            ...filterValues(filters),
            BASE_LANGUAGE_CODE,
            pagination.limit,
            toOffset(pagination),
        ]);
        return this.withSites(db, rows);
    }

    async count(db: DbExecutor, filters: LanguageFilters): Promise<number> {
        const rows = await db.query<CountRow>(MasterLanguageSQL.count(shapeOf(filters)), filterValues(filters));
        return Number(rows[0]?.total ?? 0);
    }

    async listActive(db: DbExecutor): Promise<LanguageRecord[]> {
        const rows = await db.query<LanguageRow>(MasterLanguageSQL.listActive, [
            LanguageStatus.ACTIVE,
            BASE_LANGUAGE_CODE,
        ]);
        return this.withSites(db, rows);
    }

    async findByCode(db: DbExecutor, code: string): Promise<LanguageRecord | undefined> {
        const rows = await db.query<LanguageRow>(MasterLanguageSQL.findByCode, [code]);
        return (await this.withSites(db, rows))[0];
    }

    async findOtherByName(db: DbExecutor, name: string, exceptCode: string): Promise<LanguageRow | undefined> {
        return (await db.query<LanguageRow>(MasterLanguageSQL.findOtherByName, [name, exceptCode]))[0];
    }

    async insert(db: DbExecutor, language: NewLanguage, actorId: number): Promise<void> {
        await db.execute(MasterLanguageSQL.insert, [
            language.code,
            language.name,
            language.nativeName,
            language.shortName,
            LanguageStatus.ACTIVE,
            actorId,
            actorId,
        ]);
    }

    async update(db: DbExecutor, code: string, input: LanguageInput, actorId: number): Promise<void> {
        await db.execute(MasterLanguageSQL.update, [input.name, input.nativeName, input.shortName, actorId, code]);
    }

    async updateStatus(db: DbExecutor, code: string, status: number, actorId: number): Promise<void> {
        await db.execute(MasterLanguageSQL.updateStatus, [status, actorId, code]);
    }

    async writeSites(
        db: DbExecutor,
        code: string,
        shownIn: readonly LanguageSite[],
        defaultFor: readonly LanguageSite[],
        actorId: number,
    ): Promise<void> {
        for (const site of LANGUAGE_SITES) {
            if (shownIn.includes(site)) {
                await db.execute(MasterLanguageSQL.showSite, [
                    code,
                    SITE_CODE_OF[site],
                    defaultFor.includes(site) ? 1 : 0,
                    LanguageSiteStatus.SHOWN,
                    actorId,
                    actorId,
                ]);
            } else {
                await db.execute(MasterLanguageSQL.hideSite, [
                    LanguageSiteStatus.HIDDEN,
                    actorId,
                    actorId,
                    code,
                    SITE_CODE_OF[site],
                    LanguageSiteStatus.HIDDEN,
                ]);
            }
        }
    }

    async makeDefault(db: DbExecutor, site: LanguageSite, code: string, actorId: number): Promise<void> {
        await db.execute(MasterLanguageSQL.makeDefault, [actorId, code, SITE_CODE_OF[site], LanguageSiteStatus.SHOWN]);
    }

    async clearDefaultExcept(db: DbExecutor, site: LanguageSite, keepCode: string, actorId: number): Promise<void> {
        await db.execute(MasterLanguageSQL.clearDefaultExcept, [actorId, SITE_CODE_OF[site], keepCode]);
    }

    private async withSites(db: DbExecutor, rows: readonly LanguageRow[]): Promise<LanguageRecord[]> {
        if (rows.length === 0) return [];
        const sites = await db.query<LanguageSiteRow>(MasterLanguageSQL.sitesOf(rows.length), [
            LanguageSiteStatus.SHOWN,
            ...rows.map((row) => row.code),
        ]);
        return rows.map((row) => ({ row, sites: sites.filter((site) => site.master_language_code === row.code) }));
    }
}
