'use client';

import { useRouter } from 'next/navigation';

import { CloseIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';
import { type FlaggedFilters, SHARED_SAFARI_LIMITS } from '@/types/shared-safari.types';

import { FLAGGED_COMMENTS_PATH, flaggedListUrl } from './shared-safari-url';

export function FlaggedFilterBar({ filters }: { readonly filters: FlaggedFilters }) {
    const t = useT();
    const router = useRouter();
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(flaggedListUrl({ search, page: 1 })),
    );
    const filtered = text.trim() !== '' || filters.search !== '';

    return (
        <div className="filter-bar">
            <div className="input-group fw-md">
                <SearchIcon />
                <input
                    className="input"
                    placeholder={t('Search comment or safari')}
                    aria-label={t('Search comment or safari')}
                    maxLength={SHARED_SAFARI_LIMITS.SEARCH}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                />
            </div>
            {filtered && (
                <button
                    type="button"
                    className="btn btn-text ssc-clear"
                    onClick={() => {
                        clearText();
                        router.push(FLAGGED_COMMENTS_PATH);
                    }}
                >
                    <CloseIcon />
                    {t('Clear filters')}
                </button>
            )}
        </div>
    );
}
