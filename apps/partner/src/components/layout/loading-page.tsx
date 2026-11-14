'use client';

import { useT } from '@/hooks/i18n/use-t';

import { StatusFrame, StatusLogo } from './status-page';

export function LoadingPage({ framed = false }: { readonly framed?: boolean }) {
    const t = useT();
    return (
        <StatusFrame framed={framed}>
            <section className="e4-card" role="status" aria-live="polite" aria-label={t('Loading')}>
                {!framed && <StatusLogo />}
                <div className="ld-bar" aria-hidden="true">
                    <span></span>
                </div>
                <p className="ld-title">{t('Loading…')}</p>
                <p className="ld-text">{t('Please wait while we get things ready for you.')}</p>
            </section>
        </StatusFrame>
    );
}
