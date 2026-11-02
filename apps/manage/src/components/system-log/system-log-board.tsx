'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { BreadcrumbChevronIcon, RefreshIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { LOG_APP_LABEL, LOG_APPS, type LogApp, type LogAppInfo } from '@/types/system-log.types';

import { LogCard } from './log-card';

export const SYSTEM_LOGS_PATH = '/system-logs';

export const systemLogsUrl = (app: LogApp): string =>
    app === 'api' ? SYSTEM_LOGS_PATH : `${SYSTEM_LOGS_PATH}?app=${app}`;

export function SystemLogBoard({ app, info }: { readonly app: LogApp; readonly info: LogAppInfo | undefined }) {
    const t = useT();
    const router = useRouter();
    const [reloadAll, setReloadAll] = useState(0);
    const files = info?.files ?? [];
    return (
        <div className="page">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Logs')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('System Logs')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('System Logs')}</h1>
                    <div className="actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setReloadAll((value) => value + 1);
                                router.refresh();
                            }}
                        >
                            <RefreshIcon />
                            {t('Refresh Log Files')}
                        </button>
                    </div>
                </div>
            </div>
            <div className="table-card sl-tabs-card">
                <div className="mtabs" role="tablist">
                    {LOG_APPS.map((tab) => (
                        <Link
                            key={tab}
                            className={tab === app ? 'mtab is-on' : 'mtab'}
                            role="tab"
                            aria-selected={tab === app}
                            href={systemLogsUrl(tab)}
                        >
                            {t(LOG_APP_LABEL[tab])}
                        </Link>
                    ))}
                </div>
            </div>
            {!info?.isConfigured ? (
                <p className="sl-empty">
                    {t("The log folder of this app is not set (LOG_VIEWER_DIRS in the API's .env).")}
                </p>
            ) : files.length === 0 ? (
                <p className="sl-empty">{t('This app has not written any log files yet.')}</p>
            ) : (
                <div className="sl-grid">
                    {files.map((file) => (
                        <LogCard key={`${app}-${file.name}`} app={app} file={file} reloadAll={reloadAll} />
                    ))}
                </div>
            )}
        </div>
    );
}
