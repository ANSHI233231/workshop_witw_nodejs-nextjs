'use client';

import { useState } from 'react';

import { ViewIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { formatDate } from '@/lib/format';
import { getMailTemplate } from '@/services/mail.service';
import type { MailTemplateDetail } from '@/types/mail.types';

import { templateBadgeOf } from './notification-labels';
import { MetaItem, NotificationModal } from './notification-modal';
import { BellPreview, EmailPreview } from './notification-previews';

export type TemplateRow = {
    readonly key: string;
    readonly id: number;
    readonly isEmail: boolean;
    readonly name: string;
    readonly code: string;
    readonly subject: string;
    readonly sentWhen: string | null;
    readonly status: number;
    readonly updatedAt: string;
    readonly opens: string | null;
    readonly app: string | null;
};

const COLUMNS = 7;

function ChannelBadge({ isEmail }: { readonly isEmail: boolean }) {
    const t = useT();
    return <span className={`na-ch is-${isEmail ? 'email' : 'inapp'}`}>{isEmail ? t('Email') : t('In-app')}</span>;
}

function TemplateDialog({
    row,
    mail,
    onClose,
}: {
    readonly row: TemplateRow;
    readonly mail: MailTemplateDetail | null;
    readonly onClose: () => void;
}) {
    const t = useT();
    const badge = templateBadgeOf(row.status);
    return (
        <NotificationModal title={row.name} label="Notification template" onClose={onClose}>
            <dl className="em-meta">
                <MetaItem label="Channel">
                    <ChannelBadge isEmail={row.isEmail} />
                </MetaItem>
                <MetaItem label="Status">
                    <span className={badge.className}>{t(badge.label)}</span>
                </MetaItem>
                <MetaItem label={row.isEmail ? 'Subject' : 'Title'}>{row.subject}</MetaItem>
                <MetaItem label="Sent When">{row.sentWhen ?? '–'}</MetaItem>
                <MetaItem label="Code">{row.code}</MetaItem>
                {!row.isEmail && <MetaItem label="Opens">{row.opens ?? '–'}</MetaItem>}
                {!row.isEmail && <MetaItem label="Shows in">{t(row.app ?? 'The app it happens in')}</MetaItem>}
            </dl>
            {row.isEmail && mail && (
                <EmailPreview title={t('{name} template', { name: row.name })} html={mail.bodyHtml} />
            )}
            {!row.isEmail && (
                <BellPreview
                    app={row.app ?? 'Console or Portal'}
                    title={row.subject}
                    message="{{excerpt}}"
                    when={t('Just now')}
                    opens={row.opens}
                />
            )}
        </NotificationModal>
    );
}

export function TemplateTable({ rows }: { readonly rows: readonly TemplateRow[] }) {
    const [open, setOpen] = useState<{ readonly row: TemplateRow; readonly mail: MailTemplateDetail | null } | null>(
        null,
    );
    const t = useT();
    const [problem, setProblem] = useState<string | null>(null);

    const view = async (row: TemplateRow) => {
        if (!row.isEmail) {
            setOpen({ row, mail: null });
            return;
        }
        try {
            setOpen({ row, mail: await getMailTemplate(row.id) });
        } catch {
            setProblem(t('The template could not be opened. Please try again.'));
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
                            <th scope="col">{t('Template')}</th>
                            <th scope="col">{rows[0]?.isEmail === false ? t('Title') : t('Subject')}</th>
                            <th scope="col">{t('Sent When')}</th>
                            <th scope="col" className="col-status">
                                {t('Status')}
                            </th>
                            <th scope="col" className="col-date">
                                {t('Updated On')}
                            </th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => {
                            const badge = templateBadgeOf(row.status);
                            return (
                                <tr key={row.key}>
                                    <td className="col-sno">{index + 1}</td>
                                    <td>
                                        <button type="button" className="em-link" onClick={() => void view(row)}>
                                            {row.name}
                                        </button>
                                    </td>
                                    <td>{row.subject}</td>
                                    <td>{row.sentWhen ?? '–'}</td>
                                    <td className="col-status">
                                        <span className={badge.className}>{t(badge.label)}</span>
                                    </td>
                                    <td className="col-date">{formatDate(row.updatedAt)}</td>
                                    <td className="col-actions">
                                        <button
                                            type="button"
                                            className="btn-icon"
                                            aria-label={t('View')}
                                            data-tooltip={t('View')}
                                            onClick={() => void view(row)}
                                        >
                                            <ViewIcon />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={COLUMNS} className="mt-empty">
                                    {t('No templates found.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {open && <TemplateDialog row={open.row} mail={open.mail} onClose={() => setOpen(null)} />}
            {problem && <Toast message={problem} onClose={() => setProblem(null)} />}
        </>
    );
}
