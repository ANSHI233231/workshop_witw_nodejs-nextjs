'use client';

import Link from 'next/link';
import { type FormEvent, Fragment, type ReactNode, useEffect, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import type { Translate } from '@/lib/i18n/locale';

import { checkPasswordReset, requestPasswordReset, resetPassword } from '@/services/auth.service';
import { ApiError } from '@/services/api-error';
import { PASSWORD_LIMITS } from '@/types/auth.types';

type Step = 'request' | 'sent' | 'reset' | 'done';

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LINK_PROBLEM = 'This password reset link is not valid any more. Please ask for a new one.';

const maskEmail = (email: string): string => {
    const [local = '', domain = ''] = email.split('@');
    return `${local.slice(0, 1)}***@${domain}`;
};

const emailProblem = (t: Translate, email: string): string | null => {
    if (!email) return t('Enter your registered email.');
    if (!EMAIL_SHAPE.test(email)) return t('Enter a valid email address.');
    return null;
};

const passwordProblem = (t: Translate, password: string, confirmPassword: string): string | null => {
    if (!password || !confirmPassword) return t('Enter the new password in both fields.');
    if (password.length < PASSWORD_LIMITS.MIN)
        return t('Password must be at least {min} characters.', { min: PASSWORD_LIMITS.MIN });
    if (password.length > PASSWORD_LIMITS.MAX)
        return t('Password can be at most {max} characters.', { max: PASSWORD_LIMITS.MAX });
    if (password !== confirmPassword) return t('Passwords do not match.');
    return null;
};

const messageOf = (t: Translate, error: unknown, fallback: string): string =>
    t(
        error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
            ? (error.errors[0]?.message ?? error.message)
            : fallback,
    );

const withEmail = (text: string, email: string): ReactNode[] =>
    text
        .split('{email}')
        .flatMap((part, index) => (index === 0 ? [part] : [<b key="email">{email}</b>, part]))
        .map((node, index) => <Fragment key={index}>{node}</Fragment>);

function Svg({ children }: { readonly children: ReactNode }) {
    return (
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
            {children}
        </svg>
    );
}

function EyeIcon() {
    return (
        <Svg>
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>{' '}
            <circle cx="12" cy="12" r="3"></circle>
        </Svg>
    );
}

function NewPasswordInput({
    id,
    label,
    placeholder,
    value,
    invalid,
    onChange,
}: {
    readonly id: string;
    readonly label: string;
    readonly placeholder: string;
    readonly value: string;
    readonly invalid: boolean;
    readonly onChange: (value: string) => void;
}) {
    const t = useT();
    const [shown, setShown] = useState(false);
    const eyeLabel = shown ? t('Hide password') : t('Show password');
    return (
        <div className="fp-pw">
            <input
                className={`input${invalid ? ' is-error' : ''}`}
                id={id}
                type={shown ? 'text' : 'password'}
                placeholder={placeholder}
                autoComplete="new-password"
                aria-label={label}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
            <button
                className="btn-icon fp-eye"
                type="button"
                aria-label={eyeLabel}
                data-tooltip={eyeLabel}
                onClick={() => setShown((current) => !current)}
            >
                <EyeIcon />
            </button>
        </div>
    );
}

function LoginNow() {
    const t = useT();
    return (
        <p className="fp-foot">
            {t('Remembered your password?')} <Link href="/login">{t('Login Now!')}</Link>
        </p>
    );
}

export function ForgotPasswordSteps({ token, note }: { readonly token: string | undefined; readonly note: string }) {
    const t = useT();
    const [step, setStep] = useState<Step>(token ? 'reset' : 'request');
    const [email, setEmail] = useState('');
    const [masked, setMasked] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [problem, setProblem] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [resent, setResent] = useState(false);

    useEffect(() => {
        if (!token) return;
        checkPasswordReset(token)
            .then(setMasked)
            .catch((error: unknown) => {
                setStep('request');
                setProblem(messageOf(t, error, LINK_PROBLEM));
            });
    }, [token, t]);

    const sendLink = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const typed = email.trim();
        const found = emailProblem(t, typed);
        setProblem(found);
        if (found) return;
        setBusy(true);
        try {
            await requestPasswordReset(typed);
            setMasked(maskEmail(typed));
            setResent(false);
            setStep('sent');
        } catch (error) {
            setProblem(messageOf(t, error, 'The reset link could not be sent. Please try again.'));
        } finally {
            setBusy(false);
        }
    };

    const resend = async () => {
        try {
            await requestPasswordReset(email.trim());
            setResent(true);
        } catch {
            setResent(false);
        }
    };

    const change = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const found = passwordProblem(t, password, confirmPassword);
        setProblem(found);
        if (found || !token) return;
        setBusy(true);
        try {
            await resetPassword({ token, password, confirmPassword });
            setStep('done');
        } catch (error) {
            setProblem(messageOf(t, error, 'The password could not be changed. Please try again.'));
        } finally {
            setBusy(false);
        }
    };

    if (step === 'sent') {
        return (
            <div className="fp-step fp-done">
                <span className="fp-ic">
                    <Svg>
                        <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>{' '}
                        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    </Svg>
                </span>
                <h1>{t('Check Your Email')}</h1>
                <p className="sub">
                    {withEmail(
                        t(
                            'We have sent a password reset link to {email}. Open the link in the email to set a new password.',
                        ),
                        masked,
                    )}
                </p>
                <div className="fp-row">
                    <span>{t('Did not get the email?')}</span>
                    <button type="button" className="btn btn-text fp-link" onClick={() => void resend()}>
                        {resent ? t('Link sent again') : t('Resend Link')}
                    </button>
                </div>
                <Link className="btn btn-primary fp-btn" href="/login" style={{ textDecoration: 'none' }}>
                    {t('Back to Login')}
                </Link>
                <button
                    type="button"
                    className="btn btn-text fp-back"
                    onClick={() => {
                        setProblem(null);
                        setStep('request');
                    }}
                >
                    <Svg>
                        <path d="m12 19-7-7 7-7"></path> <path d="M19 12H5"></path>
                    </Svg>
                    {t('Use a different email')}
                </button>
            </div>
        );
    }

    if (step === 'reset') {
        return (
            <form className="fp-step" noValidate onSubmit={(event) => void change(event)}>
                <div className="fp-head">
                    <h1>{t('Set New Password')}</h1>
                    <p className="sub">{withEmail(t('Choose a new password for {email}'), masked)}</p>
                </div>
                <div className="field">
                    <label className="label" htmlFor="fp-np">
                        {t('New Password')}
                        <span className="req" aria-hidden="true">
                            *
                        </span>
                    </label>
                    <NewPasswordInput
                        id="fp-np"
                        label={t('New Password')}
                        placeholder={t('Enter new password')}
                        value={password}
                        invalid={problem !== null}
                        onChange={(value) => {
                            setPassword(value);
                            setProblem(null);
                        }}
                    />
                </div>
                <div className="field">
                    <label className="label" htmlFor="fp-cp">
                        {t('Confirm Password')}
                        <span className="req" aria-hidden="true">
                            *
                        </span>
                    </label>
                    <NewPasswordInput
                        id="fp-cp"
                        label={t('Confirm Password')}
                        placeholder={t('Confirm new password')}
                        value={confirmPassword}
                        invalid={problem !== null}
                        onChange={(value) => {
                            setConfirmPassword(value);
                            setProblem(null);
                        }}
                    />
                    {problem && (
                        <span className="fp-err" role="alert">
                            {problem}
                        </span>
                    )}
                </div>
                <button type="submit" className="btn btn-primary fp-btn" disabled={busy}>
                    {busy ? t('Changing…') : t('Change Password')}
                </button>
                <LoginNow />
            </form>
        );
    }

    if (step === 'done') {
        return (
            <div className="fp-step fp-done">
                <span className="fp-ic fp-ok">
                    <Svg>
                        <circle cx="12" cy="12" r="10"></circle> <path d="m16 9-5.5 5.5L8 12"></path>
                    </Svg>
                </span>
                <h1>{t('Password Changed')}</h1>
                <p className="sub">{t('Your password has been changed. You can now log in with your new password.')}</p>
                <Link className="btn btn-primary fp-btn" href="/login" style={{ textDecoration: 'none' }}>
                    {t('Back to Login')}
                </Link>
            </div>
        );
    }

    return (
        <form className="fp-step" noValidate onSubmit={(event) => void sendLink(event)}>
            <div className="fp-head">
                <h1>{t('Reset Password')}</h1>
                <p className="sub">{t('Enter your registered email to receive a password reset link')}</p>
            </div>
            <div className="fp-note" role="note">
                <Svg>
                    <circle cx="12" cy="12" r="10"></circle> <path d="M12 16v-4"></path> <path d="M12 8h.01"></path>
                </Svg>
                <span>{t(note)}</span>
            </div>
            <div className="field">
                <label className="label" htmlFor="fp-id">
                    {t('User Email')}
                    <span className="req" aria-hidden="true">
                        *
                    </span>
                </label>
                <input
                    className={`input${problem ? ' is-error' : ''}`}
                    id="fp-id"
                    type="email"
                    placeholder={t('Enter your registered email')}
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                        setEmail(event.target.value);
                        setProblem(null);
                    }}
                />
                {problem && (
                    <span className="fp-err" role="alert">
                        {problem}
                    </span>
                )}
            </div>
            <button type="submit" className="btn btn-primary fp-btn" disabled={busy}>
                {busy ? t('Sending…') : t('Reset Password')}
            </button>
            <LoginNow />
        </form>
    );
}
