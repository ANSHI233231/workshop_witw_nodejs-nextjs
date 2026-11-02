import { ConflictException, NotFoundException, ValidationException } from '../../../core/exceptions';
import type { PaginationQuery } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import { AuditAction, type AuditActionCode, AuditEntity, type IAuditService } from '../../audit';
import type { IAppTranslationRepository } from '../contracts/app-translation-repository.contract';
import type { ILanguageRepository } from '../contracts/language-repository.contract';
import type { ILanguageService } from '../contracts/language-service.contract';
import type { LanguageDto, LanguageFilters, LanguageInput, LanguagePage, NewLanguage } from '../dto/language.dto';
import { toLanguage } from '../mappers/language.mapper';
import { writeLanguagesFiles } from './language-files';
import {
    appTranslationColumnOf,
    BASE_LANGUAGE_CODE,
    LANGUAGE_SITES,
    type LanguageSite,
    LanguageStatus,
    type LanguageStatusCode,
} from '../types/language.types';

const notFound = (): NotFoundException => new NotFoundException('This language was not found.', 'LANGUAGE_NOT_FOUND');

const codeTaken = (): ConflictException =>
    new ConflictException('This code is already in use.', 'LANGUAGE_CODE_TAKEN');

const nameTaken = (): ConflictException => new ConflictException('This name is already in use.', 'LANGUAGE_NAME_TAKEN');

const defaultRule = (message: string, field: string): ValidationException =>
    new ValidationException(message, [{ field, message }], 'LANGUAGE_DEFAULT_LOCKED');

const SITE_NAMES: Readonly<Record<LanguageSite, string>> = {
    manage: 'Manage',
    web: 'Web Portal',
    'web-website': 'Web Website',
};

const siteRule = (message: string, field: string): ValidationException =>
    new ValidationException(message, [{ field, message }], 'LANGUAGE_SITE_RULE');

const namesOf = (sites: readonly LanguageSite[]): string => sites.map((site) => SITE_NAMES[site]).join(', ');

const sameApps = (first: readonly LanguageSite[], second: readonly LanguageSite[]): boolean =>
    first.length === second.length && first.every((app) => second.includes(app));

type Places = {
    readonly shownIn: readonly LanguageSite[];
    readonly defaultFor: readonly LanguageSite[];
};

const placesOf = (code: string, input: Places): Places => {
    const shownIn = code === BASE_LANGUAGE_CODE ? [...LANGUAGE_SITES] : input.shownIn;
    const notShown = input.defaultFor.filter((site) => !shownIn.includes(site));
    if (notShown.length > 0) {
        throw siteRule(`Show this language in ${namesOf(notShown)} before making it the default there.`, 'defaultFor');
    }
    return { shownIn, defaultFor: input.defaultFor };
};

type Done = {
    readonly result: LanguageDto;
    readonly code: string;
    readonly changes: Readonly<Record<string, unknown>>;
};

const changesOf = (before: LanguageDto, after: LanguageInput): Record<string, unknown> => {
    const changes: Record<string, unknown> = {};
    for (const field of ['name', 'nativeName', 'shortName'] as const) {
        if (before[field] !== after[field]) changes[field] = { from: before[field], to: after[field] };
    }
    if (!sameApps(before.shownIn, after.shownIn)) {
        changes['shownIn'] = { from: before.shownIn, to: after.shownIn };
    }
    if (!sameApps(before.defaultFor, after.defaultFor)) {
        changes['defaultFor'] = { from: before.defaultFor, to: after.defaultFor };
    }
    return changes;
};

export class LanguageService implements ILanguageService {
    constructor(
        private readonly db: Database,
        private readonly repository: ILanguageRepository,
        private readonly appTranslationRepository: IAppTranslationRepository,
        private readonly auditService: IAuditService,
        private readonly translationDirectories: Readonly<Record<string, string>>,
    ) {}

    async list(filters: LanguageFilters, pagination: PaginationQuery): Promise<LanguagePage> {
        const [rows, total] = await Promise.all([
            this.repository.list(this.db, filters, pagination),
            this.repository.count(this.db, filters),
        ]);
        return { items: rows.map(toLanguage), total };
    }

    async options(): Promise<LanguageDto[]> {
        return (await this.repository.listActive(this.db)).map(toLanguage);
    }

    async create(language: NewLanguage, actorId: number): Promise<LanguageDto> {
        const created = await this.audited(
            AuditAction.LANGUAGE_CREATED,
            AuditAction.LANGUAGE_CREATE_FAILED,
            language.code,
            async () => {
                if (await this.repository.findByCode(this.db, language.code)) throw codeTaken();
                await this.refuseNameTaken(language.name, language.code);
                const placed = placesOf(language.code, language);
                await this.repository.insert(this.db, language, actorId);
                await this.writePlaces(language.code, placed, actorId);
                const row = await this.repository.findByCode(this.db, language.code);
                if (!row) throw notFound();
                return {
                    result: toLanguage(row),
                    code: language.code,
                    changes: {
                        name: { from: null, to: language.name },
                        code: { from: null, to: language.code },
                        shortName: { from: null, to: language.shortName },
                        shownIn: { from: [], to: placed.shownIn },
                        defaultFor: { from: [], to: language.defaultFor },
                    },
                };
            },
        );
        await this.ensureTextColumn(language.code);
        await this.publishLanguages();
        return created;
    }

    async update(code: string, input: LanguageInput, actorId: number): Promise<LanguageDto> {
        const updated = await this.audited(
            AuditAction.LANGUAGE_UPDATED,
            AuditAction.LANGUAGE_UPDATE_FAILED,
            code,
            async () => {
                const row = await this.repository.findByCode(this.db, code);
                if (!row) throw notFound();
                const before = toLanguage(row);
                const placed = placesOf(code, input);
                const dropped = before.defaultFor.filter((app) => !placed.defaultFor.includes(app));
                if (dropped.length > 0) {
                    throw defaultRule(
                        `Make another language the default for ${namesOf(dropped)} first.`,
                        placed.shownIn.some((site) => dropped.includes(site)) ? 'defaultFor' : 'shownIn',
                    );
                }
                if (before.status !== LanguageStatus.ACTIVE && input.defaultFor.length > 0) {
                    throw defaultRule('Switch this language on before making it a default.', 'defaultFor');
                }
                await this.refuseNameTaken(input.name, code);
                await this.repository.update(this.db, code, input, actorId);
                await this.writePlaces(code, placed, actorId);
                return {
                    result: { ...before, ...input, ...placed },
                    code,
                    changes: changesOf(before, { ...input, ...placed }),
                };
            },
        );
        await this.ensureTextColumn(code);
        await this.publishLanguages();
        return updated;
    }

    async setStatus(code: string, status: number, actorId: number): Promise<LanguageDto> {
        const changed = await this.audited(
            AuditAction.LANGUAGE_STATUS_CHANGED,
            AuditAction.LANGUAGE_STATUS_CHANGE_FAILED,
            code,
            async () => {
                const row = await this.repository.findByCode(this.db, code);
                if (!row) throw notFound();
                const before = toLanguage(row);
                const switchingOff = status !== LanguageStatus.ACTIVE;
                if (switchingOff && code === BASE_LANGUAGE_CODE) {
                    throw new ValidationException(
                        'English is the base language and can’t be switched off.',
                        [{ field: 'status', message: 'English is the base language and can’t be switched off.' }],
                        'LANGUAGE_BASE_LOCKED',
                    );
                }
                await this.repository.updateStatus(this.db, code, status, actorId);
                const movedToBase = switchingOff ? before.defaultFor : [];
                for (const site of movedToBase) {
                    await this.repository.makeDefault(this.db, site, BASE_LANGUAGE_CODE, actorId);
                    await this.repository.clearDefaultExcept(this.db, site, BASE_LANGUAGE_CODE, actorId);
                }
                return {
                    result: {
                        ...before,
                        status: status as LanguageStatusCode,
                        defaultFor: switchingOff ? [] : before.defaultFor,
                    },
                    code,
                    changes: {
                        status: { from: before.status, to: status },
                        ...(movedToBase.length > 0
                            ? { defaultFor: { from: before.defaultFor, to: [], movedTo: BASE_LANGUAGE_CODE } }
                            : {}),
                    },
                };
            },
        );
        if (status === LanguageStatus.ACTIVE) await this.ensureTextColumn(code);
        await this.publishLanguages();
        return changed;
    }

    private async publishLanguages(): Promise<void> {
        if (Object.keys(this.translationDirectories).length === 0) return;
        try {
            const active = (await this.repository.listActive(this.db)).map(toLanguage);
            const apps = await writeLanguagesFiles(this.translationDirectories, active);
            await this.auditService.record({
                action: AuditAction.LANGUAGES_FILE_WRITTEN,
                entityType: AuditEntity.LANGUAGE,
                details: { apps },
            });
        } catch (error) {
            await this.auditService.recordFailure(
                { action: AuditAction.LANGUAGES_FILE_WRITE_FAILED, entityType: AuditEntity.LANGUAGE },
                error,
            );
            throw error;
        }
    }

    private async ensureTextColumn(code: string): Promise<void> {
        if (code === BASE_LANGUAGE_CODE) return;
        const column = appTranslationColumnOf(code);
        if ((await this.appTranslationRepository.textColumns(this.db)).includes(column)) return;
        try {
            await this.appTranslationRepository.addTextColumn(this.db, code);
            await this.auditService.record({
                action: AuditAction.TRANSLATION_COLUMN_ADDED,
                entityType: AuditEntity.LANGUAGE,
                details: { code, column },
            });
        } catch (error) {
            await this.auditService.recordFailure(
                {
                    action: AuditAction.TRANSLATION_COLUMN_ADD_FAILED,
                    entityType: AuditEntity.LANGUAGE,
                    details: { code, column },
                },
                error,
            );
            throw error;
        }
    }

    private async writePlaces(code: string, placed: Places, actorId: number): Promise<void> {
        await this.repository.writeSites(this.db, code, placed.shownIn, placed.defaultFor, actorId);
        for (const site of placed.defaultFor) await this.repository.clearDefaultExcept(this.db, site, code, actorId);
    }

    private async refuseNameTaken(name: string, exceptCode: string): Promise<void> {
        if (await this.repository.findOtherByName(this.db, name, exceptCode)) throw nameTaken();
    }

    private async audited(
        action: AuditActionCode,
        failure: AuditActionCode,
        code: string,
        work: () => Promise<Done>,
    ): Promise<LanguageDto> {
        try {
            return await this.db.transaction(async () => {
                const done = await work();
                await this.auditService.record({
                    action,
                    entityType: AuditEntity.LANGUAGE,
                    changes: done.changes,
                    details: { code: done.code },
                });
                return done.result;
            });
        } catch (error) {
            await this.auditService.recordFailure(
                { action: failure, entityType: AuditEntity.LANGUAGE, details: { code } },
                error,
            );
            throw error;
        }
    }
}
