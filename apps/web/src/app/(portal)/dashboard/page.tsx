import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { consoleSession } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await serverTranslator()).t('Dashboard') });

export default async function DashboardPage() {
    const session = await consoleSession();
    if (!session) redirect('/login');
    return <DashboardOverview name={session.user.name} />;
}
