'use client';

import { useEffect, useState } from 'react';

import { CloseIcon, DownloadIcon, ExpandIcon, RefreshIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { formatFileSize } from '@/lib/format';
import { logDownloadUrl } from '@/services/system-log.service';
import { LOG_APP_LABEL, type LogApp, type LogFileInfo } from '@/types/system-log.types';

import { LogViewer } from './log-viewer';

const sizeOf = (file: LogFileInfo, name: string): number =>
    name === file.name ? file.sizeBytes : (file.copies.find((copy) => copy.name === name)?.sizeBytes ?? 0);

function CardHead({
    app,
    file,
    name,
    onChoose,
    onRefresh,
    onExpand,
    onClose,
}: {
    readonly app: LogApp;
    readonly file: LogFileInfo;
    readonly name: string;
    readonly onChoose: (name: string) => void;
    readonly onRefresh: () => void;
    readonly onExpand?: () => void;
    readonly onClose?: () => void;
}) {
    const t = useT();
    return (
        <div className="sl-head">
            <div className="sl-title">
                <b>
                    {t(LOG_APP_LABEL[app])} {name}
                </b>
                <span>{formatFileSize(sizeOf(file, name))}</span>
                {file.copies.length > 0 && (
                    <select
                        className="select sl-copy"
                        aria-label={t('Copy of {name}', { name: file.name })}
                        value={name}
                        onChange={(event) => onChoose(event.target.value)}
                    >
                        <option value={file.name}>{t('Current')}</option>
                        {file.copies.map((copy) => (
                            <option key={copy.name} value={copy.name}>
                                {t('Older copy {copy} ({name})', { copy: copy.copy, name: copy.name })}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            <div className="sl-acts">
                <button
                    type="button"
                    className="btn-icon"
                    aria-label={t('Refresh')}
                    data-tooltip={t('Refresh')}
                    onClick={onRefresh}
                >
                    <RefreshIcon />
                </button>
                <a className="btn-icon" aria-label={t('Download')} data-tooltip={t('Download')} href={logDownloadUrl(app, name)}>
                    <DownloadIcon />
                </a>
                {onExpand && (
                    <button
                        type="button"
                        className="btn-icon"
                        aria-label={t('Expand')}
                        data-tooltip={t('Expand')}
                        onClick={onExpand}
                    >
                        <ExpandIcon />
                    </button>
                )}
                {onClose && (
                    <button
                        type="button"
                        className="btn-icon"
                        aria-label={t('Close')}
                        data-tooltip={t('Close')}
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </button>
                )}
            </div>
        </div>
    );
}

export function LogCard({
    app,
    file,
    reloadAll,
}: {
    readonly app: LogApp;
    readonly file: LogFileInfo;
    readonly reloadAll: number;
}) {
    const [name, setName] = useState(file.name);
    const [reload, setReload] = useState(0);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!expanded) return;
        const close = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setExpanded(false);
        };
        window.addEventListener('keydown', close);
        return () => window.removeEventListener('keydown', close);
    }, [expanded]);

    const head = (inModal: boolean) => (
        <CardHead
            app={app}
            file={file}
            name={name}
            onChoose={setName}
            onRefresh={() => setReload((value) => value + 1)}
            onExpand={inModal ? undefined : () => setExpanded(true)}
            onClose={inModal ? () => setExpanded(false) : undefined}
        />
    );

    return (
        <section className="sl-card">
            {head(false)}
            <LogViewer app={app} name={name} reload={reload + reloadAll} />
            {expanded && (
                <div className="overlay sl-overlay">
                    <div className="sl-card sl-full" role="dialog" aria-modal="true" aria-label={`${app} ${name}`}>
                        {head(true)}
                        <LogViewer app={app} name={name} reload={reload + reloadAll} isTall />
                    </div>
                </div>
            )}
        </section>
    );
}
