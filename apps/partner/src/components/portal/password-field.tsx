'use client';

import { useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';

export function PasswordField({
    id,
    label,
    placeholder,
    autoComplete,
    value,
    error,
    helper,
    required = true,
    onChange,
}: {
    readonly id: string;
    readonly label: string;
    readonly placeholder: string;
    readonly autoComplete: string;
    readonly value: string;
    readonly error?: string;
    readonly helper?: string;
    readonly required?: boolean;
    readonly onChange: (value: string) => void;
}) {
    const t = useT();
    const [shown, setShown] = useState(false);
    return (
        <div className={`field${error ? ' is-invalid' : ''}`}>
            <label className="label" htmlFor={id}>
                {label}
                {required && (
                    <span className="req" aria-hidden="true">
                        *
                    </span>
                )}
            </label>
            <div className="pw-in">
                <input
                    id={id}
                    className="input"
                    type={shown ? 'text' : 'password'}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    value={value}
                    aria-invalid={error ? true : undefined}
                    onChange={(event) => onChange(event.target.value)}
                />
                <button
                    className="btn-icon"
                    aria-label={shown ? t('Hide password') : t('Show password')}
                    type="button"
                    onClick={() => setShown((current) => !current)}
                >
                    <svg
                        className="icon "
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        {shown ? (
                            <>
                                <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"></path>
                                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path>
                                <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"></path>
                                <path d="m2 2 20 20"></path>
                            </>
                        ) : (
                            <>
                                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </>
                        )}
                    </svg>
                </button>
            </div>
            {error ? <span className="error">{error}</span> : helper && <span className="helper">{helper}</span>}
        </div>
    );
}
