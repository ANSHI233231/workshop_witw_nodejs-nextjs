import { rm } from 'node:fs/promises';
import path from 'node:path';

import { ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { ILanguageTestDataService } from '../contracts/language-test-data-service.contract';
import type { LanguageTestData, LanguageTestDataMarker } from '../dto/language-test-data.dto';
import type { LanguageTestDataRepository } from '../repositories/language-test-data.repository';
import { appTranslationColumnOf } from '../types/language.types';

import type { AppTranslationService } from './app-translation.service';
import { textFileOf } from './language-files';

export class LanguageTestDataService implements ILanguageTestDataService {
    constructor(
        private readonly db: Database,
        private readonly repository: LanguageTestDataRepository,
        private readonly auditService: IAuditService,
        private readonly appTranslationService: AppTranslationService,
        private readonly translationDirectories: Readonly<Record<string, string>>,
        private readonly existingTextColumns: () => Promise<string[]>,
        private readonly isProduction: boolean,
    ) {}

    async find(marker: LanguageTestDataMarker): Promise<LanguageTestData> {
        this.refuseInProduction();
        const languages = await this.repository.markedLanguages(this.db, marker.textPrefix);
        const languageCodes = languages.map((row) => row.code);
        const sites = await this.repository.sitesOf(this.db, languageCodes);
        const dataTranslations = await this.repository.dataTranslationsOf(this.db, languageCodes);
        const appTranslations = await this.repository.markedAppTranslations(this.db, marker.textPrefix);
        const existing = await this.existingTextColumns();
        const textColumns = languageCodes.map(appTranslationColumnOf).filter((column) => existing.includes(column));
        const columnRows = await Promise.all(
            textColumns.map(async (column, index) => ({
                id: index + 1,
                label: `${column} (${await this.repository.filledValues(this.db, column)} texts, emptied; the column stays)`,
            })),
        );
        return {
            languageCodes,
            appTranslationIds: appTranslations.map((row) => row.id),
            textColumns,
            tables: [
                {
                    table: 'master_language',
                    rows: languages.map((row, index) => ({
                        id: index + 1,
                        label: `${row.code} ${row.name} (status ${row.status})`,
                    })),
                },
                {
                    table: 'master_language_site',
                    rows: sites.map((row, index) => ({ id: index + 1, label: `${row.master_language_code} site ${row.site}` })),
                },
                {
                    table: 'data_translation',
                    rows: dataTranslations.map((row) => ({
                        id: row.id,
                        label: `${row.master_language_code} ${row.entity_table} ${row.entity_id} ${row.entity_column}`,
                    })),
                },
                { table: 'app_translation columns', rows: columnRows },
                {
                    table: 'app_translation',
                    rows: appTranslations.map((row) => ({ id: row.id, label: row.en_text })),
                },
            ],
        };
    }

    async remove(found: LanguageTestData): Promise<number> {
        this.refuseInProduction();
        if (found.languageCodes.length === 0 && found.appTranslationIds.length === 0) return 0;
        const event = { action: AuditAction.LANGUAGE_TEST_DATA_REMOVED, entityType: AuditEntity.LANGUAGE } as const;
        try {
            const removed = await this.db.transaction(async () => {
                const texts = await this.repository.deleteAppTranslations(this.db, found.appTranslationIds);
                await this.repository.deleteDataTranslations(this.db, found.languageCodes);
                await this.repository.deleteSites(this.db, found.languageCodes);
                const languages = await this.repository.deleteLanguages(this.db, found.languageCodes);
                for (const column of found.textColumns) await this.repository.clearTextColumn(this.db, column);
                await this.auditService.record({ ...event, details: { removed: found.tables } });
                return texts + languages;
            });
            await this.removePublishedFiles(found.languageCodes);
            if (Object.keys(this.translationDirectories).length > 0) await this.appTranslationService.publish();
            return removed;
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.LANGUAGE_TEST_DATA_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private async removePublishedFiles(codes: readonly string[]): Promise<void> {
        for (const directory of Object.values(this.translationDirectories)) {
            for (const code of codes) await rm(path.join(directory, textFileOf(code)), { force: true });
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Test data is never removed this way in production.', 'TEST_DATA_NOT_ALLOWED');
        }
    }
}
