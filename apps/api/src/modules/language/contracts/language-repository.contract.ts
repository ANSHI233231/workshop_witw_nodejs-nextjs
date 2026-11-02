import type { PaginationQuery } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { LanguageFilters, LanguageInput, NewLanguage } from '../dto/language.dto';
import type { LanguageRecord, LanguageRow, LanguageSite } from '../types/language.types';

export interface ILanguageRepository {
    list(db: DbExecutor, filters: LanguageFilters, pagination: PaginationQuery): Promise<LanguageRecord[]>;
    count(db: DbExecutor, filters: LanguageFilters): Promise<number>;
    listActive(db: DbExecutor): Promise<LanguageRecord[]>;
    findByCode(db: DbExecutor, code: string): Promise<LanguageRecord | undefined>;
    findOtherByName(db: DbExecutor, name: string, exceptCode: string): Promise<LanguageRow | undefined>;
    insert(db: DbExecutor, language: NewLanguage, actorId: number): Promise<void>;
    update(db: DbExecutor, code: string, input: LanguageInput, actorId: number): Promise<void>;
    updateStatus(db: DbExecutor, code: string, status: number, actorId: number): Promise<void>;
    writeSites(
        db: DbExecutor,
        code: string,
        shownIn: readonly LanguageSite[],
        defaultFor: readonly LanguageSite[],
        actorId: number,
    ): Promise<void>;
    makeDefault(db: DbExecutor, site: LanguageSite, code: string, actorId: number): Promise<void>;
    clearDefaultExcept(db: DbExecutor, site: LanguageSite, keepCode: string, actorId: number): Promise<void>;
}
