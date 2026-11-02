'use client';

import { useRouter } from 'next/navigation';

import { ResetIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';
import { ROLE_LIST_LIMITS, type RoleListFilters } from '@/types/roles.types';

import { rolesUrl } from './roles-url';

export function RolesFilterBar({ filters }: { readonly filters: RoleListFilters }) {
    const t = useT();
    const router = useRouter();
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(rolesUrl({ ...filters, search, page: 1 })),
    );

    return (
        <div className="filter-bar">
            <div className="input-group fw-md">
                <SearchIcon />
                <input
                    className="input"
                    placeholder={t('Search by name…')}
                    aria-label={t('Search')}
                    value={text}
                    maxLength={ROLE_LIST_LIMITS.SEARCH}
                    onChange={(event) => setText(event.target.value)}
                />
            </div>
            <button
                type="button"
                className="btn btn-text"
                onClick={() => {
                    clearText();
                    router.push(rolesUrl({ search: '', page: 1 }));
                }}
            >
                <ResetIcon />
                {t('Reset')}
            </button>
        </div>
    );
}
