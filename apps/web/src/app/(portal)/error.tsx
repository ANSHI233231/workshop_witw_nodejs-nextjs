'use client';

import { useEffect } from 'react';

import { errorDetailOf, StatusPage } from '@/components/layout/status-page';
import { logger } from '@/lib/logger';

export default function ConsolePageError({ error }: { readonly error: Error & { digest?: string } }) {
    useEffect(() => {
        logger.category('browser.render').error('Page crashed while rendering', { error, digest: error.digest });
    }, [error]);

    return <StatusPage kind="error" framed detail={errorDetailOf(error)} />;
}
