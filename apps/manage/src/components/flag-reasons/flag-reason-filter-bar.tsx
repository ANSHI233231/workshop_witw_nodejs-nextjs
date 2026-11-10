'use client';

import { useRouter } from 'next/navigation';

import { CloseIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';
import { FLAG_REASON_LIMITS, type FlagReasonFilters, FlagReasonStatus } from '@/types/flag-reason.types';

import { FLAG_REASONS_PATH, flagReasonUrl } from './flag-reason-url';

const STATUS_OPTIONS = [
    { value: FlagReasonStatus.ACTIVE, label: 'Active' },
    { value: FlagReasonStatus.INACTIVE, label: 'Inactive' },
] as const;

export function FlagReasonFilterBar({ filters }: { readonly filters: FlagReasonFilters }) {
    const t = useT();
    const router = useRouter();
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(flagReasonUrl({ ...filters, search })),
    );
    const filtered = text.trim() !== '' || filters.search !== '' || filters.status !== undefined;

    return (
        <div className="filter-bar">
            <div className="ssc-tools">
                <div className="input-group fw-md">
                    <SearchIcon />
                    <input
                        className="input"
                        placeholder={t('Reason')}
                        aria-label={t('Search by reason')}
                        maxLength={FLAG_REASON_LIMITS.SEARCH}
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                    />
                </div>
                <select
                    className="select fw-sm"
                    aria-label={t('Status')}
                    value={filters.status ?? ''}
                    onChange={(event) =>
                        router.push(
                            flagReasonUrl({
                                search: text.trim(),
                                status: STATUS_OPTIONS.find((option) => String(option.value) === event.target.value)
                                    ?.value,
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
            </div>
            {filtered && (
                <button
                    type="button"
                    className="btn btn-text ssc-clear"
                    onClick={() => {
                        clearText();
                        router.push(FLAG_REASONS_PATH);
                    }}
                >
                    <CloseIcon />
                    {t('Clear filters')}
                </button>
            )}
        </div>
    );
}
