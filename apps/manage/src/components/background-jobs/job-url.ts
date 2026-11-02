import { listUrl } from '@/lib/list-url';
import { type JobFilters, type JobRunFilters, JobTab, type JobTabKey } from '@/types/job.types';

export const BACKGROUND_JOBS_PATH = '/background-jobs';

export const jobListParams = (filters: JobFilters) =>
    filters.tab === JobTab.SCHEDULED
        ? { search: filters.search, status: filters.status }
        : {
              tab: filters.tab,
              search: filters.search,
              status: filters.status,
              scheduleId: filters.tab === JobTab.LOGS ? filters.scheduleId : undefined,
              trigger: filters.tab === JobTab.LOGS ? filters.trigger : undefined,
              from: filters.tab === JobTab.LOGS ? filters.from : undefined,
              to: filters.tab === JobTab.LOGS ? filters.to : undefined,
              errorsOnly: filters.tab === JobTab.LOGS && filters.errorsOnly ? '1' : undefined,
          };

export const jobsUrl = (filters: JobFilters): string =>
    listUrl(BACKGROUND_JOBS_PATH, { ...jobListParams(filters), page: filters.page });

export const emptyRunFilters = (tab: JobRunFilters['tab']): JobRunFilters => ({
    tab,
    search: '',
    status: undefined,
    scheduleId: undefined,
    trigger: undefined,
    from: undefined,
    to: undefined,
    errorsOnly: false,
    page: 1,
});

export const tabUrl = (tab: JobTabKey): string =>
    tab === JobTab.SCHEDULED ? BACKGROUND_JOBS_PATH : jobsUrl(emptyRunFilters(tab));

export const scheduleLogsUrl = (scheduleId: number): string => jobsUrl({ ...emptyRunFilters(JobTab.LOGS), scheduleId });
