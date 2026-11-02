'use client';

import { useEffect } from 'react';

import { FramedErrorPage } from '@/components/layout/framed-error-page';
import { errorDetailOf } from '@/components/layout/status-page';
import { logger } from '@/lib/logger';

export default function ConsoleError({ error }: { readonly error: Error & { digest?: string } }) {
    useEffect(() => {
        logger.category('browser.render').error('Page crashed while rendering', { error, digest: error.digest });
    }, [error]);

    return <FramedErrorPage detail={errorDetailOf(error)} />;
}
