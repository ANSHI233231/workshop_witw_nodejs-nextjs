'use client';

import { type ReactNode, useEffect, useState } from 'react';

import { AlertCircleIcon, CloseIcon, CopyIcon, ViewIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { copyText } from '@/lib/clipboard';
import { formatDateTime } from '@/lib/format';
import { getAppLog } from '@/services/app-log.service';
import type { AppLogDetail, AppLogItem } from '@/types/app-log.types';

import { LEVEL_MARKS, SOURCE_LABELS } from './app-log-labels';

type Notice = { readonly message: string; readonly isError: boolean };

const COLUMNS = 10;

const EMPTY = '–';

const userOf = (entry: AppLogItem): string | null =>
    entry.userName ? `${entry.userName} (#${entry.userId})` : entry.userId ? `#${entry.userId}` : null;

const contextText = (context: unknown, key: string): string | null => {
    if (typeof context !== 'object' || context === null) return null;
    const value = (context as Record<string, unknown>)[key];
    return typeof value === 'string' && value ? value : null;
};

const routeOf = (entry: AppLogDetail): string | null => {
    if (entry.requestUrl) return `${entry.httpMethod ? `${entry.httpMethod} ` : ''}${entry.requestUrl}`;
    return contextText(entry.logContext, 'page') ?? contextText(entry.logContext, 'routePath');
};

const stackOf = (entry: AppLogDetail): string => {
    if (entry.errorStack) return entry.errorStack;
    if (entry.errorName) return `${entry.errorName}${entry.errorMessage ? `: ${entry.errorMessage}` : ''}`;
    return EMPTY;
};

function OrEmpty({ value }: { readonly value: string | null }) {
    return value ?? <span className="empty-value">{EMPTY}</span>;
}

function Item({
    label,
    mono = false,
    children,
}: {
    readonly label: string;
    readonly mono?: boolean;
    readonly children: ReactNode;
}) {
    return (
        <div className="el-item">
            <dt>{label}</dt>
            <dd className={mono ? 'el-mono' : undefined}>{children}</dd>
        </div>
    );
}

function LevelMark({ level }: { readonly level: AppLogItem['logLevel'] }) {
    const t = useT();
    const mark = LEVEL_MARKS[level];
    return <span className={`el-lv${mark.tone}`}>{t(mark.label)}</span>;
}

function AppLogDialog({
    entry,
    onClose,
    onCopied,
}: {
    readonly entry: AppLogDetail;
    readonly onClose: () => void;
    readonly onCopied: (notice: Notice) => void;
}) {
    const t = useT();
    useEffect(() => {
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [onClose]);

    const copyRequestId = async () => {
        if (!entry.requestId) {
            onCopied({ message: t('This error has no request ID.'), isError: true });
            return;
        }
        onCopied(
            (await copyText(entry.requestId))
                ? { message: t('Request ID copied.'), isError: false }
                : { message: t('The request ID could not be copied.'), isError: true },
        );
    };

    const context = entry.logContext === null || entry.logContext === undefined ? null : entry.logContext;
    return (
        <div className="overlay" onClick={onClose}>
            <div
                className="modal el-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="el-t"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-head">
                    <h2 className="modal-title el-mt" id="el-t">
                        <span className={`el-mic${LEVEL_MARKS[entry.logLevel].tone === ' is-warn' ? ' is-warn' : ''}`}>
                            <AlertCircleIcon />
                        </span>
                        {t('Error Details #{id}', { id: entry.id })}
                    </h2>
                    <button
                        type="button"
                        className="btn-icon"
                        aria-label={t('Close')}
                        data-tooltip={t('Close')}
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="el-headline">{entry.message}</div>
                    <dl className="el-grid">
                        <Item label={t('Level')}>
                            <LevelMark level={entry.logLevel} />
                        </Item>
                        <Item label={t('App')}>{t(SOURCE_LABELS[entry.sourceApp])}</Item>
                        <Item label={t('Category')}>{entry.category}</Item>
                        <Item label={t('Date & Time')}>{formatDateTime(entry.loggedAt)}</Item>
                        <Item label={t('User')}>{userOf(entry) ?? EMPTY}</Item>
                        <Item label={t('IP address')} mono>
                            {entry.ipAddress ?? EMPTY}
                        </Item>
                        <Item label={t('Page / Route')} mono>
                            {routeOf(entry) ?? EMPTY}
                        </Item>
                    </dl>
                    <div className="el-box">
                        <div className="el-box-h">
                            <span>{t('Request ID')}</span>
                            <button type="button" className="btn btn-text el-copy" onClick={() => void copyRequestId()}>
                                <CopyIcon />
                                {t('Copy')}
                            </button>
                        </div>
                        <code>{entry.requestId ?? EMPTY}</code>
                    </div>
                    <div className="el-box">
                        <span>{t('Stack trace')}</span>
                        <pre className="el-pre">{stackOf(entry)}</pre>
                    </div>
                    {entry.userAgent && (
                        <div className="el-box">
                            <span>{t('Browser')}</span>
                            <code>{entry.userAgent}</code>
                        </div>
                    )}
                    {context !== null && (
                        <div className="el-box">
                            <span>{t('Context')}</span>
                            <code className="el-ctx">{JSON.stringify(context, null, 2)}</code>
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

export function AppLogTable({
    rows,
    firstSerial,
}: {
    readonly rows: readonly AppLogItem[];
    readonly firstSerial: number;
}) {
    const t = useT();
    const [opened, setOpened] = useState<AppLogDetail | null>(null);
    const [toast, setToast] = useState<Notice | null>(null);

    const view = async (id: number) => {
        try {
            setOpened(await getAppLog(id));
        } catch {
            setToast({ message: t('The log entry could not be opened. Please try again.'), isError: true });
        }
    };

    return (
        <>
            <div className="table-scroll">
                <table className="table el-table">
                    <thead>
                        <tr>
                            <th scope="col" className="col-sno">
                                {t('S.No')}
                            </th>
                            <th scope="col">{t('Date & Time')}</th>
                            <th scope="col">{t('App')}</th>
                            <th scope="col">{t('Level')}</th>
                            <th scope="col">{t('Category')}</th>
                            <th scope="col">{t('Message')}</th>
                            <th scope="col">{t('Request ID')}</th>
                            <th scope="col">{t('User')}</th>
                            <th scope="col">{t('IP')}</th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => {
                            return (
                                <tr key={row.id}>
                                    <td className="col-sno">{firstSerial + index}</td>
                                    <td className="el-nw">{formatDateTime(row.loggedAt)}</td>
                                    <td className="el-nw">{t(SOURCE_LABELS[row.sourceApp])}</td>
                                    <td>
                                        <LevelMark level={row.logLevel} />
                                    </td>
                                    <td className="el-nw">{row.category}</td>
                                    <td className="el-msg" title={row.message}>
                                        {row.message}
                                    </td>
                                    <td className="el-nw el-mono">
                                        <OrEmpty value={row.requestId} />
                                    </td>
                                    <td className="el-nw">
                                        <OrEmpty value={userOf(row)} />
                                    </td>
                                    <td className="el-nw el-mono">
                                        <OrEmpty value={row.ipAddress} />
                                    </td>
                                    <td className="col-actions">
                                        <button
                                            type="button"
                                            className="btn-icon"
                                            aria-label={t('View error')}
                                            data-tooltip={t('View')}
                                            onClick={() => void view(row.id)}
                                        >
                                            <ViewIcon />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={COLUMNS} className="el-empty">
                                    {t('No errors match these filters.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {opened && <AppLogDialog entry={opened} onClose={() => setOpened(null)} onCopied={setToast} />}
            {toast && <Toast message={toast.message} isError={toast.isError} onClose={() => setToast(null)} />}
        </>
    );
}
