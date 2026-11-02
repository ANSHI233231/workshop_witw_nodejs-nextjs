'use client';

import { useState } from 'react';

import { CancelIcon, RefreshIcon, StopIcon, ViewIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { formatCount, formatDateTime } from '@/lib/format';
import { cancelJobRun, retryJobRun, terminateJobRun } from '@/services/job.service';
import { type JobRun, JobRunStatus, JobTab } from '@/types/job.types';

import { canRetry, commandLine, formatDuration, RUN_STATUS_BADGES, runTriggerText, TRIGGER_LABELS } from './job-labels';
import { useRunViewer } from './use-run-viewer';

const NONE = '—';

type RunAction = 'cancel' | 'terminate' | 'retry';

const ACTION_MESSAGES: Readonly<Record<RunAction, string>> = {
    cancel: 'The run was cancelled.',
    terminate: 'The run was terminated.',
    retry: 'The job will start again in a few seconds.',
};

const ACTION_CALLS: Readonly<Record<RunAction, (id: number) => Promise<JobRun>>> = {
    cancel: cancelJobRun,
    terminate: terminateJobRun,
    retry: retryJobRun,
};

function StatusCell({ run }: { readonly run: JobRun }) {
    const t = useT();
    const badge = RUN_STATUS_BADGES[run.status];
    return (
        <span className="bj-status">
            <span className={badge.className}>{t(badge.label)}</span>
            {run.status === JobRunStatus.RUNNING && run.progressPercent !== null && (
                <small>{`${run.progressPercent}%`}</small>
            )}
        </span>
    );
}

export function RunTable({
    tab,
    rows,
    firstSerial,
}: {
    readonly tab: typeof JobTab.ONE_TIME | typeof JobTab.LOGS;
    readonly rows: readonly JobRun[];
    readonly firstSerial: number;
}) {
    const t = useT();
    const { view, say, overlays, refresh } = useRunViewer();
    const [busy, setBusy] = useState<number | null>(null);
    const logs = tab === JobTab.LOGS;

    const act = async (row: JobRun, action: RunAction) => {
        setBusy(row.id);
        try {
            const run = await ACTION_CALLS[action](row.id);
            say(t(ACTION_MESSAGES[action]));
            refresh();
            if (action === 'retry') view(run.id);
        } catch {
            say(t('This could not be done. Please try again.'), true);
        } finally {
            setBusy(null);
        }
    };

    const columns = logs ? 8 : 6;
    return (
        <>
            <div className="table-scroll">
                <table className="table mp-t bj-t">
                    <thead>
                        <tr>
                            <th scope="col" className="col-sno">
                                {t('S.No')}
                            </th>
                            <th scope="col">{logs ? t('Command') : t('Title / Command')}</th>
                            {logs ? (
                                <>
                                    <th scope="col">{t('Trigger')}</th>
                                    <th scope="col">{t('Run at')}</th>
                                    <th scope="col">{t('Started')}</th>
                                    <th scope="col">{t('Duration')}</th>
                                </>
                            ) : (
                                <th scope="col">{t('Planned at')}</th>
                            )}
                            <th scope="col" className="col-status">
                                {t('Status')}
                            </th>
                            {!logs && <th scope="col">{t('Trigger')}</th>}
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns} className="mp-empty">
                                    {t('No job runs found.')}
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, index) => (
                                <tr key={row.id}>
                                    <td className="col-sno">{formatCount(firstSerial + index)}</td>
                                    <td className="bj-cmd">
                                        {!logs && row.title && <b className="bj-title">{row.title}</b>}
                                        <span className="bj-mono">{commandLine(row.command, row.arguments)}</span>
                                    </td>
                                    {logs ? (
                                        <>
                                            <td>{runTriggerText(t, row)}</td>
                                            <td className="bj-nw">{formatDateTime(row.runAt)}</td>
                                            <td className="bj-nw">
                                                {row.startedAt ? formatDateTime(row.startedAt) : NONE}
                                            </td>
                                            <td className="bj-nw">{formatDuration(row.durationSeconds)}</td>
                                        </>
                                    ) : (
                                        <td className="bj-nw">{formatDateTime(row.runAt)}</td>
                                    )}
                                    <td className="col-status">
                                        <StatusCell run={row} />
                                    </td>
                                    {!logs && <td>{t(TRIGGER_LABELS[row.trigger])}</td>}
                                    <td className="col-actions">
                                        <span className="mt-acts">
                                            <button
                                                type="button"
                                                className="btn-icon"
                                                aria-label={t('View run {id}', { id: row.id })}
                                                data-tooltip={t('View')}
                                                onClick={() => view(row.id)}
                                            >
                                                <ViewIcon />
                                            </button>
                                            {!logs && row.status === JobRunStatus.WAITING && (
                                                <button
                                                    type="button"
                                                    className="btn-icon"
                                                    aria-label={t('Cancel run {id}', { id: row.id })}
                                                    data-tooltip={t('Cancel')}
                                                    disabled={busy === row.id}
                                                    onClick={() => void act(row, 'cancel')}
                                                >
                                                    <CancelIcon />
                                                </button>
                                            )}
                                            {!logs && row.status === JobRunStatus.RUNNING && (
                                                <button
                                                    type="button"
                                                    className="btn-icon"
                                                    aria-label={t('Terminate run {id}', { id: row.id })}
                                                    data-tooltip={t('Terminate')}
                                                    disabled={busy === row.id}
                                                    onClick={() => void act(row, 'terminate')}
                                                >
                                                    <StopIcon />
                                                </button>
                                            )}
                                            {canRetry(row.status) && (
                                                <button
                                                    type="button"
                                                    className="btn-icon"
                                                    aria-label={t('Retry run {id}', { id: row.id })}
                                                    data-tooltip={t('Retry')}
                                                    disabled={busy === row.id}
                                                    onClick={() => void act(row, 'retry')}
                                                >
                                                    <RefreshIcon />
                                                </button>
                                            )}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {overlays}
        </>
    );
}
