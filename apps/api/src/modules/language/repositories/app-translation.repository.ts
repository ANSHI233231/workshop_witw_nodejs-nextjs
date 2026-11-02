import { type PaginationQuery, toOffset } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { IAppTranslationRepository } from '../contracts/app-translation-repository.contract';
import type { AppTranslationFilters, TranslatedTexts } from '../dto/language.dto';
import { AppTranslationSQL } from '../sql/app-translation.sql';
import {
    APP_TRANSLATION_DELETED,
    APP_TRANSLATION_ENGLISH_COLUMN,
    APP_TRANSLATION_TEXT_COLUMN,
    appTranslationColumnOf,
    type AppTranslationLanguage,
    type AppTranslationRow,
    AppTranslationStatus,
    type ColumnNameRow,
    type CountRow,
} from '../types/language.types';

const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

const columnsOf = (languages: readonly AppTranslationLanguage[]): string[] =>
    languages.map((language) => language.column);

const missingColumnOf = (filters: AppTranslationFilters, languages: readonly AppTranslationLanguage[]) =>
    languages.find((language) => language.code === filters.missing)?.column;

const shapeOf = (filters: AppTranslationFilters, languages: readonly AppTranslationLanguage[]) => ({
    status: filters.status !== undefined,
    search: filters.search !== undefined,
    missing: missingColumnOf(filters, languages),
});

const filterValues = (filters: AppTranslationFilters, languages: readonly AppTranslationLanguage[]): unknown[] => [
    APP_TRANSLATION_DELETED,
    ...(filters.status !== undefined ? [filters.status] : []),
    ...(filters.search !== undefined
        ? Array.from({ length: languages.length + 1 }, () => likeAnywhere(filters.search ?? ''))
        : []),
];

const textValues = (texts: TranslatedTexts, languages: readonly AppTranslationLanguage[]): string[] =>
    languages.map((language) => texts[language.code] ?? '');

export class AppTranslationRepository implements IAppTranslationRepository {
    async textColumns(db: DbExecutor): Promise<string[]> {
        const rows = await db.query<ColumnNameRow>(AppTranslationSQL.textColumns, []);
        return rows
            .map((row) => row.column_name)
            .filter((column) => column !== APP_TRANSLATION_ENGLISH_COLUMN && APP_TRANSLATION_TEXT_COLUMN.test(column));
    }

    async addTextColumn(db: DbExecutor, code: string): Promise<void> {
        const column = appTranslationColumnOf(code);
        if (!APP_TRANSLATION_TEXT_COLUMN.test(column)) throw new Error(`Not a language column: ${column}`);
        await db.execute(AppTranslationSQL.addTextColumn(column), []);
    }

    list(
        db: DbExecutor,
        filters: AppTranslationFilters,
        pagination: PaginationQuery,
        languages: readonly AppTranslationLanguage[],
    ): Promise<AppTranslationRow[]> {
        return db.query<AppTranslationRow>(AppTranslationSQL.list(shapeOf(filters, languages), columnsOf(languages)), [
            ...filterValues(filters, languages),
            pagination.limit,
            toOffset(pagination),
        ]);
    }

    async count(
        db: DbExecutor,
        filters: AppTranslationFilters,
        languages: readonly AppTranslationLanguage[],
    ): Promise<number> {
        const rows = await db.query<CountRow>(
            AppTranslationSQL.count(shapeOf(filters, languages), columnsOf(languages)),
            filterValues(filters, languages),
        );
        return Number(rows[0]?.total ?? 0);
    }

    listActive(db: DbExecutor, languages: readonly AppTranslationLanguage[]): Promise<AppTranslationRow[]> {
        return db.query<AppTranslationRow>(AppTranslationSQL.listActive(columnsOf(languages)), [
            AppTranslationStatus.ACTIVE,
        ]);
    }

    listAll(db: DbExecutor, languages: readonly AppTranslationLanguage[]): Promise<AppTranslationRow[]> {
        return db.query<AppTranslationRow>(AppTranslationSQL.listAll(columnsOf(languages)), [APP_TRANSLATION_DELETED]);
    }

    async findById(
        db: DbExecutor,
        id: number,
        languages: readonly AppTranslationLanguage[],
    ): Promise<AppTranslationRow | undefined> {
        return (
            await db.query<AppTranslationRow>(AppTranslationSQL.findById(columnsOf(languages)), [
                id,
                APP_TRANSLATION_DELETED,
            ])
        )[0];
    }

    async findOtherByEnglish(
        db: DbExecutor,
        enText: string,
        exceptId: number,
        languages: readonly AppTranslationLanguage[],
    ): Promise<AppTranslationRow | undefined> {
        return (
            await db.query<AppTranslationRow>(AppTranslationSQL.findOtherByEnglish(columnsOf(languages)), [
                enText,
                exceptId,
            ])
        )[0];
    }

    async insert(
        db: DbExecutor,
        enText: string,
        texts: TranslatedTexts,
        languages: readonly AppTranslationLanguage[],
        actorId: number,
    ): Promise<number> {
        const result = await db.execute(AppTranslationSQL.insert(columnsOf(languages)), [
            enText,
            ...textValues(texts, languages),
            AppTranslationStatus.ACTIVE,
            actorId,
            actorId,
        ]);
        return result.insertId;
    }

    async update(
        db: DbExecutor,
        id: number,
        enText: string,
        texts: TranslatedTexts,
        languages: readonly AppTranslationLanguage[],
        actorId: number,
    ): Promise<void> {
        await db.execute(AppTranslationSQL.update(columnsOf(languages)), [
            enText,
            ...textValues(texts, languages),
            actorId,
            id,
            APP_TRANSLATION_DELETED,
        ]);
    }

    async updateTexts(
        db: DbExecutor,
        id: number,
        texts: TranslatedTexts,
        languages: readonly AppTranslationLanguage[],
        actorId: number,
    ): Promise<void> {
        if (languages.length === 0) return;
        await db.execute(AppTranslationSQL.updateTexts(columnsOf(languages)), [
            ...textValues(texts, languages),
            actorId,
            id,
            APP_TRANSLATION_DELETED,
        ]);
    }

    async updateStatus(db: DbExecutor, id: number, status: number, actorId: number): Promise<void> {
        await db.execute(AppTranslationSQL.updateStatus, [status, actorId, id, APP_TRANSLATION_DELETED]);
    }
}
