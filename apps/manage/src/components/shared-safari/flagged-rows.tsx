'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { formatCount } from '@/lib/format';
import { ApiError } from '@/services/api-error';
import { deleteSafariComment, getCommentFlags, ignoreCommentFlags } from '@/services/shared-safari.service';
import type { CommentFlags, FlaggedComment } from '@/types/shared-safari.types';

import { DeleteCommentDialog } from './delete-comment-dialog';
import { stamp } from './shared-safari-format';
import { FlagIcon, IgnoreIcon, TrashIcon } from './shared-safari-icons';

const SHORT_TEXT_MAX = 70;

const shortText = (text: string): string =>
    text.length > SHORT_TEXT_MAX ? `${text.slice(0, SHORT_TEXT_MAX - 2)}…` : text;

type Notice = { readonly message: string; readonly isError: boolean };

function FlagsDialog({ row, onClose }: { readonly row: FlaggedComment; readonly onClose: () => void }) {
    const t = useT();
    const [flags, setFlags] = useState<CommentFlags | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let current = true;
        getCommentFlags(row.id)
            .then((found) => {
                if (current) setFlags(found);
            })
            .catch((failure: unknown) => {
                if (!current) return;
                setError(
                    failure instanceof ApiError && failure.code !== ApiError.NETWORK_ERROR
                        ? t(failure.message)
                        : t('The flags could not be loaded. Please try again.'),
                );
            });
        return () => {
            current = false;
        };
    }, [row.id, t]);

    const list = flags?.flags ?? [];

    return (
        <div className="overlay" onClick={onClose}>
            <div
                className="modal "
                role="dialog"
                aria-modal="true"
                aria-labelledby="vf-t"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="vf-t">
                        {t('Flags ({count})', { count: flags ? list.length : row.flagCount })}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="ss-stack-lg">
                        <p className="ssc-quote">{flags?.comment.text ?? row.text}</p>
                        {error && (
                            <div className="banner banner-danger" role="alert">
                                {error}
                            </div>
                        )}
                        <div>
                            {list.map((flag) => (
                                <div key={flag.id} className="ssc-flag">
                                    <b>{t(flag.reason)}</b>
                                    <span>{flag.details}</span>
                                    <span className="ss-cap">
                                        {flag.flaggerName} · {stamp(flag.createdAt)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RowActions({
    busy,
    onFlags,
    onIgnore,
    onDelete,
}: {
    readonly busy: boolean;
    readonly onFlags: () => void;
    readonly onIgnore: () => void;
    readonly onDelete: () => void;
}) {
    const t = useT();
    return (
        <div className="us-acts">
            <button
                type="button"
                className="btn-icon "
                aria-label={t('View flags')}
                data-tooltip={t('View flags')}
                onClick={onFlags}
            >
                <FlagIcon />
            </button>
            <button
                type="button"
                className="btn-icon "
                aria-label={t('Ignore')}
                data-tooltip={t('Ignore')}
                disabled={busy}
                onClick={onIgnore}
            >
                <IgnoreIcon />
            </button>
            <button
                type="button"
                className="btn-icon is-danger"
                aria-label={t('Delete')}
                data-tooltip={t('Delete')}
                disabled={busy}
                onClick={onDelete}
            >
                <TrashIcon />
            </button>
        </div>
    );
}

function EmptyState() {
    const t = useT();
    return (
        <div className="state">
            <FlagIcon state />
            <p className="state-title">{t('No flagged comments.')}</p>
        </div>
    );
}

export function FlaggedRows({
    rows,
    firstSerial,
}: {
    readonly rows: readonly FlaggedComment[];
    readonly firstSerial: number;
}) {
    const t = useT();
    const router = useRouter();
    const [viewing, setViewing] = useState<FlaggedComment | null>(null);
    const [removing, setRemoving] = useState<FlaggedComment | null>(null);
    const [busy, setBusy] = useState<number | null>(null);
    const [notice, setNotice] = useState<Notice | null>(null);

    const reasonsOf = (row: FlaggedComment) =>
        t('Reasons: {reasons}', { reasons: row.reasons.map((reason) => t(reason)).join(', ') });

    const run = async (row: FlaggedComment, action: () => Promise<void>, message: string) => {
        if (busy !== null) return;
        setBusy(row.id);
        try {
            await action();
            setNotice({ message, isError: false });
            setRemoving(null);
            router.refresh();
        } catch (error) {
            setNotice({
                message:
                    error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
                        ? t(error.message)
                        : t('This could not be done. Please try again.'),
                isError: true,
            });
            if (error instanceof ApiError && error.code === 'SHARED_SAFARI_COMMENT_NOT_FOUND') {
                setRemoving(null);
                router.refresh();
            }
        } finally {
            setBusy(null);
        }
    };

    const ignore = (row: FlaggedComment) =>
        void run(row, () => ignoreCommentFlags(row.id), t('Flags ignored. The comment stays.'));

    const remove = (row: FlaggedComment) =>
        void run(row, () => deleteSafariComment(row.id), row.isReply ? t('Reply deleted.') : t('Comment deleted.'));

    const actionsOf = (row: FlaggedComment) => (
        <RowActions
            busy={busy === row.id}
            onFlags={() => setViewing(row)}
            onIgnore={() => ignore(row)}
            onDelete={() => setRemoving(row)}
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
                            <th scope="col">{t('Comment')}</th>
                            <th scope="col">{t('Safari')}</th>
                            <th scope="col">{t('By')}</th>
                            <th scope="col" className="col-center">
                                {t('Flags')}
                            </th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={row.id}>
                                <td className="col-sno">{formatCount(firstSerial + index)}</td>
                                <td>
                                    {shortText(row.text)}
                                    <span className="ssc-sub">{reasonsOf(row)}</span>
                                </td>
                                <td>{row.safari.title}</td>
                                <td>{row.writerName}</td>
                                <td className="col-center">{formatCount(row.flagCount)}</td>
                                <td className="col-actions">{actionsOf(row)}</td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={6}>
                                    <EmptyState />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="ssc-only-mobile">
                <div className="ssc-list">
                    {rows.map((row) => (
                        <div key={row.id} className="ssc-card">
                            <div className="ss-between">
                                <b>{row.writerName}</b>
                                {actionsOf(row)}
                            </div>
                            <span>{shortText(row.text)}</span>
                            <span className="ss-cap">{reasonsOf(row)}</span>
                            <span className="ss-cap">
                                {row.safari.title} · {t('Flags')} {formatCount(row.flagCount)}
                            </span>
                        </div>
                    ))}
                </div>
                {rows.length === 0 && <EmptyState />}
            </div>
            {viewing && <FlagsDialog row={viewing} onClose={() => setViewing(null)} />}
            {removing && (
                <DeleteCommentDialog
                    isReply={removing.isReply}
                    text={removing.text}
                    busy={busy !== null}
                    onConfirm={() => remove(removing)}
                    onClose={() => setRemoving(null)}
                />
            )}
            {notice && <Toast message={notice.message} isError={notice.isError} onClose={() => setNotice(null)} />}
        </>
    );
}
