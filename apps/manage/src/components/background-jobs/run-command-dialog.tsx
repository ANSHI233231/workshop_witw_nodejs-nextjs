'use client';

import { type FormEvent, useState } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { useJobCommands } from '@/hooks/background-jobs/use-job-commands';
import { useServerClock } from '@/hooks/background-jobs/use-server-clock';
import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { runJobCommand } from '@/services/job.service';
import { JOB_LIMITS, type JobRun } from '@/types/job.types';

import { argumentPath, type ArgumentRow, ArgumentsField } from './arguments-field';
import { argumentNamesOf, CommandField } from './command-field';
import { JobField } from './job-field';
import { argumentProblem, commandProblem, optionalTextProblem, timeoutProblem } from './job-rules';
import { indiaInputValue, isoFromIndiaInput } from './job-time';
import { ServerClock } from './server-clock';

type Problems = Readonly<Record<string, string | undefined>>;

type When = 'now' | 'planned';

const FAILED = 'It could not be started. Please try again.';

export function RunCommandDialog({
    onClose,
    onQueued,
}: {
    readonly onClose: () => void;
    readonly onQueued: (run: JobRun, message: string) => void;
}) {
    const t = useT();
    const now = useServerClock();
    const commands = useJobCommands();
    const [title, setTitle] = useState('');
    const [command, setCommand] = useState('');
    const [rows, setRows] = useState<readonly ArgumentRow[]>([]);
    const [when, setWhen] = useState<When>('now');
    const [plannedAt, setPlannedAt] = useState('');
    const [timeout, setTimeoutText] = useState(String(JOB_LIMITS.TIMEOUT_DEFAULT));
    const [problems, setProblems] = useState<Problems>({});
    const [failure, setFailure] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const clear = (...keys: readonly string[]) =>
        setProblems((current) => ({ ...current, ...Object.fromEntries(keys.map((key) => [key, undefined])) }));

    const translated = (problem: string | undefined): string | undefined => problem && t(problem);

    const runAtProblem = (): string | undefined => {
        if (when === 'now') return undefined;
        const iso = isoFromIndiaInput(plannedAt);
        if (!iso) return 'Pick the date and time.';
        return new Date(iso).getTime() <= (now ?? new Date()).getTime() ? 'Pick a time in the future.' : undefined;
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedCommand = command.trim();
        const values = rows.map((row) => row.value);
        const found: Problems = {
            title: translated(optionalTextProblem(title.trim(), JOB_LIMITS.TITLE_MAX)),
            command: translated(commandProblem(trimmedCommand, commands)),
            runAt: translated(runAtProblem()),
            timeoutMinutes: translated(timeoutProblem(timeout)),
            ...Object.fromEntries(
                values.map((value, position) => [argumentPath(position), translated(argumentProblem(value))]),
            ),
        };
        setProblems(found);
        setFailure(null);
        if (Object.values(found).some(Boolean)) return;
        setSaving(true);
        try {
            const run = await runJobCommand({
                title: title.trim() || null,
                command: trimmedCommand,
                arguments: values,
                runAt: when === 'now' ? null : isoFromIndiaInput(plannedAt),
                timeoutMinutes: Number(timeout.trim()),
            });
            onQueued(run, when === 'now' ? t('The job will start in a few seconds.') : t('The job is planned.'));
        } catch (error) {
            setSaving(false);
            if (!(error instanceof ApiError) || error.code === ApiError.NETWORK_ERROR) {
                setFailure(t(FAILED));
                return;
            }
            const fromApi: Record<string, string> = {};
            for (const { field, message } of error.errors) fromApi[field] ??= t(message);
            if (Object.keys(fromApi).length) setProblems(fromApi);
            else setFailure(t(error.message || FAILED));
        }
    };

    return (
        <div className="overlay">
            <form
                className="modal bj-modal"
                role="dialog"
                aria-modal="true"
                aria-label={t('Run Command')}
                noValidate
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title">{t('Run Command')}</h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="mp-stack">
                        <ServerClock now={now} />
                        <JobField id="bj-title" label={t('Title')} error={problems['title']}>
                            <input
                                id="bj-title"
                                className="input"
                                maxLength={JOB_LIMITS.TITLE_MAX}
                                placeholder={t('e.g. Clear old logs once')}
                                value={title}
                                aria-invalid={problems['title'] ? true : undefined}
                                onChange={(event) => {
                                    setTitle(event.target.value);
                                    clear('title');
                                }}
                            />
                        </JobField>
                        <CommandField
                            id="bj-command"
                            value={command}
                            commands={commands}
                            error={problems['command']}
                            onChange={(value) => {
                                setCommand(value);
                                clear('command');
                            }}
                        />
                        <ArgumentsField
                            rows={rows}
                            names={argumentNamesOf(commands, command)}
                            errors={problems}
                            listError={problems['arguments']}
                            onChange={(next) => {
                                setRows(next);
                                setProblems((current) =>
                                    Object.fromEntries(
                                        Object.entries(current).filter(([key]) => !key.startsWith('arguments')),
                                    ),
                                );
                            }}
                        />
                        <JobField label={t('When')} required error={problems['runAt']}>
                            <div className="bj-when" role="radiogroup" aria-label={t('When')}>
                                <label className="bj-radio">
                                    <input
                                        type="radio"
                                        name="bj-when"
                                        checked={when === 'now'}
                                        onChange={() => {
                                            setWhen('now');
                                            clear('runAt');
                                        }}
                                    />
                                    {t('Now')}
                                </label>
                                <label className="bj-radio">
                                    <input
                                        type="radio"
                                        name="bj-when"
                                        checked={when === 'planned'}
                                        onChange={() => {
                                            setWhen('planned');
                                            if (!plannedAt && now)
                                                setPlannedAt(indiaInputValue(new Date(now.getTime() + 3600000)));
                                            clear('runAt');
                                        }}
                                    />
                                    {t('At a planned time (IST)')}
                                </label>
                                {when === 'planned' && (
                                    <input
                                        className="input"
                                        type="datetime-local"
                                        aria-label={t('Planned date and time')}
                                        value={plannedAt}
                                        aria-invalid={problems['runAt'] ? true : undefined}
                                        onChange={(event) => {
                                            setPlannedAt(event.target.value);
                                            clear('runAt');
                                        }}
                                    />
                                )}
                            </div>
                        </JobField>
                        <JobField
                            id="bj-timeout"
                            label={t('Time limit (minutes)')}
                            required
                            error={problems['timeoutMinutes']}
                        >
                            <input
                                id="bj-timeout"
                                className="input bj-short"
                                type="number"
                                min={JOB_LIMITS.TIMEOUT_MIN}
                                max={JOB_LIMITS.TIMEOUT_MAX}
                                value={timeout}
                                aria-invalid={problems['timeoutMinutes'] ? true : undefined}
                                onChange={(event) => {
                                    setTimeoutText(event.target.value);
                                    clear('timeoutMinutes');
                                }}
                            />
                        </JobField>
                        {failure && (
                            <span className="error" role="alert">
                                {failure}
                            </span>
                        )}
                    </div>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? t('Starting…') : when === 'now' ? t('Run now') : t('Plan')}
                    </button>
                </div>
            </form>
        </div>
    );
}
