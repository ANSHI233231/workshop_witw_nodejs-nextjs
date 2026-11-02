'use client';

import { useRouter } from 'next/navigation';

import { ResetIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';
import type { RoleListItem } from '@/types/roles.types';
import {
    USER_LIST_LIMITS,
    UserStatus,
    type UserListFilters,
    type UserStatusCode,
} from '@/types/users.types';

import { USERS_PATH, usersUrl } from './users-url';

const STATUS_OPTIONS: readonly { readonly value: UserStatusCode; readonly label: string }[] = [
    { value: UserStatus.ACTIVE, label: 'Active' },
    { value: UserStatus.INACTIVE, label: 'Inactive' },
];

const toStatus = (value: string): UserStatusCode | undefined =>
    STATUS_OPTIONS.find((option) => String(option.value) === value)?.value;

const toRoleId = (value: string, roles: readonly RoleListItem[]): number | undefined =>
    roles.find((role) => String(role.id) === value)?.id;

export function UsersFilterBar({
    filters,
    roles,
}: {
    readonly filters: UserListFilters;
    readonly roles: readonly RoleListItem[];
}) {
    const t = useT();
    const router = useRouter();
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(usersUrl({ ...filters, search, page: 1 })),
    );

    return (
        <div className="filter-bar">
            <div className="input-group fw-md">
                <SearchIcon />
                <input
                    className="input"
                    placeholder={t('Search by name, mobile, email…')}
                    aria-label={t('Search')}
                    value={text}
                    maxLength={USER_LIST_LIMITS.SEARCH}
                    onChange={(event) => setText(event.target.value)}
                />
            </div>
            <select
                className="select fw-sm"
                aria-label={t('Role')}
                value={filters.metaRoleId ?? ''}
                onChange={(event) =>
                    router.push(
                        usersUrl({
                            ...filters,
                            search: text.trim(),
                            metaRoleId: toRoleId(event.target.value, roles),
                            page: 1,
                        }),
                    )
                }
            >
                <option value="">{t('Role: All')}</option>
                {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                        {role.name}
                    </option>
                ))}
            </select>
            <select
                className="select fw-sm"
                aria-label={t('Status')}
                value={filters.status ?? ''}
                onChange={(event) =>
                    router.push(
                        usersUrl({ ...filters, search: text.trim(), status: toStatus(event.target.value), page: 1 }),
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
                    router.push(USERS_PATH);
                }}
            >
                <ResetIcon />
                {t('Reset')}
            </button>
        </div>
    );
}
