import type { PaginationQuery } from '../../../core/validation';
import type { LanguageDto, LanguageFilters, LanguageInput, LanguagePage, NewLanguage } from '../dto/language.dto';

export interface ILanguageService {
    list(filters: LanguageFilters, pagination: PaginationQuery): Promise<LanguagePage>;
    options(): Promise<LanguageDto[]>;
    create(language: NewLanguage, actorId: number): Promise<LanguageDto>;
    update(code: string, input: LanguageInput, actorId: number): Promise<LanguageDto>;
    setStatus(code: string, status: number, actorId: number): Promise<LanguageDto>;
}
