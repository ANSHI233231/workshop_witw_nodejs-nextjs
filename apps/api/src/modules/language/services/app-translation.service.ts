import { rm } from 'node:fs/promises';
import path from 'node:path';

import { ConflictException, NotFoundException, ValidationException } from '../../../core/exceptions';
import type { PaginationQuery } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import { AuditAction, type AuditActionCode, AuditEntity, type IAuditService } from '../../audit';
import type { IAppTranslationRepository } from '../contracts/app-translation-repository.contract';
import type { IAppTranslationService } from '../contracts/app-translation-service.contract';
import type { ILanguageRepository } from '../contracts/language-repository.contract';
import type {
    AppTranslationDto,
    AppTranslationExportRow,
    AppTranslationFilters,
    AppTranslationInput,
    AppTranslationLanguageDto,
    AppTranslationPage,
    AppTranslationUploadRefusal,
    AppTranslationUploadResult,
    LanguageDto,
    LastPublishDto,
    PublishResult,
    TranslatedTexts,
} from '../dto/language.dto';
import { appTranslationTextOf, appTranslationTextsOf, toAppTranslation, toLanguage } from '../mappers/language.mapper';
import {
    APP_TRANSLATION_CSV_HEADERS,
    APP_TRANSLATION_LIMITS,
    APP_TRANSLATION_TEXT_COLUMN,
    APP_TRANSLATION_UPLOAD_LIMITS,
    type AppTranslationLanguage,
    type AppTranslationRow,
    type AppTranslationStatusCode,
    appTranslationColumnOf,
    appTranslationKeyOf,
    BASE_LANGUAGE_CODE,
    LANGUAGE_SITES,
    WEBSITE_OF_APP,
} from '../types/language.types';
import { parseCsv } from './app-translation-csv';
import { jsonOf, lastTextPublish, textFileOf, writeAtomically, writeLanguagesFiles } from './language-files';

const NEW_RECORD_ID = 0;

const notFound = (): NotFoundException =>
    new NotFoundException('This translation was not found.', 'TRANSLATION_NOT_FOUND');

const englishTaken = (): ConflictException =>
    new ConflictException('This text is already in use.', 'TRANSLATION_ENGLISH_TAKEN');

const fileProblem = (message: string, code: string): ValidationException =>
    new ValidationException(message, [{ field: 'file', message }], code);

type Done = {
    readonly result: AppTranslationDto;
    readonly entityId: number;
    readonly changes: Readonly<Record<string, unknown>>;
};

type TextChange = { readonly id: number; readonly texts: TranslatedTexts };

type UploadPlan = {
    readonly additions: AppTranslationInput[];
    readonly updates: TextChange[];
    readonly unchanged: number;
    readonly refused: AppTranslationUploadRefusal[];
};

type UploadRow = { readonly cells: readonly string[]; readonly row: number };

const headerOf = (language: AppTranslationLanguage): string =>
    `${language.name}${APP_TRANSLATION_CSV_HEADERS.LANGUAGE_SUFFIX}`;

const isHeaderRow = (cells: readonly string[]): boolean =>
    cells[0]?.trim().toLowerCase() === APP_TRANSLATION_CSV_HEADERS.ENGLISH.toLowerCase();

const tooLong = (label: string): string => `${label} can be at most ${APP_TRANSLATION_LIMITS.TEXT_MAX} characters.`;

const rowProblem = (
    english: string,
    texts: TranslatedTexts,
    languages: readonly AppTranslationLanguage[],
): string | undefined => {
    if (!english) return `${APP_TRANSLATION_CSV_HEADERS.ENGLISH} is empty.`;
    if (english.length > APP_TRANSLATION_LIMITS.TEXT_MAX) return tooLong(APP_TRANSLATION_CSV_HEADERS.ENGLISH);
    const long = languages.find((language) => (texts[language.code] ?? '').length > APP_TRANSLATION_LIMITS.TEXT_MAX);
    return long ? tooLong(headerOf(long)) : undefined;
};

const changedTexts = (incoming: TranslatedTexts, current: TranslatedTexts): TranslatedTexts =>
    Object.fromEntries(
        Object.entries(incoming).filter(([code, text]) => text !== '' && text !== (current[code] ?? '')),
    );

const textChanges = (before: TranslatedTexts, after: TranslatedTexts): Record<string, unknown> =>
    Object.fromEntries(
        Object.keys(after)
            .filter((code) => (before[code] ?? '') !== after[code])
            .map((code) => [`texts.${code}`, { from: before[code] ?? null, to: after[code] }]),
    );

const textLanguagesOf = (columns: readonly string[], languages: readonly LanguageDto[]): AppTranslationLanguage[] =>
    languages
        .filter((language) => language.code !== BASE_LANGUAGE_CODE)
        .map((language) => ({
            code: language.code,
            name: language.name,
            nativeName: language.nativeName,
            shortName: language.shortName,
            column: appTranslationColumnOf(language.code),
        }))
        .filter((language) => columns.includes(language.column));

export class AppTranslationService implements IAppTranslationService {
    constructor(
        private readonly db: Database,
        private readonly repository: IAppTranslationRepository,
        private readonly languageRepository: ILanguageRepository,
        private readonly auditService: IAuditService,
        private readonly translationDirectories: Readonly<Record<string, string>>,
    ) {}

    async languages(): Promise<AppTranslationLanguageDto[]> {
        return (await this.textLanguages()).map(({ code, name, nativeName, shortName }) => ({
            code,
            name,
            nativeName,
            shortName,
        }));
    }

    async list(filters: AppTranslationFilters, pagination: PaginationQuery): Promise<AppTranslationPage> {
        const languages = await this.textLanguages();
        const [rows, total] = await Promise.all([
            this.repository.list(this.db, filters, pagination, languages),
            this.repository.count(this.db, filters, languages),
        ]);
        return { items: rows.map((row) => toAppTranslation(row, languages)), total };
    }

    async lastPublish(): Promise<LastPublishDto> {
        return { publishedAt: await lastTextPublish(this.translationDirectories) };
    }

    async exportRows(): Promise<AppTranslationExportRow[]> {
        const languages = await this.textLanguages();
        return (await this.repository.listActive(this.db, languages)).map((row) => ({
            enText: row.en_text,
            texts: appTranslationTextsOf(row, languages),
        }));
    }

    async create(input: AppTranslationInput, actorId: number): Promise<AppTranslationDto> {
        return this.audited(
            AuditAction.TRANSLATION_CREATED,
            AuditAction.TRANSLATION_CREATE_FAILED,
            undefined,
            async () => {
                const languages = await this.textLanguages();
                this.refuseUnknownLanguages(input.texts, languages);
                if (await this.repository.findOtherByEnglish(this.db, input.enText, NEW_RECORD_ID, languages)) {
                    throw englishTaken();
                }
                const id = await this.repository.insert(this.db, input.enText, input.texts, languages, actorId);
                const row = await this.repository.findById(this.db, id, languages);
                if (!row) throw notFound();
                const result = toAppTranslation(row, languages);
                return {
                    result,
                    entityId: id,
                    changes: { enText: { from: null, to: input.enText }, ...textChanges({}, result.texts) },
                };
            },
        );
    }

    async update(id: number, input: AppTranslationInput, actorId: number): Promise<AppTranslationDto> {
        return this.audited(AuditAction.TRANSLATION_UPDATED, AuditAction.TRANSLATION_UPDATE_FAILED, id, async () => {
            const languages = await this.textLanguages();
            this.refuseUnknownLanguages(input.texts, languages);
            const before = await this.repository.findById(this.db, id, languages);
            if (!before) throw notFound();
            if (await this.repository.findOtherByEnglish(this.db, input.enText, id, languages)) throw englishTaken();
            const beforeTexts = appTranslationTextsOf(before, languages);
            const texts = { ...beforeTexts, ...input.texts };
            await this.repository.update(this.db, id, input.enText, texts, languages, actorId);
            const after = await this.repository.findById(this.db, id, languages);
            if (!after) throw notFound();
            const changes: Record<string, unknown> = textChanges(beforeTexts, texts);
            if (before.en_text !== input.enText) changes['enText'] = { from: before.en_text, to: input.enText };
            return { result: toAppTranslation(after, languages), entityId: id, changes };
        });
    }

    async setStatus(id: number, status: number, actorId: number): Promise<AppTranslationDto> {
        return this.audited(
            AuditAction.TRANSLATION_STATUS_CHANGED,
            AuditAction.TRANSLATION_STATUS_CHANGE_FAILED,
            id,
            async () => {
                const languages = await this.textLanguages();
                const before = await this.repository.findById(this.db, id, languages);
                if (!before) throw notFound();
                await this.repository.updateStatus(this.db, id, status, actorId);
                return {
                    result: { ...toAppTranslation(before, languages), status: status as AppTranslationStatusCode },
                    entityId: id,
                    changes: { status: { from: before.status, to: status } },
                };
            },
        );
    }

    async upload(content: Buffer, actorId: number): Promise<AppTranslationUploadResult> {
        const languages = await this.textLanguages();
        const rows = parseCsv(content);
        const header = rows[0] && isHeaderRow(rows[0]) ? rows[0] : undefined;
        const columnLanguages = header ? this.languagesOfHeader(header, languages) : languages;
        const dataRows = rows
            .map((cells, index) => ({ cells, row: index + 1 }))
            .filter(({ row }) => !(row === 1 && header))
            .filter(({ cells }) => cells.some((cell) => cell.trim() !== ''));
        if (dataRows.length === 0) throw fileProblem('The file has no translations.', 'TRANSLATION_FILE_EMPTY');
        if (dataRows.length > APP_TRANSLATION_UPLOAD_LIMITS.MAX_ROWS) {
            throw fileProblem(
                `The file can have at most ${APP_TRANSLATION_UPLOAD_LIMITS.MAX_ROWS} rows.`,
                'TRANSLATION_FILE_TOO_LONG',
            );
        }
        try {
            return await this.db.transaction(async () => {
                const existing = await this.repository.listAll(this.db, languages);
                const plan = this.planUpload(dataRows, columnLanguages, existing, languages);
                for (const update of plan.updates) await this.writeTexts(update, languages, actorId);
                let added = 0;
                let updated = plan.updates.length;
                let unchanged = plan.unchanged;
                for (const addition of plan.additions) {
                    const same = await this.repository.findOtherByEnglish(
                        this.db,
                        addition.enText,
                        NEW_RECORD_ID,
                        languages,
                    );
                    if (!same) {
                        await this.repository.insert(this.db, addition.enText, addition.texts, languages, actorId);
                        added += 1;
                        continue;
                    }
                    const texts = changedTexts(addition.texts, appTranslationTextsOf(same, languages));
                    if (Object.keys(texts).length === 0) unchanged += 1;
                    else {
                        await this.writeTexts({ id: same.id, texts }, languages, actorId);
                        updated += 1;
                    }
                }
                const result = { added, updated, unchanged, refused: plan.refused };
                await this.auditService.record({
                    action: AuditAction.TRANSLATIONS_UPLOADED,
                    entityType: AuditEntity.LANGUAGE_TRANSLATION,
                    details: {
                        ...result,
                        refused: plan.refused.length,
                        languages: columnLanguages.map((language) => language.code),
                    },
                });
                return result;
            });
        } catch (error) {
            await this.auditService.recordFailure(
                { action: AuditAction.TRANSLATIONS_UPLOAD_FAILED, entityType: AuditEntity.LANGUAGE_TRANSLATION },
                error,
            );
            throw error;
        }
    }

    async publish(): Promise<PublishResult> {
        const apps = Object.entries(this.translationDirectories);
        try {
            if (apps.length === 0) {
                throw new ValidationException(
                    'No app folder is set for translations (TRANSLATION_DIRS in the API’s .env).',
                    [],
                    'TRANSLATION_PUBLISH_NOT_CONFIGURED',
                );
            }
            const [columns, activeRows] = await Promise.all([
                this.repository.textColumns(this.db),
                this.languageRepository.listActive(this.db),
            ]);
            const active = activeRows.map(toLanguage);
            const textLanguages = textLanguagesOf(columns, active);
            const rows = await this.repository.listActive(this.db, textLanguages);
            const dictionaryOf = (language: AppTranslationLanguage): Record<string, string> =>
                Object.fromEntries(
                    rows
                        .map((row): [string, string] => [
                            appTranslationKeyOf(row.en_text),
                            appTranslationTextOf(row, language),
                        ])
                        .filter(([, text]) => text !== ''),
                );
            const dictionaries = new Map<string, Record<string, string>>(
                textLanguages.map((language) => [language.code, dictionaryOf(language)]),
            );
            const publishedCodes = textLanguages.map((language) => language.code);
            const fileCodes = columns.flatMap((column) => APP_TRANSLATION_TEXT_COLUMN.exec(column)?.[1] ?? []);
            for (const [app, directory] of apps) {
                const portal = LANGUAGE_SITES.find((site) => site === app);
                const website = WEBSITE_OF_APP[app];
                const appCodes = active
                    .filter(
                        (language) =>
                            (portal !== undefined && language.shownIn.includes(portal)) ||
                            (website !== undefined && language.shownIn.includes(website)),
                    )
                    .map((language) => language.code);
                for (const code of fileCodes) {
                    const filePath = path.join(directory, textFileOf(code));
                    const dictionary = dictionaries.get(code);
                    if (dictionary && appCodes.includes(code)) await writeAtomically(filePath, jsonOf(dictionary));
                    else await rm(filePath, { force: true });
                }
            }
            await writeLanguagesFiles(this.translationDirectories, active);
            const entries = Object.fromEntries(
                [...dictionaries].map(([code, dictionary]) => [code, Object.keys(dictionary).length]),
            );
            await this.auditService.record({
                action: AuditAction.TRANSLATIONS_PUBLISHED,
                entityType: AuditEntity.LANGUAGE_TRANSLATION,
                details: { entries, apps: apps.map(([app]) => app), languages: publishedCodes },
            });
            return {
                publishedAt: new Date().toISOString(),
                entries: Math.max(0, ...Object.values(entries)),
                files: apps.map(([app]) => app),
            };
        } catch (error) {
            await this.auditService.recordFailure(
                { action: AuditAction.TRANSLATIONS_PUBLISH_FAILED, entityType: AuditEntity.LANGUAGE_TRANSLATION },
                error,
            );
            throw error;
        }
    }

    private async textLanguages(): Promise<AppTranslationLanguage[]> {
        const [columns, active] = await Promise.all([
            this.repository.textColumns(this.db),
            this.languageRepository.listActive(this.db),
        ]);
        return textLanguagesOf(columns, active.map(toLanguage));
    }

    private refuseUnknownLanguages(texts: TranslatedTexts, languages: readonly AppTranslationLanguage[]): void {
        const unknown = Object.keys(texts).filter((code) => !languages.some((language) => language.code === code));
        if (unknown.length === 0) return;
        const message = 'This language has no translation column, or is switched off.';
        throw new ValidationException(
            message,
            unknown.map((code) => ({ field: `texts.${code}`, message })),
            'TRANSLATION_LANGUAGE_UNKNOWN',
        );
    }

    private languagesOfHeader(
        header: readonly string[],
        languages: readonly AppTranslationLanguage[],
    ): AppTranslationLanguage[] {
        return header.slice(1).map((cell) => {
            const title = cell.trim().toLowerCase();
            const language = languages.find(
                (candidate) => headerOf(candidate).toLowerCase() === title || candidate.code === title,
            );
            if (!language) {
                throw fileProblem(
                    `The column "${cell.trim()}" is not a language with translations.`,
                    'TRANSLATION_FILE_UNKNOWN_COLUMN',
                );
            }
            return language;
        });
    }

    private async writeTexts(
        change: TextChange,
        languages: readonly AppTranslationLanguage[],
        actorId: number,
    ): Promise<void> {
        const changed = languages.filter((language) => change.texts[language.code] !== undefined);
        await this.repository.updateTexts(this.db, change.id, change.texts, changed, actorId);
    }

    private planUpload(
        dataRows: readonly UploadRow[],
        columnLanguages: readonly AppTranslationLanguage[],
        existing: readonly AppTranslationRow[],
        languages: readonly AppTranslationLanguage[],
    ): UploadPlan {
        const byKey = new Map(
            existing.map((row) => [
                appTranslationKeyOf(row.en_text),
                { id: row.id, texts: appTranslationTextsOf(row, languages) },
            ]),
        );
        const firstRowOf = new Map<string, number>();
        const plan: UploadPlan = { additions: [], updates: [], unchanged: 0, refused: [] };
        let unchanged = 0;
        for (const { cells, row } of dataRows) {
            const english = (cells[0] ?? '').trim();
            const texts: TranslatedTexts = Object.fromEntries(
                columnLanguages.map((language, index) => [language.code, (cells[index + 1] ?? '').trim()]),
            );
            const problem = rowProblem(english, texts, columnLanguages);
            if (problem) {
                plan.refused.push({ row, message: problem });
                continue;
            }
            const key = appTranslationKeyOf(english);
            const earlier = firstRowOf.get(key);
            if (earlier !== undefined) {
                plan.refused.push({ row, message: `This English text is already in row ${earlier}.` });
                continue;
            }
            firstRowOf.set(key, row);
            const current = byKey.get(key);
            if (!current) {
                plan.additions.push({ enText: english, texts });
                continue;
            }
            const changed = changedTexts(texts, current.texts);
            if (Object.keys(changed).length === 0) unchanged += 1;
            else plan.updates.push({ id: current.id, texts: changed });
        }
        return { ...plan, unchanged };
    }

    private async audited(
        action: AuditActionCode,
        failure: AuditActionCode,
        entityId: number | undefined,
        work: () => Promise<Done>,
    ): Promise<AppTranslationDto> {
        try {
            return await this.db.transaction(async () => {
                const done = await work();
                await this.auditService.record({
                    action,
                    entityType: AuditEntity.LANGUAGE_TRANSLATION,
                    entityId: done.entityId,
                    changes: done.changes,
                });
                return done.result;
            });
        } catch (error) {
            await this.auditService.recordFailure(
                { action: failure, entityType: AuditEntity.LANGUAGE_TRANSLATION, entityId },
                error,
            );
            throw error;
        }
    }
}
