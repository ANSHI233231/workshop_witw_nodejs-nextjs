import type { PaginationQuery } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { AppTranslationFilters, TranslatedTexts } from '../dto/language.dto';
import type { AppTranslationLanguage, AppTranslationRow } from '../types/language.types';

export interface IAppTranslationRepository {
    textColumns(db: DbExecutor): Promise<string[]>;
    addTextColumn(db: DbExecutor, code: string): Promise<void>;
    list(
        db: DbExecutor,
        filters: AppTranslationFilters,
        pagination: PaginationQuery,
        languages: readonly AppTranslationLanguage[],
    ): Promise<AppTranslationRow[]>;
    count(
        db: DbExecutor,
        filters: AppTranslationFilters,
        languages: readonly AppTranslationLanguage[],
    ): Promise<number>;
    listActive(db: DbExecutor, languages: readonly AppTranslationLanguage[]): Promise<AppTranslationRow[]>;
    listAll(db: DbExecutor, languages: readonly AppTranslationLanguage[]): Promise<AppTranslationRow[]>;
    findById(
        db: DbExecutor,
        id: number,
        languages: readonly AppTranslationLanguage[],
    ): Promise<AppTranslationRow | undefined>;
    findOtherByEnglish(
        db: DbExecutor,
        enText: string,
        exceptId: number,
        languages: readonly AppTranslationLanguage[],
    ): Promise<AppTranslationRow | undefined>;
    insert(
        db: DbExecutor,
        enText: string,
        texts: TranslatedTexts,
        languages: readonly AppTranslationLanguage[],
        actorId: number,
    ): Promise<number>;
    update(
        db: DbExecutor,
        id: number,
        enText: string,
        texts: TranslatedTexts,
        languages: readonly AppTranslationLanguage[],
        actorId: number,
    ): Promise<void>;
    updateTexts(
        db: DbExecutor,
        id: number,
        texts: TranslatedTexts,
        languages: readonly AppTranslationLanguage[],
        actorId: number,
    ): Promise<void>;
    updateStatus(db: DbExecutor, id: number, status: number, actorId: number): Promise<void>;
}
