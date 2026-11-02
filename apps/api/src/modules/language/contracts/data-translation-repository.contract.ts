import type { DbExecutor } from '../../../database/connection';
import type { DataTranslationRow } from '../types/language.types';

export type DataTranslationLookup = {
    readonly table: string;
    readonly ids: readonly number[];
    readonly columns: readonly string[];
};

export type DataTranslationKey = {
    readonly table: string;
    readonly entityId: number;
    readonly column: string;
    readonly languageCode: string;
};

export interface IDataTranslationRepository {
    forRows(
        db: DbExecutor,
        lookups: readonly DataTranslationLookup[],
        languageCodes: readonly string[],
    ): Promise<DataTranslationRow[]>;
    forEntity(db: DbExecutor, table: string, entityId: number): Promise<DataTranslationRow[]>;
    save(db: DbExecutor, key: DataTranslationKey, text: string, actorId: number | null): Promise<void>;
    clear(db: DbExecutor, key: DataTranslationKey, actorId: number | null): Promise<void>;
}
