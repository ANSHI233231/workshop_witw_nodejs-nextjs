'use client';

import { useEffect } from 'react';

import { errorDetailOf, StatusPage } from '@/components/layout/status-page';
import { useT } from '@/hooks/i18n/use-t';
import { roboto } from '@/lib/fonts';
import { logger } from '@/lib/logger';

import './globals.css';
import './console-extras.css';

export default function GlobalError({ error }: { readonly error: Error & { digest?: string } }) {
    const t = useT();
    useEffect(() => {
        logger.category('browser.render').error('Root layout crashed', { error, digest: error.digest });
    }, [error]);

    return (
        <html lang="en" className={roboto.variable}>
            <body suppressHydrationWarning>
                <title>{`${t('Something went wrong')} | ${t('Portal')}`}</title>
                <div className="root" data-portal="web">
                    <StatusPage kind="error" detail={errorDetailOf(error)} />
                </div>
            </body>
        </html>
    );
}
