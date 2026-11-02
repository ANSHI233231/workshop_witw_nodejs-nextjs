'use client';

import Link from 'next/link';
import { useState } from 'react';

import { MasterSwitch } from '@/components/ui/master-switch';
import { EditIcon, LogsIcon, PlayIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { formatCount, formatDateTime } from '@/lib/format';
import { runJobScheduleNow, setJobScheduleStatus } from '@/services/job.service';
import { type JobSchedule, JobScheduleStatus } from '@/types/job.types';

import { commandLine, formatDuration, RUN_STATUS_BADGES, SCHEDULE_STATUS_BADGES } from './job-labels';
import { scheduleWords } from './job-schedule-presets';
import { scheduleLogsUrl } from './job-url';
import { ScheduleDialog } from './schedule-dialog';
import { useRunViewer } from './use-run-viewer';

const NONE = '—';

export function ScheduleTable({
    rows,
    firstSerial,
}: {
    readonly rows: readonly JobSchedule[];
    readonly firstSerial: number;
}) {
    const t = useT();
    const { view, say, overlays, refresh } = useRunViewer();
    const [editing, setEditing] = useState<JobSchedule | null>(null);
    const [busy, setBusy] = useState<number | null>(null);

    const toggle = async (row: JobSchedule) => {
        const next = row.status === JobScheduleStatus.ACTIVE ? JobScheduleStatus.INACTIVE : JobScheduleStatus.ACTIVE;
        setBusy(row.id);
        try {
            await setJobScheduleStatus(row.id, next);
            say(
                next === JobScheduleStatus.ACTIVE
                    ? t('Scheduled job "{name}" activated.', { name: row.name })
                    : t('Scheduled job "{name}" deactivated.', { name: row.name }),
            );
            refresh();
        } catch {
            say(t('Scheduled job "{name}" could not be changed. Please try again.', { name: row.name }), true);
        } finally {
            setBusy(null);
        }
    };

    const runNow = async (row: JobSchedule) => {
        setBusy(row.id);
        try {
            const run = await runJobScheduleNow(row.id);
            say(t('The job will start in a few seconds.'));
            refresh();
            view(run.id);
        } catch {
            say(t('"{name}" could not be started. Please try again.', { name: row.name }), true);
        } finally {
            setBusy(null);
        }
    };

    return (
        <>
            <div className="table-scroll">
                <table className="table mp-t bj-t">
                    <thead>
                        <tr>
                            <th scope="col" className="col-sno">
                                {t('S.No')}
                            </th>
                            <th scope="col">{t('Name')}</th>
                            <th scope="col">{t('Command')}</th>
                            <th scope="col">{t('Schedule')}</th>
                            <th scope="col">{t('Last run')}</th>
                            <th scope="col">{t('Next run')}</th>
                            <th scope="col" className="col-status">
                                {t('Status')}
                            </th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="mp-empty">
                                    {t('No scheduled jobs found.')}
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, index) => {
                                const status = SCHEDULE_STATUS_BADGES[row.status];
                                const last = row.lastRun ? RUN_STATUS_BADGES[row.lastRun.status] : null;
                                return (
                                    <tr key={row.id}>
                                        <td className="col-sno">{formatCount(firstSerial + index)}</td>
                                        <td>{row.name}</td>
                                        <td className="bj-mono bj-cmd">{commandLine(row.command, row.arguments)}</td>
                                        <td>
                                            {scheduleWords(t, row.cronExpression)}
                                            <small className="bj-sub bj-mono">{row.cronExpression}</small>
                                        </td>
                                        <td className="bj-nw">
                                            {row.lastRun && last ? (
                                                <>
                                                    {formatDateTime(row.lastRun.runAt)}
                                                    <small className="bj-sub">
                                                        <span className={last.className}>{t(last.label)}</span>{' '}
                                                        {formatDuration(row.lastRun.durationSeconds)}
                                                    </small>
                                                </>
                                            ) : (
                                                NONE
                                            )}
                                        </td>
                                        <td className="bj-nw">
                                            {row.nextRunAt ? formatDateTime(row.nextRunAt) : NONE}
                                        </td>
                                        <td className="col-status">
                                            <span className={status.className}>{t(status.label)}</span>
                                        </td>
                                        <td className="col-actions">
                                            <span className="mt-acts">
                                                <button
                                                    type="button"
                                                    className="btn-icon"
                                                    aria-label={t('Edit {name}', { name: row.name })}
                                                    data-tooltip={t('Edit')}
                                                    onClick={() => setEditing(row)}
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-icon"
                                                    aria-label={t('Run {name} now', { name: row.name })}
                                                    data-tooltip={t('Run now')}
                                                    disabled={busy === row.id}
                                                    onClick={() => void runNow(row)}
                                                >
                                                    <PlayIcon />
                                                </button>
                                                <MasterSwitch
                                                    name={row.name}
                                                    active={row.status === JobScheduleStatus.ACTIVE}
                                                    busy={busy === row.id}
                                                    onToggle={() => void toggle(row)}
                                                />
                                                <Link
                                                    className="btn-icon"
                                                    href={scheduleLogsUrl(row.id)}
                                                    aria-label={t('Logs of {name}', { name: row.name })}
                                                    data-tooltip={t('Logs')}
                                                >
                                                    <LogsIcon />
                                                </Link>
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            {editing && (
                <ScheduleDialog
                    schedule={editing}
                    onClose={() => setEditing(null)}
                    onSaved={(message) => {
                        setEditing(null);
                        say(message);
                        refresh();
                    }}
                />
            )}
            {overlays}
        </>
    );
}
