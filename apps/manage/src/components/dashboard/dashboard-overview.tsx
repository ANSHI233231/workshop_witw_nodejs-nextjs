import Link from 'next/link';

import { formatCount } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { UsersSummary } from '@/types/dashboard.types';

const PLATFORM_LINKS = [
    { href: '/audit-log', title: 'Audit Log', text: 'Who did what, from every app.' },
    { href: '/error-logs', title: 'Error Logs', text: 'Server and browser errors of every app.' },
    { href: '/system-logs', title: 'System Logs', text: 'The log files of the API and the apps.' },
    { href: '/background-jobs', title: 'Background Jobs', text: 'Scheduled and one-time CLI commands.' },
    { href: '/languages/translations', title: 'App Translations', text: 'Screen text in every language.' },
    { href: '/docs', title: 'Tech Documentation', text: 'The docs folder of this repo.' },
] as const;

export async function DashboardOverview({ users }: { readonly users: UsersSummary }) {
    const { t } = await serverTranslator();
    return (
        <div className="page">
            <div className="page-head">
                <h1 className="page-title">{t('Dashboard')}</h1>
            </div>
            <div className="kpi-row">
                <div className="card kpi">
                    <div className="kpi-top">
                        <span className="kpi-label">{t('Users')}</span>
                        <span className="kpi-ic">
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
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                            </svg>
                        </span>
                    </div>
                    <div className="kpi-value">{formatCount(users.total)}</div>
                    <div className="kpi-meta">{t('{count} active', { count: formatCount(users.active) })}</div>
                </div>
            </div>
            <div className="grid-3">
                {PLATFORM_LINKS.map((link) => (
                    <div key={link.href} className="card portal-card">
                        <div className="card-title">
                            <span>{t(link.title)}</span>
                            <Link href={link.href} className="btn btn-text">
                                {t('Open')}
                            </Link>
                        </div>
                        <p className="kpi-meta">{t(link.text)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
