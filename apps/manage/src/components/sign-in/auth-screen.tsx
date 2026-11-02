import type { ReactNode } from 'react';

import { serverTranslator } from '@/lib/i18n/server-translator';

export async function AuthScreen({ children }: { readonly children: ReactNode }) {
    const { t } = await serverTranslator();
    return (
        <div className="admin-auth">
            {' '}
            <div className="admin-side">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <span
                        className="wordmark-mark"
                        style={{ background: 'var(--color-surface)', color: 'var(--color-primary)' }}
                    >
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
                            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>{' '}
                            <path d="m9 12 2 2 4-4"></path>
                        </svg>
                    </span>
                    <span style={{ font: 'var(--text-section)' }}>{t('Admin Console')}</span>
                </div>{' '}
                <h1>{t('Manage the whole platform from one place.')}</h1>
                <p>{t('Users, roles, logs, background jobs and languages for every app.')}</p>{' '}
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    <li>{t('User and role control')}</li>
                    <li>{t('Audit, error and system logs')}</li>
                    <li>{t('Background jobs')}</li>
                    <li>{t('Languages and translations')}</li>
                </ul>
            </div>{' '}
            <div className="admin-form">{children}</div>
        </div>
    );
}
