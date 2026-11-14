'use client';

import { useT } from '@/hooks/i18n/use-t';

export function PortalFooter() {
    const t = useT();
    return (
        <footer className="app-footer">
            <span>{t('© {year} All rights reserved.', { year: String(new Date().getFullYear()) })}</span>
        </footer>
    );
}
