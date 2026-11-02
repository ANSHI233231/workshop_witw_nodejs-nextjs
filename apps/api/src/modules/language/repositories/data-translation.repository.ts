import type { DbExecutor } from '../../../database/connection';
import type {
    IDataTranslationRepository,
    DataTranslationKey,
    DataTranslationLookup,
} from '../contracts/data-translation-repository.contract';
import { DataTranslationSQL } from '../sql/data-translation.sql';
import { type DataTranslationRow, DataTranslationStatus } from '../types/language.types';

export class DataTranslationRepository implements IDataTranslationRepository {
    forRows(
        db: DbExecutor,
        lookups: readonly DataTranslationLookup[],
        languageCodes: readonly string[],
    ): Promise<DataTranslationRow[]> {
        const shape = lookups.map((lookup) => ({ ids: lookup.ids.length, columns: lookup.columns.length }));
        return db.query<DataTranslationRow>(DataTranslationSQL.forRows(shape, languageCodes.length), [
            DataTranslationStatus.ACTIVE,
            ...languageCodes,
            ...lookups.flatMap((lookup) => [lookup.table, ...lookup.ids, ...lookup.columns]),
        ]);
    }

    forEntity(db: DbExecutor, table: string, entityId: number): Promise<DataTranslationRow[]> {
        return db.query<DataTranslationRow>(DataTranslationSQL.forEntity, [table, entityId, DataTranslationStatus.ACTIVE]);
    }

    async save(db: DbExecutor, key: DataTranslationKey, text: string, actorId: number | null): Promise<void> {
        await db.execute(DataTranslationSQL.save, [
            key.table,
            key.entityId,
            key.column,
            key.languageCode,
            text,
            DataTranslationStatus.ACTIVE,
            actorId,
            actorId,
        ]);
    }

    async clear(db: DbExecutor, key: DataTranslationKey, actorId: number | null): Promise<void> {
        await db.execute(DataTranslationSQL.clear, [
            DataTranslationStatus.DELETED,
            actorId,
            actorId,
            key.table,
            key.entityId,
            key.column,
            key.languageCode,
            DataTranslationStatus.ACTIVE,
        ]);
    }
}
