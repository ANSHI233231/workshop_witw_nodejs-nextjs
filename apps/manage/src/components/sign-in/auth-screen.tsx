import type { ReactNode } from 'react';

import { serverTranslator } from '@/lib/i18n/server-translator';
import { WitwLogo } from '@/components/ui/witw-logo';

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
                        <WitwLogo />
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
