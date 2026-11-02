import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { formatCount } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { Paginated } from '@/types/api.types';
import { type JobRun, type JobRunFilters, type JobSchedule, type JobScheduleFilters, JobTab } from '@/types/job.types';

import { AddScheduleButton } from './add-schedule-button';
import { JobFilterBar } from './job-filter-bar';
import { JobTabs } from './job-tabs';
import { BACKGROUND_JOBS_PATH, jobListParams } from './job-url';
import { RunCommandButton } from './run-command-button';
import { RunTable } from './run-table';
import { ScheduleTable } from './schedule-table';

export type BackgroundJobsResult =
    | { readonly kind: 'schedules'; readonly filters: JobScheduleFilters; readonly page: Paginated<JobSchedule> }
    | { readonly kind: 'runs'; readonly filters: JobRunFilters; readonly page: Paginated<JobRun> };

export async function BackgroundJobs({
    result,
    schedules,
}: {
    readonly result: BackgroundJobsResult;
    readonly schedules: readonly JobSchedule[];
}) {
    const { t } = await serverTranslator();
    const { filters, page } = result;
    const firstSerial = (filters.page - 1) * page.meta.limit + 1;
    return (
        <div className="page">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Platform')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Background Jobs')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Background Jobs')}</h1>
                    <div className="actions">
                        {filters.tab === JobTab.SCHEDULED && <AddScheduleButton />}
                        <RunCommandButton />
                    </div>
                </div>
            </div>
            <div className="table-card">
                <JobTabs current={filters.tab} />
                <JobFilterBar filters={filters} schedules={schedules} />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items')}: <b>{formatCount(page.meta.total)}</b>
                    </span>
                </div>
                {result.kind === 'schedules' ? (
                    <ScheduleTable rows={result.page.items} firstSerial={firstSerial} />
                ) : (
                    <RunTable
                        key={`${result.filters.tab}-${result.filters.page}`}
                        tab={result.filters.tab}
                        rows={result.page.items}
                        firstSerial={firstSerial}
                    />
                )}
                <TablePager
                    path={BACKGROUND_JOBS_PATH}
                    params={jobListParams(filters)}
                    page={filters.page}
                    total={page.meta.total}
                    totalPages={page.meta.totalPages}
                    limit={page.meta.limit}
                />
            </div>
        </div>
    );
}
