'use client';

import { useCallback, useRef } from 'react';

import { type RemoteOption, type RemotePage, RemoteSelect } from '@/components/ui/remote-select';
import { useT } from '@/hooks/i18n/use-t';
import { searchUserPicker } from '@/services/users.service';
import type { UserPickerOption } from '@/types/users.types';

const detailsOf = (user: UserPickerOption): string[] =>
    [user.username ? `@${user.username}` : null, user.mobile, user.email].filter((value): value is string =>
        Boolean(value),
    );

const userOptionOf = (user: UserPickerOption): RemoteOption => ({
    id: user.id,
    label: user.name,
    context: null,
    details: detailsOf(user),
});

export function UserPickerField({
    id,
    user,
    error,
    onPick,
}: {
    readonly id: string;
    readonly user: UserPickerOption | null;
    readonly error: string | undefined;
    readonly onPick: (user: UserPickerOption | null) => void;
}) {
    const t = useT();
    const found = useRef(new Map<number, UserPickerOption>());
    const loadUsers = useCallback(async (search: string, page: number, signal: AbortSignal): Promise<RemotePage> => {
        const users = await searchUserPicker(search, page, signal);
        for (const item of users.items) found.current.set(item.id, item);
        return { options: users.items.map(userOptionOf), total: users.meta.total };
    }, []);

    return (
        <div className={`field${error ? ' is-invalid' : ''}`} id={id}>
            <span className="label">
                {t('User')}
                <span className="req" aria-hidden="true">
                    *
                </span>
            </span>
            <RemoteSelect
                ariaLabel={t('User')}
                allLabel={t('Select a user')}
                searchPlaceholder={t('Search by name, email, mobile or username…')}
                value={user ? userOptionOf(user) : undefined}
                invalid={Boolean(error)}
                loadPage={loadUsers}
                onChange={(option) => onPick(option ? (found.current.get(option.id) ?? null) : null)}
            />
            {error && <span className="error">{error}</span>}
        </div>
    );
}
