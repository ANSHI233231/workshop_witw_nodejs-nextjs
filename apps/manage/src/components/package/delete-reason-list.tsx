'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { DeleteReasonDialog } from '@/components/package/delete-reason-dialog';
import { ListFilterBar } from '@/components/package/list-filter-bar';
import { DELETE_REASONS_PATH, reasonListParams, reasonListUrl } from '@/components/package/package-url';
import { EmptyListIcon, ToggleStatusIcon } from '@/components/partners/partner-icons';
import { BreadcrumbChevronIcon, EditIcon, PlusIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { formatCount } from '@/lib/format';
import { ApiError } from '@/services/api-error';
import { setDeleteReasonStatus } from '@/services/package.service';
import type { Paginated } from '@/types/api.types';
import {
    type DeleteReason,
    type DeleteReasonFilters,
    DeleteReasonStatus,
    PACKAGE_LIMITS,
} from '@/types/package.types';

type Dialog = { readonly reason: DeleteReason | null } | null;

export function DeleteReasonList({
    filters,
    result,
}: {
    readonly filters: DeleteReasonFilters;
    readonly result: Paginated<DeleteReason>;
}) {
    const t = useT();
    const router = useRouter();
    const [dialog, setDialog] = useState<Dialog>(null);
    const [busy, setBusy] = useState<number | null>(null);
    const [notice, setNotice] = useState<{ message: string; isError: boolean } | null>(null);
    const firstSerial = (filters.page - 1) * result.meta.limit + 1;
    const badgeOf = (reason: DeleteReason) =>
        reason.status === DeleteReasonStatus.ACTIVE
            ? { css: 'badge badge-success', label: t('Active') }
            : { css: 'badge badge-neutral', label: t('Inactive') };

    const toggle = async (reason: DeleteReason) => {
        if (busy !== null) return;
        setBusy(reason.id);
        const next =
            reason.status === DeleteReasonStatus.ACTIVE ? DeleteReasonStatus.INACTIVE : DeleteReasonStatus.ACTIVE;
        try {
            await setDeleteReasonStatus(reason.id, next);
            setNotice({
                message:
                    next === DeleteReasonStatus.ACTIVE
                        ? t('Reason "{name}" is now active.', { name: reason.name })
                        : t('Reason "{name}" is now inactive.', { name: reason.name }),
                isError: false,
            });
            router.refresh();
        } catch (error) {
            const known = error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR;
            setNotice({
                message: known ? t(error.message) : t('This could not be done. Please try again.'),
                isError: true,
            });
            if (known) router.refresh();
        } finally {
            setBusy(null);
        }
    };

    const actions = (reason: DeleteReason) => (
        <div className="us-acts">
            <button
                type="button"
                className="btn-icon"
                aria-label={t('Edit')}
                data-tooltip={t('Edit')}
                onClick={() => setDialog({ reason })}
            >
                <EditIcon />
            </button>
            <button
                type="button"
                className="btn-icon"
                aria-label={reason.status === DeleteReasonStatus.ACTIVE ? t('Make inactive') : t('Make active')}
                data-tooltip={reason.status === DeleteReasonStatus.ACTIVE ? t('Make inactive') : t('Make active')}
                disabled={busy === reason.id}
                onClick={() => void toggle(reason)}
            >
                <ToggleStatusIcon />
            </button>
        </div>
    );
    const empty = (
        <div className="state">
            <EmptyListIcon />
            <p className="state-title">{t('No reasons match.')}</p>
        </div>
    );

    return (
        <div className="page ssc-screen">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Packages')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Package Delete Reasons')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Package Delete Reasons')}</h1>
                    <div className="actions">
                        <button type="button" className="btn btn-primary" onClick={() => setDialog({ reason: null })}>
                            <PlusIcon />
                            {t('Add Reason')}
                        </button>
                    </div>
                </div>
            </div>
            <p className="ss-muted" style={{ margin: '0 0 var(--space-lg)' }}>
                {t('The reasons the Super Admin can pick when deleting a package. Only active reasons can be chosen.')}
            </p>
            <div className="table-card">
                <ListFilterBar
                    placeholder={t('Reason')}
                    search={filters.search}
                    maxLength={PACKAGE_LIMITS.SEARCH}
                    selects={[
                        {
                            label: t('Status'),
                            allLabel: t('Status: All'),
                            value: filters.status === undefined ? '' : String(filters.status),
                            options: [
                                { value: String(DeleteReasonStatus.ACTIVE), label: t('Active') },
                                { value: String(DeleteReasonStatus.INACTIVE), label: t('Inactive') },
                            ],
                            onChange: (value, search) =>
                                router.push(
                                    reasonListUrl({
                                        search,
                                        status: value === '' ? undefined : (Number(value) as DeleteReasonFilters['status']),
                                        page: 1,
                                    }),
                                ),
                        },
                    ]}
                    filtered={filters.search !== '' || filters.status !== undefined}
                    onSearch={(search) => router.replace(reasonListUrl({ ...filters, search, page: 1 }))}
                    onClear={() => router.push(DELETE_REASONS_PATH)}
                />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items:')} <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <div className="table-scroll ssc-only-desktop">
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col" className="col-sno">
                                    {t('S.No')}
                                </th>
                                <th scope="col">{t('Reason')}</th>
                                <th scope="col" className="col-center">
                                    {t('Used in deletes')}
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
                            {result.items.map((reason, index) => (
                                <tr key={reason.id}>
                                    <td className="col-sno">{formatCount(firstSerial + index)}</td>
                                    <td>{reason.name}</td>
                                    <td className="col-center">{reason.usedCount}</td>
                                    <td className="col-status">
                                        <span className={badgeOf(reason).css}>{badgeOf(reason).label}</span>
                                    </td>
                                    <td className="col-actions">{actions(reason)}</td>
                                </tr>
                            ))}
                            {result.items.length === 0 && (
                                <tr>
                                    <td colSpan={5}>{empty}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="ssc-list ssc-only-mobile">
                    {result.items.map((reason, index) => (
                        <div key={reason.id} className="ssc-card">
                            <div className="pq-mrow">{formatCount(firstSerial + index)}</div>
                            <div className="pq-kv">
                                <span>{t('Reason')}</span>
                                <span>{reason.name}</span>
                            </div>
                            <div className="pq-kv">
                                <span>{t('Used in deletes')}</span>
                                <span>{reason.usedCount}</span>
                            </div>
                            <div className="pq-kv">
                                <span>{t('Status')}</span>
                                <span>
                                    <span className={badgeOf(reason).css}>{badgeOf(reason).label}</span>
                                </span>
                            </div>
                            {actions(reason)}
                        </div>
                    ))}
                    {result.items.length === 0 && empty}
                </div>
                <TablePager
                    path={DELETE_REASONS_PATH}
                    params={reasonListParams(filters)}
                    page={filters.page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            </div>
            {dialog && (
                <DeleteReasonDialog
                    reason={dialog.reason}
                    onClose={() => setDialog(null)}
                    onDone={(message) => {
                        setDialog(null);
                        setNotice({ message, isError: false });
                        router.refresh();
                    }}
                />
            )}
            {notice && <Toast message={notice.message} isError={notice.isError} onClose={() => setNotice(null)} />}
        </div>
    );
}
