import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import { LanguageTestDataSQL } from '../sql/language-test-data.sql';
import { APP_TRANSLATION_TEXT_COLUMN, BASE_LANGUAGE_CODE } from '../types/language.types';

const startsWith = (text: string): string => `${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

export interface TestLanguageRow extends RowDataPacket {
    code: string;
    name: string;
    status: number;
}

export interface TestLanguageSiteRow extends RowDataPacket {
    master_language_code: string;
    site: number;
}

export interface TestDataTranslationRow extends RowDataPacket {
    id: number;
    entity_table: string;
    entity_id: number;
    entity_column: string;
    master_language_code: string;
}

export interface TestAppTranslationRow extends RowDataPacket {
    id: number;
    en_text: string;
}

interface TotalRow extends RowDataPacket {
    total: number;
}

export class LanguageTestDataRepository {
    async markedLanguages(db: DbExecutor, textPrefix: string): Promise<TestLanguageRow[]> {
        return db.query<TestLanguageRow>(LanguageTestDataSQL.markedLanguages, [startsWith(textPrefix), BASE_LANGUAGE_CODE]);
    }

    async sitesOf(db: DbExecutor, codes: readonly string[]): Promise<TestLanguageSiteRow[]> {
        if (codes.length === 0) return [];
        return db.query<TestLanguageSiteRow>(LanguageTestDataSQL.sitesOf(codes.length), codes);
    }

    async dataTranslationsOf(db: DbExecutor, codes: readonly string[]): Promise<TestDataTranslationRow[]> {
        if (codes.length === 0) return [];
        return db.query<TestDataTranslationRow>(LanguageTestDataSQL.dataTranslationsOf(codes.length), codes);
    }

    async markedAppTranslations(db: DbExecutor, textPrefix: string): Promise<TestAppTranslationRow[]> {
        return db.query<TestAppTranslationRow>(LanguageTestDataSQL.markedAppTranslations, [startsWith(textPrefix)]);
    }

    async filledValues(db: DbExecutor, column: string): Promise<number> {
        this.assertTextColumn(column);
        const rows = await db.query<TotalRow>(LanguageTestDataSQL.filledValues(column), []);
        return rows[0]?.total ?? 0;
    }

    async deleteAppTranslations(db: DbExecutor, ids: readonly number[]): Promise<number> {
        if (ids.length === 0) return 0;
        return (await db.execute(LanguageTestDataSQL.deleteAppTranslations(ids.length), ids)).affectedRows;
    }

    async deleteDataTranslations(db: DbExecutor, codes: readonly string[]): Promise<number> {
        if (codes.length === 0) return 0;
        return (await db.execute(LanguageTestDataSQL.deleteDataTranslations(codes.length), codes)).affectedRows;
    }

    async deleteSites(db: DbExecutor, codes: readonly string[]): Promise<number> {
        if (codes.length === 0) return 0;
        return (await db.execute(LanguageTestDataSQL.deleteSites(codes.length), codes)).affectedRows;
    }

    async deleteLanguages(db: DbExecutor, codes: readonly string[]): Promise<number> {
        if (codes.length === 0) return 0;
        return (await db.execute(LanguageTestDataSQL.deleteLanguages(codes.length), [...codes, BASE_LANGUAGE_CODE]))
            .affectedRows;
    }

    async clearTextColumn(db: DbExecutor, column: string): Promise<void> {
        this.assertTextColumn(column);
        await db.execute(LanguageTestDataSQL.clearTextColumn(column), []);
    }

    private assertTextColumn(column: string): void {
        if (!APP_TRANSLATION_TEXT_COLUMN.test(column)) throw new Error(`Not a language column: ${column}`);
    }
}
