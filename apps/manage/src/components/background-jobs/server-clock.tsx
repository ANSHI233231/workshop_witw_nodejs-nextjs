'use client';

import { ClockIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';

import { formatClock } from './job-time';

export function ServerClock({ now }: { readonly now: Date | null }) {
    const t = useT();
    return (
        <div className="bj-clock" aria-live="off">
            <ClockIcon />
            <span>{t('Server time (IST)')}</span>
            <b>{now ? formatClock(now) : '…'}</b>
        </div>
    );
}
