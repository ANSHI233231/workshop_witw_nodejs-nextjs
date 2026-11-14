'use client';

import { useRouter } from 'next/navigation';

import { CloseIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';
import {
    QUOTE_REQUEST_LIMITS,
    QUOTE_REQUEST_STATUSES,
    type QuoteRequestFilters,
} from '@/types/quote-request.types';

import { QUOTE_STATUS_BADGE } from './quote-request-format';
import { QUOTE_REQUESTS_PATH, quoteRequestListUrl } from './quote-request-url';

export function QuoteRequestFilterBar({ filters }: { readonly filters: QuoteRequestFilters }) {
    const t = useT();
    const router = useRouter();
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(quoteRequestListUrl({ ...filters, search, page: 1 })),
    );
    const filtered = text.trim() !== '' || filters.search !== '' || filters.status !== undefined;

    return (
        <div className="filter-bar">
            <div className="ssc-tools" style={{ flexWrap: 'wrap' }}>
                <div className="input-group fw-md">
                    <SearchIcon />
                    <input
                        className="input"
                        placeholder={t('User, package or partner')}
                        aria-label={t('Search')}
                        maxLength={QUOTE_REQUEST_LIMITS.SEARCH}
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
                            quoteRequestListUrl({
                                ...filters,
                                search: text.trim(),
                                status: QUOTE_REQUEST_STATUSES.find((code) => String(code) === event.target.value),
                                page: 1,
                            }),
                        )
                    }
                >
                    <option value="">{t('Status: All')}</option>
                    {QUOTE_REQUEST_STATUSES.map((code) => (
                        <option key={code} value={code}>
                            {t(QUOTE_STATUS_BADGE[code].label)}
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
                        router.push(QUOTE_REQUESTS_PATH);
                    }}
                >
                    <CloseIcon />
                    {t('Clear filters')}
                </button>
            )}
        </div>
    );
}
