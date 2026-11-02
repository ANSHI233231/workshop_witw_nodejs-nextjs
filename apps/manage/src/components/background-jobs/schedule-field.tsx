'use client';

import { useEffect, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { formatDateTime } from '@/lib/format';
import { ApiError } from '@/services/api-error';
import { previewSchedule } from '@/services/job.service';
import { JOB_LIMITS } from '@/types/job.types';

import {
    expressionOf,
    PRESET_OPTIONS,
    type ScheduleDraft,
    SchedulePreset,
    type SchedulePresetKey,
    scheduleWords,
    WEEK_DAYS,
} from './job-schedule-presets';

const PREVIEW_PAUSE_MS = 400;

const MINUTES = Array.from({ length: 60 }, (_, minute) => minute);

const MONTH_DAYS = Array.from({ length: 31 }, (_, day) => day + 1);

const twoDigits = (value: number): string => String(value).padStart(2, '0');

type Preview = { readonly expression: string; readonly runs: readonly string[]; readonly problem: string | null };

export function ScheduleField({
    draft,
    error,
    onChange,
}: {
    readonly draft: ScheduleDraft;
    readonly error: string | undefined;
    readonly onChange: (draft: ScheduleDraft) => void;
}) {
    const t = useT();
    const expression = expressionOf(draft);
    const [preview, setPreview] = useState<Preview | null>(null);

    useEffect(() => {
        if (!expression) return;
        let active = true;
        const timer = setTimeout(() => {
            previewSchedule(expression)
                .then((found) => {
                    if (active) setPreview({ expression, runs: found.nextRuns, problem: null });
                })
                .catch((problem: unknown) => {
                    if (!active) return;
                    const message =
                        problem instanceof ApiError ? (problem.fieldError('cronExpression') ?? problem.message) : null;
                    setPreview({ expression, runs: [], problem: message ?? 'Enter a valid cron expression.' });
                });
        }, PREVIEW_PAUSE_MS);
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [expression]);

    const current = preview && preview.expression === expression ? preview : null;
    const shownError = error ?? (current?.problem ? t(current.problem) : undefined);
    const needsTime =
        draft.preset === SchedulePreset.DAILY ||
        draft.preset === SchedulePreset.WEEKLY ||
        draft.preset === SchedulePreset.MONTHLY;

    return (
        <div className={`field${shownError ? ' is-invalid' : ''}`}>
            <span className="label">
                {t('Schedule')}
                <span className="req" aria-hidden="true">
                    *
                </span>
            </span>
            <div className="bj-sched">
                <select
                    className="select"
                    aria-label={t('Schedule')}
                    value={draft.preset}
                    onChange={(event) =>
                        onChange({
                            ...draft,
                            preset: event.target.value as SchedulePresetKey,
                            cron: draft.preset === SchedulePreset.CRON ? draft.cron : expression,
                        })
                    }
                >
                    {PRESET_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {t(option.label)}
                        </option>
                    ))}
                </select>
                {draft.preset === SchedulePreset.HOURLY && (
                    <select
                        className="select"
                        aria-label={t('At minute')}
                        value={draft.minute}
                        onChange={(event) => onChange({ ...draft, minute: Number(event.target.value) })}
                    >
                        {MINUTES.map((minute) => (
                            <option key={minute} value={minute}>
                                {t('At minute {minute}', { minute: twoDigits(minute) })}
                            </option>
                        ))}
                    </select>
                )}
                {draft.preset === SchedulePreset.WEEKLY && (
                    <select
                        className="select"
                        aria-label={t('Day')}
                        value={draft.weekDay}
                        onChange={(event) => onChange({ ...draft, weekDay: Number(event.target.value) })}
                    >
                        {WEEK_DAYS.map((day, index) => (
                            <option key={day} value={index}>
                                {t(day)}
                            </option>
                        ))}
                    </select>
                )}
                {draft.preset === SchedulePreset.MONTHLY && (
                    <select
                        className="select"
                        aria-label={t('Day of month')}
                        value={draft.monthDay}
                        onChange={(event) => onChange({ ...draft, monthDay: Number(event.target.value) })}
                    >
                        {MONTH_DAYS.map((day) => (
                            <option key={day} value={day}>
                                {t('Day {day}', { day })}
                            </option>
                        ))}
                    </select>
                )}
                {needsTime && (
                    <input
                        className="input"
                        type="time"
                        aria-label={t('Time')}
                        value={draft.time}
                        onChange={(event) => onChange({ ...draft, time: event.target.value || '00:00' })}
                    />
                )}
                {draft.preset === SchedulePreset.CRON && (
                    <input
                        className="input bj-mono"
                        aria-label={t('Cron expression')}
                        placeholder="*/15 * * * *"
                        maxLength={JOB_LIMITS.CRON_MAX}
                        value={draft.cron}
                        aria-invalid={shownError ? true : undefined}
                        onChange={(event) => onChange({ ...draft, cron: event.target.value })}
                    />
                )}
            </div>
            {expression && (
                <div className="bj-preview">
                    <span>
                        {scheduleWords(t, expression)} · <code>{expression}</code>
                    </span>
                    {current && current.runs.length > 0 && (
                        <span>
                            {t('Next runs (IST)')}: {current.runs.map((run) => formatDateTime(run)).join(' · ')}
                        </span>
                    )}
                </div>
            )}
            {shownError && (
                <span className="error" role="alert">
                    {shownError}
                </span>
            )}
        </div>
    );
}
