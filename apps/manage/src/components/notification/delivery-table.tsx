'use client';

import { useState } from 'react';

import { ViewIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { formatDateTime } from '@/lib/format';
import { getMailLog } from '@/services/mail.service';
import { getInAppDelivery } from '@/services/notification.service';
import type { MailLogDetail } from '@/types/mail.types';
import { DeliveryChannel, type DeliveryItem, DeliveryStatus, type InAppDelivery } from '@/types/notification.types';

import { CHANNELS, DELIVERY_BADGES, MAIL_DELIVERY_STATUS } from './notification-labels';
import { MetaItem, NotificationModal } from './notification-modal';
import { BellPreview, EmailPreview, fillTemplate } from './notification-previews';

const COLUMNS = 8;

const APP_NAMES: Readonly<Record<number, string>> = { 1: 'Console', 2: 'Portal' };

type Opened =
    | { readonly kind: 'email'; readonly mail: MailLogDetail }
    | { readonly kind: 'in-app'; readonly item: InAppDelivery };

function ChannelBadge({ channel }: { readonly channel: DeliveryItem['channel'] }) {
    const t = useT();
    return <span className={`na-ch is-${CHANNELS[channel].key}`}>{t(CHANNELS[channel].label)}</span>;
}

function EmailDialog({ mail, onClose }: { readonly mail: MailLogDetail; readonly onClose: () => void }) {
    const t = useT();
    const badge = DELIVERY_BADGES[MAIL_DELIVERY_STATUS[mail.status] ?? DeliveryStatus.CAPTURED];
    return (
        <NotificationModal title={t('Email Details')} label="Delivery Details" onClose={onClose}>
            <dl className="em-meta">
                <MetaItem label="To">{mail.recipientEmail}</MetaItem>
                <MetaItem label="Channel">
                    <ChannelBadge channel={DeliveryChannel.EMAIL} />
                </MetaItem>
                <MetaItem label="From">{mail.senderEmail}</MetaItem>
                <MetaItem label="Template">{mail.templateName ?? mail.templateCode ?? '–'}</MetaItem>
                <MetaItem label="Sent On">{formatDateTime(mail.createdAt)}</MetaItem>
                <MetaItem label="Status">
                    <span className={badge.className}>{t(badge.label)}</span>
                </MetaItem>
                <MetaItem label="Subject" wide>
                    {mail.subject}
                </MetaItem>
                {mail.errorMessage && (
                    <MetaItem label="Failure Reason" wide>
                        <span className="em-reason">{mail.errorMessage}</span>
                    </MetaItem>
                )}
            </dl>
            <EmailPreview title={mail.subject} html={mail.bodyHtml} />
        </NotificationModal>
    );
}

function InAppDialog({ item, onClose }: { readonly item: InAppDelivery; readonly onClose: () => void }) {
    const t = useT();
    const badge = DELIVERY_BADGES[item.status];
    const sentence = item.titleTemplate
        ? fillTemplate(item.titleTemplate, {
              actor: item.actorName ?? 'the system',
              subject: item.title,
          })
        : item.title;
    return (
        <NotificationModal title={t('Notification Details')} label="Delivery Details" onClose={onClose}>
            <dl className="em-meta">
                <MetaItem label="To">{item.recipient}</MetaItem>
                <MetaItem label="Channel">
                    <ChannelBadge channel={DeliveryChannel.IN_APP} />
                </MetaItem>
                <MetaItem label="Template">{item.templateName ?? '–'}</MetaItem>
                <MetaItem label="Sent On">{formatDateTime(item.sentAt)}</MetaItem>
                <MetaItem label="Status">
                    <span className={badge.className}>{t(badge.label)}</span>
                </MetaItem>
                <MetaItem label="App">{t(APP_NAMES[item.clientApp] ?? 'App')}</MetaItem>
                {item.readAt && <MetaItem label="Read On">{formatDateTime(item.readAt)}</MetaItem>}
                <MetaItem label="Title" wide>
                    {item.title}
                </MetaItem>
            </dl>
            <BellPreview
                app={APP_NAMES[item.clientApp] ?? 'App'}
                title={sentence}
                message={item.excerpt}
                when={formatDateTime(item.sentAt)}
                opens={item.opens}
            />
        </NotificationModal>
    );
}

export function DeliveryTable({
    rows,
    firstSerial,
}: {
    readonly rows: readonly DeliveryItem[];
    readonly firstSerial: number;
}) {
    const [opened, setOpened] = useState<Opened | null>(null);
    const t = useT();
    const [problem, setProblem] = useState<string | null>(null);

    const view = async (row: DeliveryItem) => {
        try {
            setOpened(
                row.channel === DeliveryChannel.EMAIL
                    ? { kind: 'email', mail: await getMailLog(row.id) }
                    : { kind: 'in-app', item: await getInAppDelivery(row.id) },
            );
        } catch {
            setProblem(t('The details could not be opened. Please try again.'));
        }
    };

    return (
        <>
            <div className="table-scroll">
                <table className="table na-log">
                    <thead>
                        <tr>
                            <th scope="col" className="col-sno">
                                {t('S.No')}
                            </th>
                            <th scope="col">{t('Channel')}</th>
                            <th scope="col">{t('To')}</th>
                            <th scope="col">{t('Subject / Title')}</th>
                            <th scope="col">{t('Template')}</th>
                            <th scope="col" className="col-date">
                                {t('Sent On')}
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
                            const badge = DELIVERY_BADGES[row.status];
                            return (
                                <tr key={`${row.channel}-${row.id}`}>
                                    <td className="col-sno">{firstSerial + index}</td>
                                    <td>
                                        <ChannelBadge channel={row.channel} />
                                    </td>
                                    <td title={row.recipient}>{row.recipient}</td>
                                    <td title={row.title}>{row.title}</td>
                                    <td>{row.templateName ?? '–'}</td>
                                    <td className="col-date">{formatDateTime(row.sentAt)}</td>
                                    <td className="col-status">
                                        <span className={badge.className}>{t(badge.label)}</span>
                                    </td>
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
                                    {t('No deliveries found.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {opened?.kind === 'email' && <EmailDialog mail={opened.mail} onClose={() => setOpened(null)} />}
            {opened?.kind === 'in-app' && <InAppDialog item={opened.item} onClose={() => setOpened(null)} />}
            {problem && <Toast message={problem} onClose={() => setProblem(null)} />}
        </>
    );
}
