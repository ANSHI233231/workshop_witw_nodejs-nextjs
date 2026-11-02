import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { consoleSession } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { getUsersSummary } from '@/services/dashboard.service';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await serverTranslator()).t('Dashboard') });

export default async function DashboardPage() {
    const session = await consoleSession();
    if (!session) redirect('/login');
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    return <DashboardOverview users={await getUsersSummary(accessToken)} />;
}
