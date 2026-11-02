'use client';

import { useRouter } from 'next/navigation';

import { ResetIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';
import { LANGUAGE_LIMITS, type LanguageFilters, LanguageStatus } from '@/types/language.types';

import { languageUrl } from './language-url';

const STATUS_OPTIONS = [
    { value: LanguageStatus.ACTIVE, label: 'Active' },
    { value: LanguageStatus.INACTIVE, label: 'Inactive' },
] as const;

export function LanguageFilterBar({ filters }: { readonly filters: LanguageFilters }) {
    const t = useT();
    const router = useRouter();
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(languageUrl({ ...filters, search, page: 1 })),
    );

    return (
        <div className="filter-bar">
            <div className="input-group fw-md">
                <SearchIcon />
                <input
                    className="input"
                    placeholder={t('Search by name or code…')}
                    aria-label={t('Search')}
                    value={text}
                    maxLength={LANGUAGE_LIMITS.SEARCH}
                    onChange={(event) => setText(event.target.value)}
                />
            </div>
            <select
                className="select fw-sm"
                aria-label={t('Status')}
                value={filters.status ?? ''}
                onChange={(event) =>
                    router.push(
                        languageUrl({
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
                    router.push(languageUrl({ search: '', status: undefined, page: 1 }));
                }}
            >
                <ResetIcon />
                {t('Reset')}
            </button>
        </div>
    );
}
