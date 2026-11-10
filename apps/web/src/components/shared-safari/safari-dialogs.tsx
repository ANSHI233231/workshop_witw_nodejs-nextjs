'use client';

import { type ReactNode, useEffect, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { logger } from '@/lib/logger';
import { shortDate } from '@/lib/shared-safari-format';
import { ApiError } from '@/services/api-error';
import { flagComment, listActiveFlagReasons } from '@/services/shared-safari.service';
import {
    type FlagReason,
    type HostStatus,
    type Member,
    SAFARI_LIMITS,
    SafariStatus,
} from '@/types/shared-safari.types';

import { CloseIcon, FlagIcon, TrashIcon } from './safari-icons';

const log = logger.category('shared-safari');

function Dialog({
    id,
    title,
    small = true,
    className,
    onClose,
    children,
    foot,
}: {
    readonly id: string;
    readonly title: string;
    readonly small?: boolean;
    readonly className?: string;
    readonly onClose: () => void;
    readonly children: ReactNode;
    readonly foot?: ReactNode;
}) {
    const t = useT();
    return (
        <div className="overlay" onClick={onClose}>
            <div
                className={className ?? (small ? 'modal is-sm' : 'modal')}
                role="dialog"
                aria-modal="true"
                aria-labelledby={id}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id={id}>
                        {title}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {foot && <div className="modal-foot">{foot}</div>}
            </div>
        </div>
    );
}

export function InterestedDialog({ members, onClose }: { readonly members: readonly Member[]; readonly onClose: () => void }) {
    const t = useT();
    return (
        <Dialog
            id="who-t"
            title={t('Interested ({n})', { n: members.length })}
            className="modal ss3-who-dlg"
            onClose={onClose}
        >
            <div className="table-scroll">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col" className="col-sno">
                                {t('S.No')}
                            </th>
                            <th scope="col">{t('Name')}</th>
                            <th scope="col">{t('Joined On')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member, index) => (
                            <tr key={member.id}>
                                <td className="col-sno">{index + 1}</td>
                                <td>
                                    <span className="ss3-who-name">
                                        <span className="avatar ss-av">{member.initials}</span>
                                        {member.name}
                                    </span>
                                </td>
                                <td>{shortDate(member.joinedAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="ss3-who-foot">
                {t('Showing 1 - {n} of {n} interested users', { n: members.length })}
            </div>
        </Dialog>
    );
}

const STATUS_OPTIONS: ReadonlyArray<{ readonly value: HostStatus; readonly label: string; readonly note: string }> = [
    { value: SafariStatus.ACTIVE, label: 'Active', note: 'Shown to everyone' },
    { value: SafariStatus.SEAT_FULL, label: 'Seat full', note: 'Shown, marked Seat full' },
    { value: SafariStatus.INACTIVE, label: 'Inactive', note: 'Hidden until you make it active' },
];

export const statusLabel = (status: number): string =>
    STATUS_OPTIONS.find((option) => option.value === status)?.label ?? '';

export function StatusDialog({
    current,
    onClose,
    onSave,
    onDelete,
}: {
    readonly current: number;
    readonly onClose: () => void;
    readonly onSave: (status: HostStatus) => void;
    readonly onDelete: () => void;
}) {
    const t = useT();
    const [picked, setPicked] = useState<number>(current);
    return (
        <Dialog
            id="st-t"
            title={t('Change status')}
            onClose={onClose}
            foot={
                <>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            const option = STATUS_OPTIONS.find((item) => item.value === picked);
                            if (option) onSave(option.value);
                        }}
                    >
                        {t('Save')}
                    </button>
                </>
            }
        >
            <div role="radiogroup" aria-label={t('Status')}>
                {STATUS_OPTIONS.map((option) => (
                    <label key={option.value} className="ss-radio">
                        <input
                            type="radio"
                            name="ss-status"
                            value={option.value}
                            checked={picked === option.value}
                            onChange={() => setPicked(option.value)}
                        />
                        <span>
                            {t(option.label)}
                            <small>{t(option.note)}</small>
                        </span>
                    </label>
                ))}
            </div>
            <div
                style={{
                    borderTop: '1px solid var(--color-border)',
                    marginTop: 'var(--space-lg)',
                    paddingTop: 'var(--space-md)',
                }}
            >
                <button type="button" className="btn btn-text ss-danger-link" onClick={onDelete}>
                    <TrashIcon />
                    {t('Delete this safari')}
                </button>
            </div>
        </Dialog>
    );
}

export function ConfirmDialog({
    id,
    title,
    text,
    confirmLabel,
    danger = false,
    onClose,
    onConfirm,
}: {
    readonly id: string;
    readonly title: string;
    readonly text: string;
    readonly confirmLabel: string;
    readonly danger?: boolean;
    readonly onClose: () => void;
    readonly onConfirm: () => void;
}) {
    const t = useT();
    return (
        <Dialog
            id={id}
            title={title}
            onClose={onClose}
            foot={
                <>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <button type="button" className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </>
            }
        >
            <p className="ss-muted" style={{ margin: 0 }}>
                {text}
            </p>
        </Dialog>
    );
}

export function DeleteSafariDialog({ onClose, onConfirm }: { readonly onClose: () => void; readonly onConfirm: () => void }) {
    const t = useT();
    return (
        <ConfirmDialog
            id="del-t"
            title={t('Delete this safari?')}
            text={t("This can't be undone.")}
            confirmLabel={t('Delete')}
            danger
            onClose={onClose}
            onConfirm={onConfirm}
        />
    );
}

export function LeaveSafariDialog({ onClose, onConfirm }: { readonly onClose: () => void; readonly onConfirm: () => void }) {
    const t = useT();
    return (
        <ConfirmDialog
            id="lv-t"
            title={t('Leave this safari?')}
            text={t('You can join again later.')}
            confirmLabel={t('Leave')}
            onClose={onClose}
            onConfirm={onConfirm}
        />
    );
}

type FlagErrors = { readonly reason?: string; readonly details?: string };

export function FlagDialog({
    commentId,
    onClose,
    onFlagged,
    onError,
}: {
    readonly commentId: number;
    readonly onClose: () => void;
    readonly onFlagged: () => void;
    readonly onError: (message: string) => void;
}) {
    const t = useT();
    const [reasons, setReasons] = useState<readonly FlagReason[]>([]);
    const [reasonId, setReasonId] = useState<number | null>(null);
    const [details, setDetails] = useState('');
    const [errors, setErrors] = useState<FlagErrors>({});
    const [sending, setSending] = useState(false);

    useEffect(() => {
        let active = true;
        listActiveFlagReasons()
            .then((list) => {
                if (active) setReasons(list);
            })
            .catch((error: unknown) => log.error('Flag reasons could not be loaded.', { error }));
        return () => {
            active = false;
        };
    }, []);

    const submit = async () => {
        if (sending) return;
        const found: { reason?: string; details?: string } = {};
        if (reasonId === null) found.reason = 'Select a reason.';
        if (!details.trim()) found.details = 'Enter the details.';
        else if (details.trim().length > SAFARI_LIMITS.FLAG_DETAILS_MAX) found.details = 'Use up to 500 characters.';
        setErrors(found);
        if (found.reason || found.details || reasonId === null) return;
        setSending(true);
        try {
            await flagComment(commentId, reasonId, details.trim());
            onFlagged();
        } catch (error) {
            setSending(false);
            if (error instanceof ApiError && error.errors.length > 0) {
                setErrors({ reason: error.fieldError('reasonId'), details: error.fieldError('details') });
                return;
            }
            onError(error instanceof ApiError ? error.message : t('This could not be done. Please try again.'));
        }
    };

    return (
        <Dialog
            id="fl-t"
            title={t('Flag this comment')}
            onClose={onClose}
            foot={
                <>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => void submit()} disabled={sending}>
                        <FlagIcon />
                        {t('Flag')}
                    </button>
                </>
            }
        >
            <div className="ss-stack-lg">
                <div className={errors.reason ? 'field is-invalid' : 'field'}>
                    <span className="label">
                        {t('Reason')}
                        <span className="req" aria-hidden="true">
                            *
                        </span>
                    </span>
                    <div role="radiogroup" aria-label={t('Reason')}>
                        {reasons.map((reason) => (
                            <label key={reason.id} className="ss-radio" style={{ padding: '4px 0' }}>
                                <input
                                    type="radio"
                                    name="ss-reason"
                                    value={reason.id}
                                    checked={reasonId === reason.id}
                                    onChange={() => setReasonId(reason.id)}
                                />
                                <span>{reason.name}</span>
                            </label>
                        ))}
                    </div>
                    {errors.reason && (
                        <span className="error" role="alert">
                            {t(errors.reason)}
                        </span>
                    )}
                </div>
                <div className={errors.details ? 'field is-invalid' : 'field'}>
                    <label className="label" htmlFor="fl-details">
                        {t('Details')}
                        <span className="req" aria-hidden="true">
                            *
                        </span>
                    </label>
                    <textarea
                        id="fl-details"
                        className="textarea"
                        rows={3}
                        value={details}
                        onChange={(event) => setDetails(event.target.value)}
                        aria-invalid={errors.details ? true : undefined}
                    ></textarea>
                    <span className="helper">{t('Up to 500 characters')}</span>
                    {errors.details && (
                        <span className="error" role="alert">
                            {t(errors.details)}
                        </span>
                    )}
                </div>
            </div>
        </Dialog>
    );
}
