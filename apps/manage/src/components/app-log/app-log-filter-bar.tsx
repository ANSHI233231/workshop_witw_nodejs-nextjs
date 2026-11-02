'use client';

import { useRouter } from 'next/navigation';

import { DateRangeFilter } from '@/components/ui/date-range-filter';
import { ResetIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';
import { APP_LOG_LIMITS, type AppLogFilters } from '@/types/app-log.types';

import {
    appLogUrl,
    ERROR_LOGS_PATH,
    LEVEL_MARKS,
    LEVEL_OPTIONS,
    SOURCE_LABELS,
    SOURCE_OPTIONS,
} from './app-log-labels';

export function AppLogFilterBar({ filters }: { readonly filters: AppLogFilters }) {
    const t = useT();
    const router = useRouter();
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(appLogUrl({ ...filters, search, page: 1 })),
    );
    const goTo = (changes: Partial<AppLogFilters>) =>
        router.push(appLogUrl({ ...filters, search: text.trim(), ...changes, page: 1 }));

    return (
        <div className="filter-bar el-fb">
            <div className="input-group fw-md">
                <SearchIcon />
                <input
                    className="input"
                    placeholder={t('Search by message, category, request ID')}
                    aria-label={t('Search')}
                    value={text}
                    maxLength={APP_LOG_LIMITS.SEARCH}
                    onChange={(event) => setText(event.target.value)}
                />
            </div>
            <select
                className="select fw-sm"
                aria-label={t('App')}
                value={filters.app ?? ''}
                onChange={(event) => goTo({ app: SOURCE_OPTIONS.find((app) => String(app) === event.target.value) })}
            >
                <option value="">{t('App: All')}</option>
                {SOURCE_OPTIONS.map((app) => (
                    <option key={app} value={app}>
                        {t(SOURCE_LABELS[app])}
                    </option>
                ))}
            </select>
            <select
                className="select fw-sm"
                aria-label={t('Level')}
                value={filters.level ?? ''}
                onChange={(event) =>
                    goTo({ level: LEVEL_OPTIONS.find((level) => String(level) === event.target.value) })
                }
            >
                <option value="">{t('Level: All')}</option>
                {LEVEL_OPTIONS.map((level) => (
                    <option key={level} value={level}>
                        {t(LEVEL_MARKS[level].label)}
                    </option>
                ))}
            </select>
            <DateRangeFilter
                range={{ from: filters.from, to: filters.to }}
                onChange={(range) => goTo({ from: range.from, to: range.to })}
            />
            <button
                type="button"
                className="btn btn-text"
                onClick={() => {
                    clearText();
                    router.push(ERROR_LOGS_PATH);
                }}
            >
                <ResetIcon />
                {t('Reset')}
            </button>
        </div>
    );
}
