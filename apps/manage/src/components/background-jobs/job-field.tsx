import type { ReactNode } from 'react';

export function JobField({
    id,
    label,
    required = false,
    error,
    hint,
    className = '',
    children,
}: {
    readonly id?: string;
    readonly label: string;
    readonly required?: boolean;
    readonly error?: string;
    readonly hint?: ReactNode;
    readonly className?: string;
    readonly children: ReactNode;
}) {
    const heading = (
        <>
            {label}
            {required && (
                <span className="req" aria-hidden="true">
                    *
                </span>
            )}
        </>
    );
    return (
        <div className={['field', className, error ? 'is-invalid' : ''].filter(Boolean).join(' ')}>
            {id ? (
                <label className="label" htmlFor={id}>
                    {heading}
                </label>
            ) : (
                <span className="label">{heading}</span>
            )}
            {children}
            {hint && <span className="helper">{hint}</span>}
            {error && (
                <span className="error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
