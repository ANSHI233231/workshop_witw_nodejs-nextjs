import type { ReactNode } from 'react';

export function PackageField({
    id,
    label,
    required = false,
    error,
    helper,
    children,
}: {
    readonly id?: string;
    readonly label: string;
    readonly required?: boolean;
    readonly error?: string | undefined;
    readonly helper?: string;
    readonly children: ReactNode;
}) {
    return (
        <div className={error ? 'field is-invalid' : 'field'}>
            <label className="label" htmlFor={id}>
                {label}
                {required && (
                    <span className="req" aria-hidden="true">
                        *
                    </span>
                )}
            </label>
            {children}
            {helper && <span className="helper">{helper}</span>}
            {error && (
                <span className="error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}

export function CheckList({
    options,
    selected,
    onToggle,
}: {
    readonly options: readonly { readonly code: number; readonly label: string; readonly note?: string }[];
    readonly selected: readonly number[];
    readonly onToggle: (code: number) => void;
}) {
    return (
        <div className="pq-checks">
            {options.map((option) => (
                <label className="check" key={option.code}>
                    <input
                        type="checkbox"
                        checked={selected.includes(option.code)}
                        onChange={() => onToggle(option.code)}
                    />
                    {option.label}
                    {option.note && <span className="badge badge-danger">{option.note}</span>}
                </label>
            ))}
        </div>
    );
}
