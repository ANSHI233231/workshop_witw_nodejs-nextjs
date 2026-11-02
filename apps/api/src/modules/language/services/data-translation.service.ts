import { getRequestContext } from '../../../core/context';
import { type FieldError, ValidationException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import type { IAuditService } from '../../audit';
import type { IDataTranslationRepository } from '../contracts/data-translation-repository.contract';
import type { IDataTranslationService } from '../contracts/data-translation-service.contract';
import type { ILanguageRepository } from '../contracts/language-repository.contract';
import type {
    ActiveLanguageDto,
    DataTranslationChanges,
    DataTranslationEdit,
    DataTranslationTarget,
    DataTranslationValues,
    TranslatableColumns,
} from '../dto/language.dto';
import { BASE_LANGUAGE_CODE, type LanguageRow } from '../types/language.types';

const DEFAULT_ID_KEY = 'id';

const keyOf = (table: string, entityId: number, column: string, languageCode: string): string =>
    `${table}|${entityId}|${column}|${languageCode}`;

const toActiveLanguage = (row: LanguageRow): ActiveLanguageDto => ({
    code: row.code,
    name: row.name,
    nativeName: row.native_name,
    shortName: row.short_name,
});

export class DataTranslationService implements IDataTranslationService {
    constructor(
        private readonly db: Database,
        private readonly repository: IDataTranslationRepository,
        private readonly languageRepository: ILanguageRepository,
        private readonly auditService: IAuditService,
    ) {}

    async languages(): Promise<ActiveLanguageDto[]> {
        return (await this.languageRepository.listActive(this.db))
            .map((record) => record.row)
            .filter((row) => row.code !== BASE_LANGUAGE_CODE)
            .map(toActiveLanguage);
    }

    async apply<T extends object>(rows: readonly T[], targets: readonly DataTranslationTarget[]): Promise<T[]> {
        const language = await this.requestLanguage();
        if (language === null || rows.length === 0) return [...rows];
        const lookups = targets
            .map((target) => ({
                table: target.table,
                ids: [...new Set(rows.map((row) => Number(this.idOf(row, target))).filter(Number.isFinite))],
                columns: target.columns,
            }))
            .filter((lookup) => lookup.ids.length > 0 && lookup.columns.length > 0);
        if (lookups.length === 0) return [...rows];
        const texts = new Map(
            (await this.repository.forRows(this.db, lookups, [language])).map((found) => [
                keyOf(found.entity_table, Number(found.entity_id), found.entity_column, found.master_language_code),
                found.translated_text,
            ]),
        );
        return rows.map((row) => {
            const translated = { ...row } as Record<string, unknown>;
            for (const target of targets) {
                const entityId = Number(this.idOf(row, target));
                for (const column of target.columns) {
                    const text = texts.get(keyOf(target.table, entityId, column, language));
                    if (text !== undefined) translated[column] = text;
                }
            }
            return translated as T;
        });
    }

    async forEdit(table: string, entityId: number, columns: readonly string[]): Promise<DataTranslationEdit> {
        const [languages, rows] = await Promise.all([
            this.languages(),
            this.repository.forEntity(this.db, table, entityId),
        ]);
        const translations: Record<string, Record<string, string>> = {};
        for (const language of languages) {
            translations[language.code] = Object.fromEntries(
                rows
                    .filter((row) => row.master_language_code === language.code && columns.includes(row.entity_column))
                    .map((row) => [row.entity_column, row.translated_text]),
            );
        }
        return { translations, languages };
    }

    async save(
        table: string,
        entityId: number,
        values: DataTranslationValues | undefined,
        columns: TranslatableColumns,
        actorId: number,
    ): Promise<DataTranslationChanges> {
        if (values === undefined) return {};
        const active = new Set((await this.languages()).map((language) => language.code));
        this.refuseInvalid(values, columns, active);
        const existing = new Map(
            (await this.repository.forEntity(this.db, table, entityId)).map((row) => [
                keyOf(table, entityId, row.entity_column, row.master_language_code),
                row.translated_text,
            ]),
        );
        const changes: Record<string, { from: string | null; to: string | null }> = {};
        for (const [languageCode, texts] of Object.entries(values)) {
            for (const [column, raw] of Object.entries(texts)) {
                const text = raw.trim();
                const before = existing.get(keyOf(table, entityId, column, languageCode)) ?? null;
                const key = { table, entityId, column, languageCode };
                if (text === '' && before !== null) {
                    await this.repository.clear(this.db, key, actorId);
                    changes[`translations.${languageCode}.${column}`] = { from: before, to: null };
                } else if (text !== '' && text !== before) {
                    await this.repository.save(this.db, key, text, actorId);
                    changes[`translations.${languageCode}.${column}`] = { from: before, to: text };
                }
            }
        }
        return changes;
    }

    private idOf(row: object, target: DataTranslationTarget): unknown {
        return (row as Record<string, unknown>)[target.idKey ?? DEFAULT_ID_KEY];
    }

    private async requestLanguage(): Promise<string | null> {
        const code = getRequestContext()?.language ?? BASE_LANGUAGE_CODE;
        if (code === BASE_LANGUAGE_CODE) return null;
        return (await this.languages()).some((language) => language.code === code) ? code : null;
    }

    private refuseInvalid(
        values: DataTranslationValues,
        columns: TranslatableColumns,
        active: ReadonlySet<string>,
    ): void {
        const errors: FieldError[] = [];
        for (const [languageCode, texts] of Object.entries(values)) {
            if (languageCode === BASE_LANGUAGE_CODE || !active.has(languageCode)) {
                errors.push({ field: `translations.${languageCode}`, message: 'Choose an active language.' });
                continue;
            }
            for (const [column, text] of Object.entries(texts)) {
                const max = columns[column];
                if (max === undefined) {
                    errors.push({
                        field: `translations.${languageCode}.${column}`,
                        message: 'This field cannot be translated.',
                    });
                } else if (text.trim().length > max) {
                    errors.push({
                        field: `translations.${languageCode}.${column}`,
                        message: `Can be at most ${max} characters.`,
                    });
                }
            }
        }
        if (errors.length > 0) throw new ValidationException('Validation failed.', errors, 'DATA_TRANSLATION_INVALID');
    }
}
