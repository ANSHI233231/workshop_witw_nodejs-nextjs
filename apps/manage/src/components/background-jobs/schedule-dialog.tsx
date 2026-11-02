'use client';

import { type FormEvent, useState } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { useJobCommands } from '@/hooks/background-jobs/use-job-commands';
import { useServerClock } from '@/hooks/background-jobs/use-server-clock';
import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { addJobSchedule, saveJobSchedule } from '@/services/job.service';
import { JOB_LIMITS, type JobSchedule, JobScheduleStatus, type JobScheduleStatusCode } from '@/types/job.types';

import { argumentPath, type ArgumentRow, argumentRowsOf, ArgumentsField } from './arguments-field';
import { argumentNamesOf, CommandField } from './command-field';
import { JobField } from './job-field';
import {
    argumentProblem,
    commandProblem,
    cronProblem,
    jobNameProblem,
    optionalTextProblem,
    timeoutProblem,
} from './job-rules';
import { DEFAULT_DRAFT, draftOf, expressionOf, type ScheduleDraft } from './job-schedule-presets';
import { ScheduleField } from './schedule-field';
import { ServerClock } from './server-clock';

type Problems = Readonly<Record<string, string | undefined>>;

const FAILED = 'It could not be saved. Please try again.';

export function ScheduleDialog({
    schedule,
    onClose,
    onSaved,
}: {
    readonly schedule: JobSchedule | null;
    readonly onClose: () => void;
    readonly onSaved: (message: string) => void;
}) {
    const t = useT();
    const now = useServerClock();
    const commands = useJobCommands();
    const [name, setName] = useState(schedule?.name ?? '');
    const [command, setCommand] = useState(schedule?.command ?? '');
    const [rows, setRows] = useState<readonly ArgumentRow[]>(() => argumentRowsOf(schedule?.arguments ?? []));
    const [draft, setDraft] = useState<ScheduleDraft>(() =>
        schedule ? draftOf(schedule.cronExpression) : DEFAULT_DRAFT,
    );
    const [timeout, setTimeoutText] = useState(String(schedule?.timeoutMinutes ?? JOB_LIMITS.TIMEOUT_DEFAULT));
    const [description, setDescription] = useState(schedule?.description ?? '');
    const [status, setStatus] = useState<JobScheduleStatusCode>(schedule?.status ?? JobScheduleStatus.ACTIVE);
    const [problems, setProblems] = useState<Problems>({});
    const [failure, setFailure] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const title = schedule ? t('Edit Scheduled Job') : t('Add Scheduled Job');
    const active = status === JobScheduleStatus.ACTIVE;

    const clear = (...keys: readonly string[]) =>
        setProblems((current) => ({ ...current, ...Object.fromEntries(keys.map((key) => [key, undefined])) }));

    const translated = (problem: string | undefined): string | undefined => problem && t(problem);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedName = name.trim();
        const trimmedCommand = command.trim();
        const expression = expressionOf(draft);
        const values = rows.map((row) => row.value);
        const found: Problems = {
            name: translated(jobNameProblem(trimmedName)),
            command: translated(commandProblem(trimmedCommand, commands)),
            cronExpression: translated(cronProblem(expression)),
            timeoutMinutes: translated(timeoutProblem(timeout)),
            description: translated(optionalTextProblem(description.trim(), JOB_LIMITS.DESCRIPTION_MAX)),
            ...Object.fromEntries(
                values.map((value, position) => [argumentPath(position), translated(argumentProblem(value))]),
            ),
        };
        setProblems(found);
        setFailure(null);
        if (Object.values(found).some(Boolean)) return;
        setSaving(true);
        const body = {
            name: trimmedName,
            command: trimmedCommand,
            arguments: values,
            cronExpression: expression,
            timeoutMinutes: Number(timeout.trim()),
            description: description.trim() || null,
            status,
        };
        try {
            const saved = schedule ? await saveJobSchedule(schedule.id, body) : await addJobSchedule(body);
            onSaved(
                t(schedule ? 'Scheduled job "{name}" saved.' : 'Scheduled job "{name}" added.', { name: saved.name }),
            );
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
                aria-label={title}
                noValidate
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title">{title}</h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="mp-stack">
                        <ServerClock now={now} />
                        <JobField id="bj-name" label={t('Name')} required error={problems['name']}>
                            <input
                                id="bj-name"
                                className="input"
                                maxLength={JOB_LIMITS.NAME_MAX}
                                placeholder={t('e.g. Prune old app logs')}
                                value={name}
                                aria-invalid={problems['name'] ? true : undefined}
                                onChange={(event) => {
                                    setName(event.target.value);
                                    clear('name');
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
                        <ScheduleField
                            draft={draft}
                            error={problems['cronExpression']}
                            onChange={(next) => {
                                setDraft(next);
                                clear('cronExpression');
                            }}
                        />
                        <div className="bj-grid">
                            <JobField
                                id="bj-timeout"
                                label={t('Time limit (minutes)')}
                                required
                                error={problems['timeoutMinutes']}
                            >
                                <input
                                    id="bj-timeout"
                                    className="input"
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
                            {schedule && (
                                <JobField label={t('Status')} error={problems['status']}>
                                    <div className="mp-stsw">
                                        <button
                                            type="button"
                                            className={`mt-switch${active ? ' is-on' : ''}`}
                                            role="switch"
                                            aria-checked={active}
                                            aria-label={t('Status')}
                                            onClick={() =>
                                                setStatus(
                                                    active ? JobScheduleStatus.INACTIVE : JobScheduleStatus.ACTIVE,
                                                )
                                            }
                                        >
                                            <span className="mt-knob"></span>
                                        </button>
                                        <span>{active ? t('Active') : t('Inactive')}</span>
                                    </div>
                                </JobField>
                            )}
                        </div>
                        <JobField id="bj-desc" label={t('Description')} error={problems['description']}>
                            <textarea
                                id="bj-desc"
                                className="textarea"
                                rows={2}
                                maxLength={JOB_LIMITS.DESCRIPTION_MAX}
                                value={description}
                                aria-invalid={problems['description'] ? true : undefined}
                                onChange={(event) => {
                                    setDescription(event.target.value);
                                    clear('description');
                                }}
                            ></textarea>
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
                        {saving ? t('Saving…') : t('Save')}
                    </button>
                </div>
            </form>
        </div>
    );
}
