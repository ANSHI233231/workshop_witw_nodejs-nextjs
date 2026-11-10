'use client';

import { Fragment, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import type { Translate } from '@/lib/i18n/locale';
import { daysAgo, isWithinAgoDays, shortDate, wordCount } from '@/lib/shared-safari-format';
import { ApiError } from '@/services/api-error';
import { deleteComment, editComment, postComment } from '@/services/shared-safari.service';
import { SAFARI_LIMITS, type SafariComment, type SafariView } from '@/types/shared-safari.types';

import { FlagIcon, PencilIcon, ReplyIcon, TrashIcon } from './safari-icons';

const agoText = (isoDateTime: string, t: Translate): string => {
    const days = daysAgo(isoDateTime);
    if (days <= 0) return t('Today');
    if (days === 1) return t('1 day ago');
    if (isWithinAgoDays(days)) return t('{n} days ago', { n: days });
    return shortDate(isoDateTime);
};

const textError = (text: string): string | null => {
    if (!text.trim()) return 'Enter a comment.';
    if (wordCount(text) >= SAFARI_LIMITS.COMMENT_WORDS_BELOW) return 'Please provide content within 200 words.';
    return null;
};

type Box = 'new' | 'reply' | 'edit';

function CommentField({
    id,
    label,
    rows,
    placeholder,
    value,
    error,
    onChange,
}: {
    readonly id?: string;
    readonly label: string;
    readonly rows: number;
    readonly placeholder?: string;
    readonly value: string;
    readonly error: string | null;
    readonly onChange: (value: string) => void;
}) {
    const t = useT();
    return (
        <div className={error ? 'field is-invalid' : 'field'}>
            {id && (
                <label className="sr-only" htmlFor={id}>
                    {label}
                </label>
            )}
            <textarea
                id={id}
                className="textarea"
                rows={rows}
                placeholder={placeholder}
                aria-label={id ? undefined : label}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                aria-invalid={error ? true : undefined}
            ></textarea>
            {error && (
                <span className="error" role="alert">
                    {t(error)}
                </span>
            )}
        </div>
    );
}

export function SafariDiscussion({
    safari,
    meInitial,
    onChanged,
    onMessage,
    onError,
    onFlag,
}: {
    readonly safari: SafariView;
    readonly meInitial: string;
    readonly onChanged: () => Promise<void>;
    readonly onMessage: (message: string) => void;
    readonly onError: (message: string) => void;
    readonly onFlag: (commentId: number) => void;
}) {
    const t = useT();
    const [text, setText] = useState('');
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [editId, setEditId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [errors, setErrors] = useState<Partial<Record<Box, string | null>>>({});
    const [busy, setBusy] = useState(false);
    const viewer = safari.viewer;
    const isOpen = safari.status === 1 || safari.status === 3;

    const failed = (error: unknown, box: Box) => {
        if (error instanceof ApiError && error.errors.length > 0) {
            setErrors((current) => ({ ...current, [box]: error.fieldError('text') ?? error.message }));
            return;
        }
        onError(error instanceof ApiError ? error.message : t('This could not be done. Please try again.'));
    };

    const run = async (box: Box, value: string, work: () => Promise<void>, after: () => void) => {
        const error = textError(value);
        setErrors((current) => ({ ...current, [box]: error }));
        if (error || busy) return;
        setBusy(true);
        try {
            await work();
            after();
            await onChanged();
        } catch (problem) {
            failed(problem, box);
        } finally {
            setBusy(false);
        }
    };

    const post = () =>
        run(
            'new',
            text,
            async () => {
                await postComment(safari.id, text.trim(), null);
            },
            () => setText(''),
        );

    const postReply = (parentId: number) =>
        run(
            'reply',
            replyText,
            async () => {
                await postComment(safari.id, replyText.trim(), parentId);
            },
            () => {
                setReplyTo(null);
                setReplyText('');
            },
        );

    const saveEdit = (id: number) =>
        run(
            'edit',
            editText,
            () => editComment(id, editText.trim()),
            () => {
                setEditId(null);
                setEditText('');
                onMessage(t('Comment updated.'));
            },
        );

    const remove = async (comment: SafariComment, isReply: boolean) => {
        if (busy) return;
        setBusy(true);
        try {
            await deleteComment(comment.id);
            setEditId(null);
            onMessage(isReply ? t('Reply deleted.') : t('Comment deleted.'));
            await onChanged();
        } catch (error) {
            failed(error, 'edit');
        } finally {
            setBusy(false);
        }
    };

    const renderComment = (comment: SafariComment, isReply: boolean) => {
        const editing = editId === comment.id;
        return (
            <div className="ss3-c">
                <span className="avatar ss-av">{comment.writer.initials}</span>
                <div className="ss3-cb">
                    <div className="ss3-ch">
                        <span>
                            <span className="ss3-cn">
                                {comment.writer.name}
                                {comment.isHost ? ` ${t('(Host)')}` : ''}
                            </span>{' '}
                            <span className="ss-cap">· {agoText(comment.createdAt, t)}</span>
                        </span>
                        <span className="ss3-cacts">
                            {comment.canFlag && isOpen && (
                                <button
                                    type="button"
                                    className="btn-icon"
                                    aria-label={t('Flag this comment')}
                                    data-tooltip={t('Flag')}
                                    onClick={() => onFlag(comment.id)}
                                >
                                    <FlagIcon />
                                </button>
                            )}
                            {comment.canEdit && !editing && (
                                <>
                                    <button
                                        type="button"
                                        className="btn-icon"
                                        aria-label={t('Edit your comment')}
                                        data-tooltip={t('Edit')}
                                        onClick={() => {
                                            setEditId(comment.id);
                                            setEditText(comment.text);
                                            setReplyTo(null);
                                            setErrors({});
                                        }}
                                    >
                                        <PencilIcon />
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-icon is-danger"
                                        aria-label={t('Delete your comment')}
                                        data-tooltip={t('Delete')}
                                        onClick={() => void remove(comment, isReply)}
                                    >
                                        <TrashIcon />
                                    </button>
                                </>
                            )}
                        </span>
                    </div>
                    {!editing && <p className="ss3-ct">{comment.text}</p>}
                    {editing && (
                        <div className="ss3-box">
                            <CommentField
                                label={t('Edit your comment')}
                                rows={3}
                                value={editText}
                                error={errors.edit ?? null}
                                onChange={setEditText}
                            />
                            <div className="ss-row">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setEditId(null);
                                        setEditText('');
                                        setErrors((current) => ({ ...current, edit: null }));
                                    }}
                                >
                                    {t('Cancel')}
                                </button>
                                <button type="button" className="btn btn-primary" onClick={() => void saveEdit(comment.id)}>
                                    {t('Save')}
                                </button>
                            </div>
                        </div>
                    )}
                    {!isReply && viewer.canComment && (
                        <div>
                            <button
                                type="button"
                                className="btn btn-text"
                                style={{ paddingLeft: 0, height: 24 }}
                                onClick={() => {
                                    setReplyTo(comment.id);
                                    setReplyText('');
                                    setErrors((current) => ({ ...current, reply: null }));
                                }}
                            >
                                <ReplyIcon />
                                {t('Reply')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="ss3-box2">
            <div className="ss3-bh">{t('Discussion ({n})', { n: safari.commentCount })}</div>
            {safari.comments.length > 0 ? (
                <div className="ss3-bb">
                    {safari.comments.map((comment) => (
                        <Fragment key={comment.id}>
                            {renderComment(comment, false)}
                            {comment.replies.length > 0 && (
                                <div className="ss3-reply">
                                    {comment.replies.map((reply) => (
                                        <Fragment key={reply.id}>{renderComment(reply, true)}</Fragment>
                                    ))}
                                </div>
                            )}
                            {replyTo === comment.id && viewer.canComment && (
                                <div className="ss3-reply">
                                    <div className="ss3-box">
                                        <CommentField
                                            id="cm-reply"
                                            label={t('Write a reply')}
                                            rows={2}
                                            placeholder={t('Write a reply…')}
                                            value={replyText}
                                            error={errors.reply ?? null}
                                            onChange={setReplyText}
                                        />
                                        <div className="ss-row">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => {
                                                    setReplyTo(null);
                                                    setReplyText('');
                                                }}
                                            >
                                                {t('Cancel')}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={() => void postReply(comment.id)}
                                            >
                                                {t('Post Reply')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Fragment>
                    ))}
                </div>
            ) : (
                <div className="ss3-bb">
                    <p className="ss3-empty">{t('No comments yet.')}</p>
                </div>
            )}
            {viewer.canComment && (
                <div className="ss3-new">
                    <span className="avatar">{meInitial}</span>
                    <div className="ss3-box">
                        <CommentField
                            id="cm-new"
                            label={t('Write a comment')}
                            rows={4}
                            placeholder={t('Write a comment…')}
                            value={text}
                            error={errors.new ?? null}
                            onChange={setText}
                        />
                        <div className="ss-row">
                            <button type="button" className="btn btn-primary" onClick={() => void post()}>
                                {t('Post Comment')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isOpen && viewer.signedIn && !viewer.isHost && !viewer.joined && !viewer.hasLeft && (
                <div className="ss3-note">
                    <p className="ss3-empty">{t('Join this safari to comment.')}</p>
                </div>
            )}
            {isOpen && !viewer.signedIn && (
                <div className="ss3-note">
                    <p className="ss3-empty">{t('Sign in and join this safari to comment.')}</p>
                </div>
            )}
        </div>
    );
}
