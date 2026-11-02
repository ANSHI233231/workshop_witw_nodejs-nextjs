'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { EditIcon, KeyIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { formatCount, formatMobile } from '@/lib/format';
import { MasterSwitch } from '@/components/ui/master-switch';
import { getUser, setUserStatus } from '@/services/users.service';
import { ApiError } from '@/services/api-error';
import { type UserDetail, type UserListItem, UserStatus } from '@/types/users.types';

import { UserFormDialog } from './user-form-dialog';
import { STATUS_BADGES } from './user-labels';
import { UserPasswordDialog } from './user-password-dialog';

const COLUMNS = 8;

function EmptyValue() {
    return <span className="empty-value">–</span>;
}

function UserRow({
    user,
    serial,
    busy,
    onEdit,
    onChangePassword,
    onToggleStatus,
}: {
    readonly user: UserListItem;
    readonly serial: number;
    readonly busy: boolean;
    readonly onEdit: () => void;
    readonly onChangePassword: () => void;
    readonly onToggleStatus: () => void;
}) {
    const t = useT();
    const badge = STATUS_BADGES[user.status];
    return (
        <tr>
            <td className="col-sno">{formatCount(serial)}</td>
            <td className="">{user.name}</td>
            <td className="">{user.username ?? <EmptyValue />}</td>
            <td className="">{user.mobile ? formatMobile(user.mobile) : <EmptyValue />}</td>
            <td className="">{user.email ?? <EmptyValue />}</td>
            <td className="">{user.roleNames.length > 0 ? user.roleNames.join(', ') : <EmptyValue />}</td>
            <td className="col-status">
                <span className={badge.className}>{t(badge.label)}</span>
            </td>
            <td className="col-actions">
                <div className="us-acts">
                    <button
                        type="button"
                        className="btn-icon"
                        aria-label={t('Edit {name}', { name: user.name })}
                        data-tooltip={t('Edit')}
                        onClick={onEdit}
                    >
                        <EditIcon />
                    </button>
                    <button
                        type="button"
                        className="btn-icon"
                        aria-label={t('Change password for {name}', { name: user.name })}
                        data-tooltip={t('Change Password')}
                        onClick={onChangePassword}
                    >
                        <KeyIcon />
                    </button>
                    <MasterSwitch
                        name={user.name}
                        active={user.status === UserStatus.ACTIVE}
                        busy={busy}
                        onToggle={onToggleStatus}
                    />
                </div>
            </td>
        </tr>
    );
}

type Notice = { readonly message: string; readonly isError: boolean };

export function UsersTable({
    users,
    firstSerial,
}: {
    readonly users: readonly UserListItem[];
    readonly firstSerial: number;
}) {
    const t = useT();
    const router = useRouter();
    const [editing, setEditing] = useState<UserDetail | null>(null);
    const [changingPassword, setChangingPassword] = useState<UserListItem | null>(null);
    const [notice, setNotice] = useState<Notice | null>(null);
    const [switching, setSwitching] = useState<number | null>(null);

    const toggleStatus = async (user: UserListItem) => {
        const next = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
        setSwitching(user.id);
        try {
            await setUserStatus(user.id, next);
            setNotice({
                message:
                    next === UserStatus.ACTIVE
                        ? t('User "{name}" marked active.', { name: user.name })
                        : t('User "{name}" marked inactive.', { name: user.name }),
                isError: false,
            });
            router.refresh();
        } catch (error) {
            setNotice({
                message:
                    error instanceof ApiError && error.code === 'OWN_ACCESS_CHANGE'
                        ? t(error.message)
                        : t('User "{name}" could not be changed. Please try again.', { name: user.name }),
                isError: true,
            });
        } finally {
            setSwitching(null);
        }
    };

    const openEdit = async (user: UserListItem) => {
        try {
            setEditing(await getUser(user.id));
        } catch {
            setNotice({ message: t('User "{name}" could not be opened. Please try again.', { name: user.name }), isError: true });
        }
    };

    return (
        <>
            <div className="table-scroll">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col" className="col-sno">
                                {t('S.No')}
                            </th>
                            <th scope="col" className="">
                                {t('Name')}
                            </th>
                            <th scope="col" className="">
                                {t('Username')}
                            </th>
                            <th scope="col" className="">
                                {t('Mobile')}
                            </th>
                            <th scope="col" className="">
                                {t('Email')}
                            </th>
                            <th scope="col" className="">
                                {t('Role')}
                            </th>
                            <th scope="col" className="col-status">
                                {t('Status')}
                            </th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={COLUMNS} className="us-empty">
                                    {t('No users match this filter.')}
                                </td>
                            </tr>
                        ) : (
                            users.map((user, index) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    serial={firstSerial + index}
                                    busy={switching === user.id}
                                    onEdit={() => void openEdit(user)}
                                    onChangePassword={() => setChangingPassword(user)}
                                    onToggleStatus={() => void toggleStatus(user)}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {editing && (
                <UserFormDialog
                    user={editing}
                    onClose={() => setEditing(null)}
                    onSaved={(saved) => {
                        setEditing(null);
                        setNotice({ message: t('User "{name}" updated.', { name: saved.name }), isError: false });
                        router.refresh();
                    }}
                />
            )}
            {changingPassword && (
                <UserPasswordDialog
                    user={changingPassword}
                    onClose={() => setChangingPassword(null)}
                    onChanged={() => {
                        setNotice({ message: t('Password changed for {name}.', { name: changingPassword.name }), isError: false });
                        setChangingPassword(null);
                    }}
                />
            )}
            {notice && <Toast message={notice.message} isError={notice.isError} onClose={() => setNotice(null)} />}
        </>
    );
}
