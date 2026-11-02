'use client';

import { useRouter } from 'next/navigation';

import { DateRangeFilter } from '@/components/ui/date-range-filter';
import { ResetIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';
import {
    JOB_LIMITS,
    type JobFilters,
    type JobRunFilters,
    type JobRunStatusCode,
    type JobRunTriggerCode,
    type JobSchedule,
    type JobScheduleFilters,
    type JobScheduleStatusCode,
    JobTab,
} from '@/types/job.types';

import { RUN_STATUS_OPTIONS, SCHEDULE_STATUS_OPTIONS, TRIGGER_OPTIONS } from './job-labels';
import { emptyRunFilters, jobsUrl } from './job-url';

const codeOf = <T extends number>(options: readonly { readonly value: T }[], value: string): T | undefined =>
    options.find((option) => String(option.value) === value)?.value;

function ScheduleFilters({ filters }: { readonly filters: JobScheduleFilters }) {
    const t = useT();
    const router = useRouter();
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(jobsUrl({ ...filters, search, page: 1 })),
    );
    return (
        <div className="filter-bar">
            <div className="input-group fw-md">
                <SearchIcon />
                <input
                    className="input"
                    placeholder={t('Search name or command')}
                    aria-label={t('Search')}
                    value={text}
                    maxLength={JOB_LIMITS.SEARCH}
                    onChange={(event) => setText(event.target.value)}
                />
            </div>
            <select
                className="select fw-sm"
                aria-label={t('Status')}
                value={filters.status ?? ''}
                onChange={(event) =>
                    router.push(
                        jobsUrl({
                            ...filters,
                            search: text.trim(),
                            status: codeOf<JobScheduleStatusCode>(SCHEDULE_STATUS_OPTIONS, event.target.value),
                            page: 1,
                        }),
                    )
                }
            >
                <option value="">{t('Status: All')}</option>
                {SCHEDULE_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {t(option.label)}
                    </option>
                ))}
            </select>
            <button
                type="button"
                className="btn btn-text"
                onClick={() => {
                    clearText();
                    router.push(jobsUrl({ tab: JobTab.SCHEDULED, search: '', status: undefined, page: 1 }));
                }}
            >
                <ResetIcon />
                {t('Reset')}
            </button>
        </div>
    );
}

function RunFilters({
    filters,
    schedules,
}: {
    readonly filters: JobRunFilters;
    readonly schedules: readonly JobSchedule[];
}) {
    const t = useT();
    const router = useRouter();
    const logs = filters.tab === JobTab.LOGS;
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(jobsUrl({ ...filters, search, page: 1 })),
    );
    const goTo = (changes: Partial<JobRunFilters>) =>
        router.push(jobsUrl({ ...filters, search: text.trim(), ...changes, page: 1 }));
    return (
        <div className="filter-bar bj-fb">
            <div className="input-group fw-md">
                <SearchIcon />
                <input
                    className="input"
                    placeholder={t(logs ? 'Search command' : 'Search command or title')}
                    aria-label={t('Search')}
                    value={text}
                    maxLength={JOB_LIMITS.SEARCH}
                    onChange={(event) => setText(event.target.value)}
                />
            </div>
            {logs && (
                <select
                    className="select fw-sm"
                    aria-label={t('Scheduled job')}
                    value={filters.scheduleId ?? ''}
                    onChange={(event) =>
                        goTo({ scheduleId: event.target.value ? Number(event.target.value) : undefined })
                    }
                >
                    <option value="">{t('Schedule: All')}</option>
                    {schedules.map((schedule) => (
                        <option key={schedule.id} value={schedule.id}>
                            {schedule.name}
                        </option>
                    ))}
                </select>
            )}
            <select
                className="select fw-sm"
                aria-label={t('Status')}
                value={filters.status ?? ''}
                onChange={(event) => goTo({ status: codeOf<JobRunStatusCode>(RUN_STATUS_OPTIONS, event.target.value) })}
            >
                <option value="">{t('Status: All')}</option>
                {RUN_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {t(option.label)}
                    </option>
                ))}
            </select>
            {logs && (
                <>
                    <select
                        className="select fw-sm"
                        aria-label={t('Trigger')}
                        value={filters.trigger ?? ''}
                        onChange={(event) =>
                            goTo({ trigger: codeOf<JobRunTriggerCode>(TRIGGER_OPTIONS, event.target.value) })
                        }
                    >
                        <option value="">{t('Trigger: All')}</option>
                        {TRIGGER_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {t(option.label)}
                            </option>
                        ))}
                    </select>
                    <DateRangeFilter
                        range={{ from: filters.from, to: filters.to }}
                        onChange={(range) => goTo({ from: range.from, to: range.to })}
                    />
                    <label className="bj-check">
                        <input
                            type="checkbox"
                            checked={filters.errorsOnly}
                            onChange={(event) => goTo({ errorsOnly: event.target.checked })}
                        />
                        {t('Errors only')}
                    </label>
                </>
            )}
            <button
                type="button"
                className="btn btn-text"
                onClick={() => {
                    clearText();
                    router.push(jobsUrl(emptyRunFilters(filters.tab)));
                }}
            >
                <ResetIcon />
                {t('Reset')}
            </button>
        </div>
    );
}

export function JobFilterBar({
    filters,
    schedules,
}: {
    readonly filters: JobFilters;
    readonly schedules: readonly JobSchedule[];
}) {
    return filters.tab === JobTab.SCHEDULED ? (
        <ScheduleFilters filters={filters} />
    ) : (
        <RunFilters filters={filters} schedules={schedules} />
    );
}
