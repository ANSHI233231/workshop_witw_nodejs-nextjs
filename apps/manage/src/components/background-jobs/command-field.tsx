'use client';

import { useT } from '@/hooks/i18n/use-t';
import { JOB_LIMITS, type JobCommand } from '@/types/job.types';

import { JobField } from './job-field';

const LIST_ID = 'bj-commands';

export function CommandField({
    id,
    value,
    commands,
    error,
    onChange,
}: {
    readonly id: string;
    readonly value: string;
    readonly commands: readonly JobCommand[];
    readonly error: string | undefined;
    readonly onChange: (command: string) => void;
}) {
    const t = useT();
    const chosen = commands.find((item) => item.command === value.trim());
    return (
        <JobField
            id={id}
            label={t('Command')}
            required
            error={error}
            hint={chosen ? chosen.description : t('Type to see the commands, e.g. app-log/prune.')}
        >
            <input
                id={id}
                className="input bj-mono"
                list={LIST_ID}
                autoComplete="off"
                spellCheck={false}
                maxLength={JOB_LIMITS.COMMAND_MAX}
                placeholder="controller/action"
                value={value}
                aria-invalid={error ? true : undefined}
                onChange={(event) => onChange(event.target.value)}
            />
            <datalist id={LIST_ID}>
                {commands.map((item) => (
                    <option key={item.command} value={item.command}>
                        {item.description}
                    </option>
                ))}
            </datalist>
        </JobField>
    );
}

export const argumentNamesOf = (commands: readonly JobCommand[], command: string): readonly string[] =>
    commands
        .find((item) => item.command === command.trim())
        ?.arguments.map((argument) => (argument.optional ? `${argument.name} (optional)` : argument.name)) ?? [];
