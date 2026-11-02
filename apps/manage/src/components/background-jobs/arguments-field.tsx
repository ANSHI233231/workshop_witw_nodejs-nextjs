'use client';

import { ArrowDownIcon, ArrowUpIcon, DeleteIcon, PlusIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { JOB_LIMITS } from '@/types/job.types';

export type ArgumentRow = { readonly key: string; readonly value: string };

let rowCount = 0;

export const argumentRowsOf = (values: readonly string[]): readonly ArgumentRow[] =>
    values.map((value) => {
        rowCount += 1;
        return { key: `arg-${rowCount}`, value };
    });

export const argumentPath = (position: number): string => `arguments.${position}`;

export function ArgumentsField({
    rows,
    names,
    errors,
    listError,
    onChange,
}: {
    readonly rows: readonly ArgumentRow[];
    readonly names: readonly string[];
    readonly errors: Readonly<Record<string, string | undefined>>;
    readonly listError: string | undefined;
    readonly onChange: (rows: readonly ArgumentRow[]) => void;
}) {
    const t = useT();
    const move = (position: number, step: number) => {
        const target = position + step;
        if (target < 0 || target >= rows.length) return;
        const next = [...rows];
        const [moved] = next.splice(position, 1);
        if (moved) next.splice(target, 0, moved);
        onChange(next);
    };
    return (
        <div className={`field${listError ? ' is-invalid' : ''}`}>
            <span className="label">{t('Arguments')}</span>
            <div className="mu-opts">
                {rows.map((row, position) => {
                    const error = errors[argumentPath(position)];
                    return (
                        <div className={error ? 'mu-row is-invalid' : 'mu-row'} key={row.key}>
                            <input
                                className="input bj-mono"
                                aria-label={t('Argument {number}', { number: String(position + 1) })}
                                maxLength={JOB_LIMITS.ARGUMENT_MAX}
                                placeholder={names[position] ?? t('Value')}
                                value={row.value}
                                aria-invalid={error ? true : undefined}
                                onChange={(event) =>
                                    onChange(
                                        rows.map((existing) =>
                                            existing.key === row.key
                                                ? { ...existing, value: event.target.value }
                                                : existing,
                                        ),
                                    )
                                }
                            />
                            <span className="mu-acts">
                                <button
                                    type="button"
                                    className="btn-icon"
                                    aria-label={t('Move up')}
                                    data-tooltip={t('Move up')}
                                    disabled={position === 0}
                                    onClick={() => move(position, -1)}
                                >
                                    <ArrowUpIcon />
                                </button>
                                <button
                                    type="button"
                                    className="btn-icon"
                                    aria-label={t('Move down')}
                                    data-tooltip={t('Move down')}
                                    disabled={position === rows.length - 1}
                                    onClick={() => move(position, 1)}
                                >
                                    <ArrowDownIcon />
                                </button>
                                <button
                                    type="button"
                                    className="btn-icon"
                                    aria-label={t('Remove argument')}
                                    data-tooltip={t('Remove')}
                                    onClick={() => onChange(rows.filter((existing) => existing.key !== row.key))}
                                >
                                    <DeleteIcon />
                                </button>
                            </span>
                            {error && (
                                <span className="error" role="alert">
                                    {error}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            {listError && (
                <span className="error" role="alert">
                    {listError}
                </span>
            )}
            <div>
                <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={rows.length >= JOB_LIMITS.ARGUMENTS_MAX}
                    onClick={() => onChange([...rows, ...argumentRowsOf([''])])}
                >
                    <PlusIcon />
                    {t('Add argument')}
                </button>
            </div>
        </div>
    );
}
