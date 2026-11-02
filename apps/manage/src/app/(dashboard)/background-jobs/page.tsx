import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { BackgroundJobs, type BackgroundJobsResult } from '@/components/background-jobs/background-jobs';
import { RUN_STATUS_OPTIONS, SCHEDULE_STATUS_OPTIONS, TRIGGER_OPTIONS } from '@/components/background-jobs/job-labels';
import { jobsUrl } from '@/components/background-jobs/job-url';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { codeParam, idParam, type PageSearchParams, pageParam, searchParam, singleParam } from '@/lib/search-params';
import { listJobRuns, listJobScheduleOptions, listJobSchedules } from '@/services/job.service';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { JOB_LIMITS, type JobFilters, JobTab } from '@/types/job.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Background Jobs'),
});

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const dayParam = (value: string | string[] | undefined): string | undefined => {
    const day = singleParam(value);
    return DAY_PATTERN.test(day) && !Number.isNaN(Date.parse(day)) ? day : undefined;
};

const values = <T extends number>(options: readonly { readonly value: T }[]): readonly T[] =>
    options.map((option) => option.value);

const toFilters = (params: PageSearchParams): JobFilters => {
    const tab = singleParam(params['tab']);
    const search = searchParam(params['search'], JOB_LIMITS.SEARCH);
    const page = pageParam(params['page']);
    if (tab !== JobTab.ONE_TIME && tab !== JobTab.LOGS) {
        return {
            tab: JobTab.SCHEDULED,
            search,
            status: codeParam(params['status'], values(SCHEDULE_STATUS_OPTIONS)),
            page,
        };
    }
    const logs = tab === JobTab.LOGS;
    const from = logs ? dayParam(params['from']) : undefined;
    const to = logs ? dayParam(params['to']) : undefined;
    return {
        tab,
        search,
        status: codeParam(params['status'], values(RUN_STATUS_OPTIONS)),
        scheduleId: logs ? idParam(params['scheduleId']) : undefined,
        trigger: logs ? codeParam(params['trigger'], values(TRIGGER_OPTIONS)) : undefined,
        from,
        to: from && to && to < from ? undefined : to,
        errorsOnly: logs && singleParam(params['errorsOnly']) === '1',
        page,
    };
};

const loadResult = async (filters: JobFilters, accessToken: string | undefined): Promise<BackgroundJobsResult> =>
    filters.tab === JobTab.SCHEDULED
        ? { kind: 'schedules', filters, page: await listJobSchedules(filters, accessToken) }
        : { kind: 'runs', filters, page: await listJobRuns(filters, accessToken) };

export default async function BackgroundJobsPage({
    searchParams,
}: {
    readonly searchParams: Promise<PageSearchParams>;
}) {
    await requireConsoleArea('platform');
    const filters = toFilters(await searchParams);
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const [result, schedules] = await Promise.all([
        loadResult(filters, accessToken),
        filters.tab === JobTab.LOGS ? listJobScheduleOptions(accessToken) : Promise.resolve([]),
    ]);
    const { totalPages } = result.page.meta;
    if (filters.page > totalPages && totalPages > 0) redirect(jobsUrl({ ...filters, page: totalPages }));
    return <BackgroundJobs result={result} schedules={schedules} />;
}
