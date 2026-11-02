'use client';

import { useEffect } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { formatDateTime } from '@/lib/format';
import type { AuditLogDetail } from '@/types/audit.types';

import { actorOf, entityOf } from './audit-actor';
import { appLabelOf, labelOf, OUTCOME_BADGES, titleOf } from './audit-labels';

type ChangeRow = { readonly field: string; readonly from: unknown; readonly to: unknown };

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isFromTo = (value: unknown): value is { readonly from: unknown; readonly to: unknown } =>
    isRecord(value) && 'from' in value && 'to' in value;

const changeRowsOf = (changes: unknown): readonly ChangeRow[] | null => {
    if (!isRecord(changes)) return null;
    return Object.entries(changes).map(([field, value]) =>
        isFromTo(value) ? { field, from: value.from, to: value.to } : { field, from: undefined, to: value },
    );
};

const shown = (value: unknown): string => {
    if (value === undefined || value === null || value === '') return '–';
    return typeof value === 'string' ? value : JSON.stringify(value);
};

const hasContent = (value: unknown): boolean =>
    value !== null && value !== undefined && !(isRecord(value) && Object.keys(value).length === 0);

export function AuditLogDialog({ event, onClose }: { readonly event: AuditLogDetail; readonly onClose: () => void }) {
    const t = useT();
    useEffect(() => {
        const closeOnEscape = (keyEvent: KeyboardEvent) => {
            if (keyEvent.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [onClose]);

    const badge = OUTCOME_BADGES[event.outcome];
    const actor = actorOf(event, t);
    const changes = changeRowsOf(event.changes);
    return (
        <div className="overlay" onClick={onClose}>
            <div
                className="modal al-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="al-t"
                onClick={(clickEvent) => clickEvent.stopPropagation()}
            >
                <div className="modal-head">
                    <h2 className="modal-title al-mt" id="al-t">
                        <span className="al-mic">
                            <svg
                                className="icon "
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M15 12h-5"></path>
                                <path d="M15 8h-5"></path>
                                <path d="M19 17V5a2 2 0 0 0-2-2H4"></path>
                                <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"></path>
                            </svg>
                        </span>
                        {t('Event Details #{id}', { id: event.id })}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <dl className="al-grid">
                        <div className="al-item">
                            <dt>{t('Action')}</dt>
                            <dd>{labelOf(event.actionName)}</dd>
                        </div>
                        <div className="al-item">
                            <dt>{t('Module')}</dt>
                            <dd>{titleOf(event.moduleName)}</dd>
                        </div>
                        <div className="al-item">
                            <dt>{t('Outcome')}</dt>
                            <dd>{badge ? <span className={badge.className}>{t(badge.label)}</span> : '–'}</dd>
                        </div>
                        <div className="al-item">
                            <dt>{t('Date & Time')}</dt>
                            <dd>{formatDateTime(event.createdAt)}</dd>
                        </div>
                        <div className="al-item">
                            <dt>{t('Actor')}</dt>
                            <dd>
                                {actor.name}
                                {actor.detail && ` (${actor.detail})`}
                            </dd>
                        </div>
                        <div className="al-item">
                            <dt>{t('Entity')}</dt>
                            <dd>{entityOf(event) ?? '–'}</dd>
                        </div>
                        <div className="al-item">
                            <dt>{t('App')}</dt>
                            <dd>{t(appLabelOf(event.clientAppName))}</dd>
                        </div>
                        <div className="al-item">
                            <dt>{t('IP Address')}</dt>
                            <dd>{event.ipAddress ?? '–'}</dd>
                        </div>
                    </dl>
                    <div className="al-box">
                        <span>{t('Request ID')}</span>
                        <code>{event.requestId ?? '–'}</code>
                    </div>
                    <div className="al-box">
                        <span>{t('Browser')}</span>
                        <code>{event.userAgent ?? '–'}</code>
                    </div>
                    {changes && changes.length > 0 && (
                        <div className="al-box">
                            <span>{t('Changes')}</span>
                            <code className="al-pre">
                                {changes
                                    .map((change) => `${change.field}: ${shown(change.from)} → ${shown(change.to)}`)
                                    .join('\n')}
                            </code>
                        </div>
                    )}
                    {!changes && hasContent(event.changes) && (
                        <div className="al-box">
                            <span>{t('Changes')}</span>
                            <code className="al-pre">{JSON.stringify(event.changes, null, 2)}</code>
                        </div>
                    )}
                    {hasContent(event.details) && (
                        <div className="al-box">
                            <span>{t('Details')}</span>
                            <code className="al-pre">{JSON.stringify(event.details, null, 2)}</code>
                        </div>
                    )}
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
