'use client';

import { useRouter } from 'next/navigation';

import { CloseIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';
import { PARTNER_LIMITS, type PartnerFilters, type PartnerStatusCode } from '@/types/partner.types';

import { PARTNER_STATUS_BADGE } from './partner-format';
import { partnerListUrl } from './partner-url';

export function PartnerFilterBar({
    path,
    filters,
    statuses,
}: {
    readonly path: string;
    readonly filters: PartnerFilters;
    readonly statuses: readonly PartnerStatusCode[];
}) {
    const t = useT();
    const router = useRouter();
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(partnerListUrl(path, { ...filters, search, page: 1 })),
    );
    const filtered = text.trim() !== '' || filters.search !== '' || filters.status !== undefined;

    return (
        <div className="filter-bar">
            <div className="ssc-tools" style={{ flexWrap: 'wrap' }}>
                <div className="input-group fw-md">
                    <SearchIcon />
                    <input
                        className="input"
                        placeholder={t('Business or owner')}
                        aria-label={t('Search')}
                        maxLength={PARTNER_LIMITS.SEARCH}
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
                            partnerListUrl(path, {
                                ...filters,
                                search: text.trim(),
                                status: statuses.find((code) => String(code) === event.target.value),
                                page: 1,
                            }),
                        )
                    }
                >
                    <option value="">{t('Status: All')}</option>
                    {statuses.map((code) => (
                        <option key={code} value={code}>
                            {t(PARTNER_STATUS_BADGE[code].label)}
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
                        router.push(path);
                    }}
                >
                    <CloseIcon />
                    {t('Clear filters')}
                </button>
            )}
        </div>
    );
}
