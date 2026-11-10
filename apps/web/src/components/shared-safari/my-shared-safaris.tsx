'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ReactNode, useCallback, useEffect, useState } from 'react';

import { SITE_PATHS } from '@/components/website/witw-site-frame';
import { useT } from '@/hooks/i18n/use-t';
import { useSiteToast } from '@/hooks/shared-safari/use-site-toast';
import { useIsPhone } from '@/hooks/ui/use-is-phone';
import { cn } from '@/lib/class-names';
import { dateRangeShort } from '@/lib/shared-safari-format';
import { ApiError } from '@/services/api-error';
import { deleteSafari, leaveSafari, listMySafaris, setSafariStatus } from '@/services/shared-safari.service';
import { type HostStatus, type MyTab, type SafariCard, SafariStatus } from '@/types/shared-safari.types';

import { OrganiseDialog, type OrganiseResult } from './organise-dialog';
import { safariPath } from './safari-card';
import { coverSource } from './safari-cover';
import { DeleteSafariDialog, LeaveSafariDialog, StatusDialog, statusLabel } from './safari-dialogs';
import { rememberFlash, takeFlash } from './safari-flash';
import { BinocularsStateIcon, EyeIcon, LeaveIcon, PencilIcon, PlusIcon, ToggleIcon, TrashIcon, UsersIcon } from './safari-icons';
import { SiteToast } from './site-toast';

type Lists = Readonly<Record<MyTab, readonly SafariCard[]>>;

type Dialog =
    | { readonly kind: 'status' | 'delete' | 'leave' | 'edit'; readonly safari: SafariCard }
    | { readonly kind: 'new' }
    | null;

type Action = {
    readonly label: string;
    readonly icon: ReactNode;
    readonly danger?: boolean;
    readonly run: () => void;
};

const badgeOf = (safari: SafariCard): { readonly label: string; readonly className: string } => {
    if (safari.isStarted) return { label: 'Over', className: 'badge badge-neutral' };
    if (safari.status === SafariStatus.ACTIVE) return { label: 'Active', className: 'badge badge-success' };
    if (safari.status === SafariStatus.SEAT_FULL) return { label: 'Seat full', className: 'badge badge-warning' };
    return { label: statusLabel(safari.status), className: 'badge badge-neutral' };
};

export function MySharedSafaris() {
    const t = useT();
    const router = useRouter();
    const isPhone = useIsPhone();
    const { toast, show, showError, hide } = useSiteToast();
    const [tab, setTab] = useState<MyTab>('organised');
    const [lists, setLists] = useState<Lists | null>(null);
    const [dialog, setDialog] = useState<Dialog>(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        try {
            const [organised, joined] = await Promise.all([listMySafaris('organised'), listMySafaris('joined')]);
            setLists({ organised, joined });
        } catch (error) {
            showError(error instanceof ApiError ? error.message : t('This could not be done. Please try again.'));
        }
    }, [showError, t]);

    useEffect(() => {
        const flash = takeFlash();
        queueMicrotask(() => {
            void load();
            if (flash) show(flash);
        });
    }, [load, show]);

    const act = async (work: () => Promise<void>, message: string) => {
        if (busy) return;
        setBusy(true);
        try {
            await work();
            show(message);
        } catch (error) {
            showError(error instanceof ApiError ? error.message : t('This could not be done. Please try again.'));
        } finally {
            setDialog(null);
            setBusy(false);
            await load();
        }
    };

    const organised = (result: OrganiseResult) => {
        setDialog(null);
        if (result.created) {
            rememberFlash(t('Your safari is live.'));
            router.push(safariPath(result.slug));
            return;
        }
        show(t('Safari updated.'));
        void load();
    };

    const actionsOf = (safari: SafariCard): readonly Action[] => {
        const view: Action = { label: 'View', icon: <EyeIcon />, run: () => router.push(safariPath(safari.slug)) };
        if (tab === 'joined') {
            return [view, { label: 'Leave', icon: <LeaveIcon />, run: () => setDialog({ kind: 'leave', safari }) }];
        }
        return [
            view,
            { label: 'Edit', icon: <PencilIcon />, run: () => setDialog({ kind: 'edit', safari }) },
            { label: 'Change status', icon: <ToggleIcon />, run: () => setDialog({ kind: 'status', safari }) },
            { label: 'Delete', icon: <TrashIcon />, danger: true, run: () => setDialog({ kind: 'delete', safari }) },
        ];
    };

    const subOf = (safari: SafariCard): string =>
        tab === 'organised'
            ? `${safari.park.name} · ${t('{n} joined', { n: safari.joinedCount })}`
            : `${safari.park.name} · ${t('Hosted by {name}', { name: safari.host.name })}`;

    const actionButtons = (safari: SafariCard) => (
        <div className="us-acts">
            {actionsOf(safari).map((action) => (
                <button
                    key={action.label}
                    type="button"
                    className={cn('btn-icon', action.danger && 'is-danger')}
                    aria-label={t(action.label)}
                    data-tooltip={t(action.label)}
                    onClick={action.run}
                >
                    {action.icon}
                </button>
            ))}
        </div>
    );

    const rows = lists ? lists[tab] : [];
    const tabButton = (key: MyTab, label: string) => (
        <a
            className={tab === key ? 'nt-tab is-on' : 'nt-tab'}
            role="tab"
            aria-selected={tab === key}
            href={`#${key}`}
            onClick={(event) => {
                event.preventDefault();
                setTab(key);
            }}
        >
            {t(label)}
            <span>{lists ? lists[key].length : 0}</span>
        </a>
    );

    return (
        <>
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <span>{t('My Shared Safaris')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('My Shared Safaris')}</h1>
                    <div className="actions">
                        <button type="button" className="btn btn-primary" onClick={() => setDialog({ kind: 'new' })}>
                            <PlusIcon />
                            {t('Organise a Safari')}
                        </button>
                    </div>
                </div>
            </div>
            <div className="nt-card ss9">
                <div className="nt-tabs" role="tablist">
                    {tabButton('organised', 'Organised')}
                    {tabButton('joined', 'Joined')}
                </div>
                {rows.length > 0 &&
                    (isPhone ? (
                        <div>
                            {rows.map((safari) => {
                                const badge = badgeOf(safari);
                                return (
                                    <div key={safari.id} className="ss9-card">
                                        <span className="ss-cover ss9-thumb">
                                            <img src={coverSource(safari.id, safari.coverVersion)} alt="" />
                                        </span>
                                        <div className="ss9-t">
                                            <b>{safari.title}</b>
                                            <span className="ss-cap">{subOf(safari)}</span>
                                            <span className="ss-cap">{dateRangeShort(safari.startDate, safari.endDate)}</span>
                                            <span>
                                                <span className={badge.className}>{t(badge.label)}</span>
                                            </span>
                                        </div>
                                        {actionButtons(safari)}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="table-scroll" style={{ overflow: 'visible' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col" style={{ width: 120 }}>
                                            <span className="sr-only">{t('Image')}</span>
                                        </th>
                                        <th scope="col">{t('Safari')}</th>
                                        <th scope="col">{t('Dates')}</th>
                                        <th scope="col" className="col-status">
                                            {t('Status')}
                                        </th>
                                        <th scope="col" className="col-actions">
                                            {t('Actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((safari) => {
                                        const badge = badgeOf(safari);
                                        return (
                                            <tr key={safari.id}>
                                                <td>
                                                    <span className="ss-cover ss9-thumb">
                                                        <img src={coverSource(safari.id, safari.coverVersion)} alt="" />
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="ss9-t">
                                                        <b>{safari.title}</b>
                                                        <span className="ss-cap">{subOf(safari)}</span>
                                                    </div>
                                                </td>
                                                <td>{dateRangeShort(safari.startDate, safari.endDate)}</td>
                                                <td className="col-status">
                                                    <span className={badge.className}>{t(badge.label)}</span>
                                                </td>
                                                <td className="col-actions">{actionButtons(safari)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ))}
                {lists && rows.length === 0 && tab === 'organised' && (
                    <div className="state">
                        <BinocularsStateIcon className="icon state-icon" />
                        <p className="state-title">{t("You haven't organised a safari yet.")}</p>
                        <button type="button" className="btn btn-primary" onClick={() => setDialog({ kind: 'new' })}>
                            <PlusIcon />
                            {t('Organise a Safari')}
                        </button>
                    </div>
                )}
                {lists && rows.length === 0 && tab === 'joined' && (
                    <div className="state">
                        <UsersIcon className="icon state-icon" />
                        <p className="state-title">{t("You haven't joined a safari yet.")}</p>
                        <Link className="btn btn-secondary" href={SITE_PATHS.home}>
                            {t('Browse safaris')}
                        </Link>
                    </div>
                )}
            </div>
            {dialog?.kind === 'status' && (
                <StatusDialog
                    current={dialog.safari.status}
                    onClose={() => setDialog(null)}
                    onDelete={() => setDialog({ kind: 'delete', safari: dialog.safari })}
                    onSave={(status: HostStatus) =>
                        void act(
                            () => setSafariStatus(dialog.safari.id, status),
                            t('Status changed to {status}.', { status: t(statusLabel(status)) }),
                        )
                    }
                />
            )}
            {dialog?.kind === 'delete' && (
                <DeleteSafariDialog
                    onClose={() => setDialog(null)}
                    onConfirm={() => void act(() => deleteSafari(dialog.safari.id), t('Safari deleted.'))}
                />
            )}
            {dialog?.kind === 'leave' && (
                <LeaveSafariDialog
                    onClose={() => setDialog(null)}
                    onConfirm={() => void act(() => leaveSafari(dialog.safari.id), t("You've left this safari."))}
                />
            )}
            {(dialog?.kind === 'edit' || dialog?.kind === 'new') && (
                <OrganiseDialog
                    safariId={dialog.kind === 'edit' ? dialog.safari.id : null}
                    onClose={() => setDialog(null)}
                    onSaved={organised}
                    onError={showError}
                />
            )}
            <SiteToast toast={toast} onClose={hide} />
        </>
    );
}
