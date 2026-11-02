import type {
    TranslatableColumns,
    DataTranslationChanges,
    DataTranslationEdit,
    ActiveLanguageDto,
    DataTranslationTarget,
    DataTranslationValues,
} from '../dto/language.dto';

export interface IDataTranslationService {
    languages(): Promise<ActiveLanguageDto[]>;
    apply<T extends object>(rows: readonly T[], targets: readonly DataTranslationTarget[]): Promise<T[]>;
    forEdit(table: string, entityId: number, columns: readonly string[]): Promise<DataTranslationEdit>;
    save(
        table: string,
        entityId: number,
        values: DataTranslationValues | undefined,
        columns: TranslatableColumns,
        actorId: number,
    ): Promise<DataTranslationChanges>;
}
