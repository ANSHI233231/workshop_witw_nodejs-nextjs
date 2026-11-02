'use client';

import Link from 'next/link';

import { useT } from '@/hooks/i18n/use-t';
import { JobTab, type JobTabKey } from '@/types/job.types';

import { tabUrl } from './job-url';

const TABS: readonly { readonly key: JobTabKey; readonly label: string }[] = [
    { key: JobTab.SCHEDULED, label: 'Scheduled' },
    { key: JobTab.ONE_TIME, label: 'One-time' },
    { key: JobTab.LOGS, label: 'Logs' },
];

export function JobTabs({ current }: { readonly current: JobTabKey }) {
    const t = useT();
    return (
        <div className="mtabs" role="tablist">
            {TABS.map((tab) => (
                <Link
                    key={tab.key}
                    className={tab.key === current ? 'mtab is-on' : 'mtab'}
                    role="tab"
                    aria-selected={tab.key === current}
                    href={tabUrl(tab.key)}
                >
                    {t(tab.label)}
                </Link>
            ))}
        </div>
    );
}
