import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { Paginated } from '@/types/api.types';
import {
    type Language,
    type LanguageFilters,
    type LanguageInput,
    type LanguageStatusCode,
    type NewLanguage,
    type LastPublish,
    type PublishResult,
    type AppTranslation,
    type AppTranslationExportRow,
    type AppTranslationFilters,
    type AppTranslationInput,
    type AppTranslationLanguage,
    type AppTranslationStatusCode,
    type AppTranslationUploadResult,
} from '@/types/language.types';

import { apiClient } from './api-client';

export const LANGUAGE_PAGE_SIZE = 20;

export const APP_TRANSLATION_PAGE_SIZE = 20;

const MASTER_PATH = '/language/master';

const TRANSLATIONS_PATH = '/language/translations';

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const listLanguages = (
    filters: LanguageFilters,
    accessToken: string | undefined,
): Promise<Paginated<Language>> =>
    apiClient.paginated<Language>(MASTER_PATH, {
        query: {
            search: filters.search || undefined,
            status: filters.status,
            page: filters.page,
            limit: LANGUAGE_PAGE_SIZE,
        },
        headers: cookieHeader(accessToken),
    });

export const createLanguage = (input: NewLanguage): Promise<Language> => apiClient.post<Language>(MASTER_PATH, input);

export const updateLanguage = (code: string, input: LanguageInput): Promise<Language> =>
    apiClient.patch<Language>(`${MASTER_PATH}/${code}`, input);

export const setLanguageStatus = (code: string, status: LanguageStatusCode): Promise<Language> =>
    apiClient.patch<Language>(`${MASTER_PATH}/${code}/status`, { status });

export const listAppTranslations = (
    filters: AppTranslationFilters,
    accessToken: string | undefined,
): Promise<Paginated<AppTranslation>> =>
    apiClient.paginated<AppTranslation>(TRANSLATIONS_PATH, {
        query: {
            search: filters.search || undefined,
            status: filters.status,
            missing: filters.missing,
            page: filters.page,
            limit: APP_TRANSLATION_PAGE_SIZE,
        },
        headers: cookieHeader(accessToken),
    });

export const listAppTranslationLanguages = (accessToken: string | undefined): Promise<AppTranslationLanguage[]> =>
    apiClient.get<AppTranslationLanguage[]>(`${TRANSLATIONS_PATH}/languages`, { headers: cookieHeader(accessToken) });

export const getLastPublish = (accessToken: string | undefined): Promise<LastPublish> =>
    apiClient.get<LastPublish>(`${TRANSLATIONS_PATH}/last-publish`, { headers: cookieHeader(accessToken) });

export const exportAppTranslations = (): Promise<AppTranslationExportRow[]> =>
    apiClient.get<AppTranslationExportRow[]>(`${TRANSLATIONS_PATH}/export`);

export const createAppTranslation = (input: AppTranslationInput): Promise<AppTranslation> =>
    apiClient.post<AppTranslation>(TRANSLATIONS_PATH, input);

export const updateAppTranslation = (id: number, input: AppTranslationInput): Promise<AppTranslation> =>
    apiClient.patch<AppTranslation>(`${TRANSLATIONS_PATH}/${id}`, input);

export const setAppTranslationStatus = (id: number, status: AppTranslationStatusCode): Promise<AppTranslation> =>
    apiClient.patch<AppTranslation>(`${TRANSLATIONS_PATH}/${id}/status`, { status });

export const uploadAppTranslations = (file: File): Promise<AppTranslationUploadResult> => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post<AppTranslationUploadResult>(`${TRANSLATIONS_PATH}/upload`, form);
};

export const publishAppTranslations = (): Promise<PublishResult> =>
    apiClient.post<PublishResult>(`${TRANSLATIONS_PATH}/publish`, {});
