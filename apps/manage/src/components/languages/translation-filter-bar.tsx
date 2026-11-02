'use client';

import { useRouter } from 'next/navigation';

import { ResetIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';
import {
    APP_TRANSLATION_LIMITS,
    type AppTranslationFilters,
    type AppTranslationLanguage,
    AppTranslationStatus,
} from '@/types/language.types';

import { translationUrl } from './language-url';

const STATUS_OPTIONS = [
    { value: AppTranslationStatus.ACTIVE, label: 'Active' },
    { value: AppTranslationStatus.INACTIVE, label: 'Inactive' },
] as const;

export function TranslationFilterBar({
    filters,
    languages,
}: {
    readonly filters: AppTranslationFilters;
    readonly languages: readonly AppTranslationLanguage[];
}) {
    const t = useT();
    const router = useRouter();
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(translationUrl({ ...filters, search, page: 1 })),
    );

    return (
        <div className="filter-bar">
            <div className="input-group fw-md">
                <SearchIcon />
                <input
                    className="input"
                    placeholder={t('Search any language…')}
                    aria-label={t('Search')}
                    value={text}
                    maxLength={APP_TRANSLATION_LIMITS.SEARCH}
                    onChange={(event) => setText(event.target.value)}
                />
            </div>
            <select
                className="select fw-sm"
                aria-label={t('Missing translation')}
                value={filters.missing ?? ''}
                onChange={(event) =>
                    router.push(
                        translationUrl({
                            ...filters,
                            search: text.trim(),
                            missing: event.target.value || undefined,
                            page: 1,
                        }),
                    )
                }
            >
                <option value="">{t('Missing: All')}</option>
                {languages.map((language) => (
                    <option key={language.code} value={language.code}>
                        {t('{language} missing', { language: language.name })}
                    </option>
                ))}
            </select>
            <select
                className="select fw-sm"
                aria-label={t('Status')}
                value={filters.status ?? ''}
                onChange={(event) =>
                    router.push(
                        translationUrl({
                            ...filters,
                            search: text.trim(),
                            status: STATUS_OPTIONS.find((option) => String(option.value) === event.target.value)?.value,
                            page: 1,
                        }),
                    )
                }
            >
                <option value="">{t('Status: All')}</option>
                {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {t(option.label)}
                    </option>
                ))}
            </select>
            <button
                type="button"
                className="btn btn-text"
                onClick={() => {
                    clearText();
                    router.push(translationUrl({ search: '', status: undefined, missing: undefined, page: 1 }));
                }}
            >
                <ResetIcon />
                {t('Reset')}
            </button>
        </div>
    );
}
