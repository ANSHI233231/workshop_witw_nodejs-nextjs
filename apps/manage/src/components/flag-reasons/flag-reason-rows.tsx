'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { EditIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { formatCount } from '@/lib/format';
import { ApiError } from '@/services/api-error';
import { setFlagReasonStatus } from '@/services/flag-reason.service';
import { type FlagReason, type FlagReasonListItem, FlagReasonStatus } from '@/types/flag-reason.types';

import { FlagReasonDialog } from './flag-reason-dialog';
import { FlagStateIcon, StatusToggleIcon } from './flag-reason-icons';

type Notice = { readonly message: string; readonly isError: boolean };

const badgeOf = (row: FlagReasonListItem) =>
    row.status === FlagReasonStatus.ACTIVE
        ? { className: 'badge badge-success', label: 'Active' }
        : { className: 'badge badge-neutral', label: 'Inactive' };

function RowActions({
    row,
    busy,
    onEdit,
    onToggle,
}: {
    readonly row: FlagReasonListItem;
    readonly busy: boolean;
    readonly onEdit: () => void;
    readonly onToggle: () => void;
}) {
    const t = useT();
    const statusLabel = row.status === FlagReasonStatus.ACTIVE ? t('Make inactive') : t('Make active');
    return (
        <div className="us-acts">
            <button type="button" className="btn-icon" aria-label={t('Edit')} data-tooltip={t('Edit')} onClick={onEdit}>
                <EditIcon />
            </button>
            <button
                type="button"
                className="btn-icon"
                aria-label={statusLabel}
                data-tooltip={statusLabel}
                disabled={busy}
                onClick={onToggle}
            >
                <StatusToggleIcon />
            </button>
        </div>
    );
}

function EmptyState() {
    const t = useT();
    return (
        <div className="state">
            <FlagStateIcon />
            <p className="state-title">{t('No reasons match these filters.')}</p>
        </div>
    );
}

export function FlagReasonRows({ rows }: { readonly rows: readonly FlagReasonListItem[] }) {
    const t = useT();
    const router = useRouter();
    const [editing, setEditing] = useState<FlagReason | null>(null);
    const [switching, setSwitching] = useState<number | null>(null);
    const [notice, setNotice] = useState<Notice | null>(null);

    const toggle = async (row: FlagReasonListItem) => {
        const next = row.status === FlagReasonStatus.ACTIVE ? FlagReasonStatus.INACTIVE : FlagReasonStatus.ACTIVE;
        setSwitching(row.id);
        try {
            await setFlagReasonStatus(row.id, next);
            setNotice({
                message:
                    next === FlagReasonStatus.ACTIVE
                        ? t('Reason "{name}" is now active.', { name: row.name })
                        : t('Reason "{name}" is now inactive.', { name: row.name }),
                isError: false,
            });
            router.refresh();
        } catch (error) {
            setNotice({
                message:
                    error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
                        ? t(error.message)
                        : t('This could not be done. Please try again.'),
                isError: true,
            });
        } finally {
            setSwitching(null);
        }
    };

    const actionsOf = (row: FlagReasonListItem) => (
        <RowActions
            row={row}
            busy={switching === row.id}
            onEdit={() => setEditing(row)}
            onToggle={() => void toggle(row)}
        />
    );

    return (
        <>
            <div className="table-scroll ssc-only-desktop">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col" className="col-sno">
                                {t('S.No')}
                            </th>
                            <th scope="col">{t('Reason')}</th>
                            <th scope="col" className="col-center">
                                {t('Used in flags')}
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
                        {rows.map((row, index) => {
                            const badge = badgeOf(row);
                            return (
                                <tr key={row.id}>
                                    <td className="col-sno">{formatCount(index + 1)}</td>
                                    <td>{row.name}</td>
                                    <td className="col-center">{formatCount(row.usedInFlags)}</td>
                                    <td className="col-status">
                                        <span className={badge.className}>{t(badge.label)}</span>
                                    </td>
                                    <td className="col-actions">{actionsOf(row)}</td>
                                </tr>
                            );
                        })}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={5}>
                                    <EmptyState />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="ssc-only-mobile">
                <div className="ssc-list">
                    {rows.map((row, index) => {
                        const badge = badgeOf(row);
                        return (
                            <div className="ssc-card" key={row.id}>
                                <div className="ss-between">
                                    <b>
                                        {formatCount(index + 1)}. {row.name}
                                    </b>
                                    <span className={badge.className}>{t(badge.label)}</span>
                                </div>
                                <div className="ss-between">
                                    <span className="ss-cap">
                                        {t('Used in {count} flags', { count: formatCount(row.usedInFlags) })}
                                    </span>
                                    {actionsOf(row)}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {rows.length === 0 && <EmptyState />}
            </div>
            {editing && (
                <FlagReasonDialog
                    editing={editing}
                    onSaved={(record) => {
                        setEditing(null);
                        setNotice({ message: t('Reason "{name}" updated.', { name: record.name }), isError: false });
                        router.refresh();
                    }}
                    onClose={() => setEditing(null)}
                />
            )}
            {notice && <Toast message={notice.message} isError={notice.isError} onClose={() => setNotice(null)} />}
        </>
    );
}
