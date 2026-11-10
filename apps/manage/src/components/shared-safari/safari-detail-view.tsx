'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { BreadcrumbChevronIcon, InfoIcon, ResetIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { useSafariActions } from '@/hooks/shared-safari/use-safari-actions';
import { formatCount } from '@/lib/format';
import { ApiError } from '@/services/api-error';
import { deleteSafariComment, sharedSafariCoverUrl } from '@/services/shared-safari.service';
import {
    type ConsoleComment,
    type ConsoleSafariDetail,
    SafariStatus,
    SAFARI_THEME_LABEL,
    STAY_CATEGORY_LABEL,
} from '@/types/shared-safari.types';

import { DeleteCommentDialog } from './delete-comment-dialog';
import { DeleteSafariDialog } from './delete-safari-dialog';
import { memberTime } from './members-dialog';
import {
    DEFAULT_COVER,
    deleteReasonLabel,
    longDates,
    NO_VALUE,
    rupees,
    stamp,
    statusBadge,
} from './shared-safari-format';
import { PinIcon, TrashIcon, WarningIcon } from './shared-safari-icons';
import { SHARED_SAFARIS_PATH, sharedSafariPath } from './shared-safari-url';

export type DetailTab = 'joined' | 'left' | 'comments';

type CommentRow = { readonly comment: ConsoleComment; readonly isReply: boolean };

const commentRowsOf = (comments: readonly ConsoleComment[]): CommentRow[] =>
    comments.flatMap((comment) => [
        { comment, isReply: false },
        ...comment.replies.map((reply) => ({ comment: reply, isReply: true })),
    ]);

function Empty() {
    return <span className="empty-value">{NO_VALUE}</span>;
}

function Details({ safari }: { readonly safari: ConsoleSafariDetail }) {
    const t = useT();
    const cover = safari.coverVersion ? sharedSafariCoverUrl(safari.id, safari.coverVersion) : DEFAULT_COVER;
    const stay = safari.stayCategory === null ? undefined : STAY_CATEGORY_LABEL[safari.stayCategory];
    return (
        <div className="card ss-stack-lg">
            <span className="ss-group">{t('Details')}</span>
            <dl className="ssc-dl">
                <dt>{t('Host')}</dt>
                <dd>{safari.hostEmail ? `${safari.host.name} (${safari.hostEmail})` : safari.host.name}</dd>
                <dt>{t('Park')}</dt>
                <dd>{safari.park.name}</dd>
                <dt>{t('Theme')}</dt>
                <dd>{t(SAFARI_THEME_LABEL[safari.theme] ?? NO_VALUE)}</dd>
                <dt>{t('Dates')}</dt>
                <dd>{longDates(safari.startDate, safari.endDate)}</dd>
                <dt>{t('Safaris')}</dt>
                <dd>{formatCount(safari.safariCount)}</dd>
                <dt>{t('Stay Category')}</dt>
                <dd>{stay ? t(stay) : NO_VALUE}</dd>
                <dt>{t('Seats')}</dt>
                <dd>{t('{shared} of {total} shared', { shared: safari.sharedSeats, total: safari.totalSeats })}</dd>
                <dt>{t('Price')}</dt>
                <dd>
                    {rupees(safari.pricePerPersonMin)} – {rupees(safari.pricePerPersonMax)}
                </dd>
                <dt>{t('Created')}</dt>
                <dd>{stamp(safari.createdAt)}</dd>
                <dt>{t('Updated')}</dt>
                <dd>{stamp(safari.updatedAt)}</dd>
                <dt>{t('Picture')}</dt>
                <dd>
                    <div className="ss-cover ssc-cover">
                        <img src={cover} alt={t('Picture of {title}', { title: safari.title })} />
                    </div>
                </dd>
            </dl>
        </div>
    );
}

function People({ safari, tab }: { readonly safari: ConsoleSafariDetail; readonly tab: 'joined' | 'left' }) {
    const t = useT();
    const people = tab === 'left' ? safari.left : safari.joined;
    const column = tab === 'left' ? t('Left on') : t('Joined on');
    return (
        <>
            <div className="table-scroll ssc-only-desktop">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">{t('Member')}</th>
                            <th scope="col">{column}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {people.map((member) => (
                            <tr key={member.id}>
                                <td>{member.name}</td>
                                <td>{memberTime(member, tab)}</td>
                            </tr>
                        ))}
                        {people.length === 0 && (
                            <tr>
                                <td colSpan={2}>
                                    <Empty />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="ssc-list ssc-only-mobile">
                {people.map((member) => (
                    <div key={member.id} className="ssc-card">
                        <b>{member.name}</b>
                        <span className="ss-cap">
                            {column} {memberTime(member, tab)}
                        </span>
                    </div>
                ))}
                {people.length === 0 && (
                    <div className="ssc-card">
                        <Empty />
                    </div>
                )}
            </div>
        </>
    );
}

function Comments({
    rows,
    readOnly,
    onDelete,
}: {
    readonly rows: readonly CommentRow[];
    readonly readOnly: boolean;
    readonly onDelete: (row: CommentRow) => void;
}) {
    const t = useT();
    const label = (row: CommentRow) => (row.isReply ? t('Delete this reply') : t('Delete this comment'));
    const text = (row: CommentRow) => (row.isReply ? `↳ ${row.comment.text}` : row.comment.text);
    const replies = (row: CommentRow) => (row.isReply ? NO_VALUE : formatCount(row.comment.replyCount));
    return (
        <>
            <div className="table-scroll ssc-only-desktop">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">{t('Comment')}</th>
                            <th scope="col">{t('By')}</th>
                            <th scope="col" className="col-center">
                                {t('Replies')}
                            </th>
                            <th scope="col" className="col-center">
                                {t('Flags')}
                            </th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.comment.id}>
                                <td>
                                    <span className={row.isReply ? 'ssc-reply' : ''}>{text(row)}</span>
                                </td>
                                <td>{row.comment.writer.name}</td>
                                <td className="col-center">{replies(row)}</td>
                                <td className="col-center">{formatCount(row.comment.openFlagCount)}</td>
                                <td className="col-actions">
                                    {!readOnly && (
                                        <button
                                            type="button"
                                            className="btn-icon is-danger"
                                            aria-label={label(row)}
                                            data-tooltip={t('Delete')}
                                            onClick={() => onDelete(row)}
                                        >
                                            <TrashIcon />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={5}>
                                    <Empty />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="ssc-list ssc-only-mobile">
                {rows.map((row) => (
                    <div key={row.comment.id} className="ssc-card">
                        <div className="ss-between">
                            <b>{row.comment.writer.name}</b>
                            {!readOnly && (
                                <button
                                    type="button"
                                    className="btn-icon"
                                    aria-label={label(row)}
                                    data-tooltip={t('Delete')}
                                    onClick={() => onDelete(row)}
                                >
                                    <TrashIcon />
                                </button>
                            )}
                        </div>
                        <span>{text(row)}</span>
                        <span className="ss-cap">
                            {t('Replies {replies} · Flags {flags}', {
                                replies: replies(row),
                                flags: formatCount(row.comment.openFlagCount),
                            })}
                        </span>
                    </div>
                ))}
                {rows.length === 0 && (
                    <div className="ssc-card">
                        <Empty />
                    </div>
                )}
            </div>
        </>
    );
}

export function SafariDetailView({ safari, tab }: { readonly safari: ConsoleSafariDetail; readonly tab: DetailTab }) {
    const t = useT();
    const router = useRouter();
    const actions = useSafariActions();
    const [deleting, setDeleting] = useState(false);
    const [removing, setRemoving] = useState<CommentRow | null>(null);
    const [removeBusy, setRemoveBusy] = useState(false);
    const badge = statusBadge(safari.status);
    const readOnly = safari.status === SafariStatus.DELETED_BY_HOST;
    const adminDeleted = safari.status === SafariStatus.DELETED_BY_ADMIN;
    const rows = commentRowsOf(safari.comments);
    const tabs: readonly { key: DetailTab; label: string }[] = [
        { key: 'joined', label: t('Joined ({count})', { count: safari.joined.length }) },
        { key: 'left', label: t('Left ({count})', { count: safari.left.length }) },
        { key: 'comments', label: t('Comments ({count})', { count: rows.length }) },
    ];

    const removeComment = async () => {
        if (!removing || removeBusy) return;
        setRemoveBusy(true);
        try {
            await deleteSafariComment(removing.comment.id);
            actions.notify(removing.isReply ? t('Reply deleted.') : t('Comment deleted.'));
            setRemoving(null);
            router.refresh();
        } catch (error) {
            actions.fail(error);
            if (error instanceof ApiError && error.code === 'SHARED_SAFARI_COMMENT_NOT_FOUND') {
                setRemoving(null);
                router.refresh();
            }
        } finally {
            setRemoveBusy(false);
        }
    };

    return (
        <div className="page ssc-screen">
            <div className="ss-stack-lg">
                <div>
                    <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                        <a>{t('Shared Safari')}</a>
                        <BreadcrumbChevronIcon />
                        <Link href={SHARED_SAFARIS_PATH}>{t('Shared Safaris')}</Link>
                        <BreadcrumbChevronIcon />
                        <span>{safari.title}</span>
                    </nav>
                    <div className="page-head">
                        <div className="ss-stack">
                            <h1 className="page-title">{safari.title}</h1>
                            <div className="ssc-head">
                                <span className={badge.className}>{t(badge.label)}</span>
                                {safari.isPinned && (
                                    <span className="tag t-dash">
                                        <PinIcon />
                                        {t('Pinned')}
                                    </span>
                                )}
                            </div>
                        </div>
                        {!readOnly && (
                            <div className="actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    disabled={actions.busy !== null}
                                    onClick={() => void actions.togglePin(safari)}
                                >
                                    <PinIcon />
                                    {safari.isPinned ? t('Unpin') : t('Pin')}
                                </button>
                                {adminDeleted ? (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        disabled={actions.busy !== null}
                                        onClick={() => void actions.makeActive(safari)}
                                    >
                                        <ResetIcon />
                                        {t('Make active')}
                                    </button>
                                ) : (
                                    <button type="button" className="btn btn-danger" onClick={() => setDeleting(true)}>
                                        <TrashIcon />
                                        {t('Delete')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {adminDeleted && (
                    <div className="banner banner-danger" role="status">
                        <WarningIcon />
                        <span>
                            {t('Deleted by admin: {reason} — {details}', {
                                reason: t(deleteReasonLabel(safari)),
                                details: safari.deleteDetails ?? '',
                            })}
                        </span>
                    </div>
                )}
                {readOnly && (
                    <div className="banner" role="status">
                        <InfoIcon />
                        <span>
                            {t('Deleted by host on {when}. This safari is read-only.', {
                                when: safari.deletedAt ? stamp(safari.deletedAt) : NO_VALUE,
                            })}
                        </span>
                    </div>
                )}
                <Details safari={safari} />
                <div className="card ss-stack">
                    <span className="ss-group">{t('Safari plan')}</span>
                    <p className="ss-pre">{safari.safariPlan}</p>
                </div>
                <div className="table-card">
                    <div className="mtabs" role="tablist">
                        {tabs.map((item) => (
                            <Link
                                key={item.key}
                                className={item.key === tab ? 'mtab is-on' : 'mtab'}
                                role="tab"
                                aria-selected={item.key === tab}
                                href={item.key === 'joined' ? sharedSafariPath(safari.id) : `${sharedSafariPath(safari.id)}?tab=${item.key}`}
                                replace
                                scroll={false}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    {tab === 'comments' ? (
                        <Comments rows={rows} readOnly={readOnly} onDelete={setRemoving} />
                    ) : (
                        <People safari={safari} tab={tab} />
                    )}
                </div>
            </div>
            {deleting && (
                <DeleteSafariDialog
                    safariId={safari.id}
                    onClose={() => setDeleting(false)}
                    onDeleted={() => {
                        setDeleting(false);
                        actions.notify(t('Shared safari "{title}" deleted.', { title: safari.title }));
                        router.refresh();
                    }}
                />
            )}
            {removing && !readOnly && (
                <DeleteCommentDialog
                    isReply={removing.isReply}
                    text={removing.comment.text}
                    busy={removeBusy}
                    onConfirm={() => void removeComment()}
                    onClose={() => setRemoving(null)}
                />
            )}
            {actions.notice && (
                <Toast
                    message={actions.notice.message}
                    isError={actions.notice.isError}
                    onClose={actions.clearNotice}
                />
            )}
        </div>
    );
}
