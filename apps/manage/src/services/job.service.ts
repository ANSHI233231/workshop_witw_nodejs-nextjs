import type { Paginated } from '@/types/api.types';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type {
    JobCommand,
    JobRun,
    JobRunBody,
    JobRunDetail,
    JobRunFilters,
    JobSchedule,
    JobScheduleBody,
    JobScheduleFilters,
    JobScheduleStatusCode,
} from '@/types/job.types';

import { apiClient } from './api-client';

export const JOB_ROWS_PER_PAGE = 20;

const JOB_OPTIONS_LIMIT = 100;

const PATH = '/jobs';

const INDIA_OFFSET = '+05:30';

const DAY_MS = 24 * 60 * 60 * 1000;

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const indiaDayStart = (day: string): string => new Date(`${day}T00:00:00${INDIA_OFFSET}`).toISOString();

const indiaDayEnd = (day: string): string =>
    new Date(new Date(`${day}T00:00:00${INDIA_OFFSET}`).getTime() + DAY_MS).toISOString();

export const getServerTime = (): Promise<{ readonly now: string; readonly timeZone: string }> =>
    apiClient.get(`${PATH}/server-time`);

export const listJobCommands = (): Promise<readonly JobCommand[]> => apiClient.get(`${PATH}/commands`);

export const previewSchedule = (cronExpression: string): Promise<{ readonly nextRuns: readonly string[] }> =>
    apiClient.post(`${PATH}/schedules/preview`, { cronExpression });

export const listJobSchedules = (
    filters: JobScheduleFilters,
    accessToken: string | undefined,
): Promise<Paginated<JobSchedule>> =>
    apiClient.paginated<JobSchedule>(`${PATH}/schedules`, {
        query: {
            search: filters.search || undefined,
            status: filters.status,
            page: filters.page,
            limit: JOB_ROWS_PER_PAGE,
        },
        headers: cookieHeader(accessToken),
    });

export const listJobScheduleOptions = async (accessToken: string | undefined): Promise<readonly JobSchedule[]> =>
    (
        await apiClient.paginated<JobSchedule>(`${PATH}/schedules`, {
            query: { page: 1, limit: JOB_OPTIONS_LIMIT },
            headers: cookieHeader(accessToken),
        })
    ).items;

export const addJobSchedule = (body: JobScheduleBody): Promise<JobSchedule> =>
    apiClient.post<JobSchedule>(`${PATH}/schedules`, body);

export const saveJobSchedule = (id: number, body: JobScheduleBody): Promise<JobSchedule> =>
    apiClient.put<JobSchedule>(`${PATH}/schedules/${id}`, body);

export const setJobScheduleStatus = (id: number, status: JobScheduleStatusCode): Promise<JobSchedule> =>
    apiClient.patch<JobSchedule>(`${PATH}/schedules/${id}/status`, { status });

export const runJobScheduleNow = (id: number): Promise<JobRun> => apiClient.post<JobRun>(`${PATH}/schedules/${id}/run`);

export const listJobRuns = (filters: JobRunFilters, accessToken: string | undefined): Promise<Paginated<JobRun>> =>
    apiClient.paginated<JobRun>(`${PATH}/runs`, {
        query: {
            search: filters.search || undefined,
            scheduleId: filters.scheduleId,
            status: filters.status,
            trigger: filters.trigger,
            from: filters.from ? indiaDayStart(filters.from) : undefined,
            to: filters.to ? indiaDayEnd(filters.to) : undefined,
            errorsOnly: filters.errorsOnly ? '1' : undefined,
            oneTime: filters.tab === 'one-time' ? '1' : undefined,
            page: filters.page,
            limit: JOB_ROWS_PER_PAGE,
        },
        headers: cookieHeader(accessToken),
    });

export const getJobRun = (id: number): Promise<JobRunDetail> => apiClient.get<JobRunDetail>(`${PATH}/runs/${id}`);

export const runJobCommand = (body: JobRunBody): Promise<JobRun> => apiClient.post<JobRun>(`${PATH}/runs`, body);

export const cancelJobRun = (id: number): Promise<JobRun> => apiClient.post<JobRun>(`${PATH}/runs/${id}/cancel`);

export const terminateJobRun = (id: number): Promise<JobRun> => apiClient.post<JobRun>(`${PATH}/runs/${id}/terminate`);

export const retryJobRun = (id: number): Promise<JobRun> => apiClient.post<JobRun>(`${PATH}/runs/${id}/retry`);
