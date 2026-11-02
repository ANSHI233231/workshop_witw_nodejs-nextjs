import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { SystemLogBoard } from '@/components/system-log/system-log-board';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { type PageSearchParams, singleParam } from '@/lib/search-params';
import { listLogApps } from '@/services/system-log.service';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { type LogApp, LOG_APPS } from '@/types/system-log.types';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await serverTranslator()).t('System Logs') });

const appOf = (value: string): LogApp => LOG_APPS.find((app) => app === value) ?? 'api';

export default async function SystemLogsPage({ searchParams }: { readonly searchParams: Promise<PageSearchParams> }) {
    await requireConsoleArea('platform');
    const app = appOf(singleParam((await searchParams)['app']));
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const apps = await listLogApps(accessToken);
    return <SystemLogBoard app={app} info={apps.find((entry) => entry.app === app)} />;
}
