'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';

import { PASSWORD_INPUT_STYLE, PASSWORD_WRAP_STYLE, PasswordToggle } from '@/components/ui/password-toggle';
import { useT } from '@/hooks/i18n/use-t';
import { useRevealFirstError } from '@/hooks/ui/use-reveal-first-error';
import { config } from '@/lib/config';
import type { Translate } from '@/lib/i18n/locale';
import { ApiError } from '@/services/api-error';
import { refreshSession, signIn } from '@/services/auth.service';
import { SIGN_IN_LIMITS } from '@/types/auth.types';

import { AuthLogo } from './auth-card';

type FieldErrors = { identifier?: string; password?: string };

const PORTAL_HOME = '/';

const BECOME_A_PARTNER_PATH = '/become-a-partner';

const checkFields = (t: Translate, identifier: string, password: string): FieldErrors => {
    const errors: FieldErrors = {};
    const trimmed = identifier.trim();
    if (!trimmed) errors.identifier = t('Enter your mobile number, email or username.');
    else if (trimmed.length > SIGN_IN_LIMITS.IDENTIFIER)
        errors.identifier = t('This can be at most {max} characters.', { max: SIGN_IN_LIMITS.IDENTIFIER });
    if (!password) errors.password = t('Enter your password.');
    else if (password.length > SIGN_IN_LIMITS.PASSWORD)
        errors.password = t('Password can be at most {max} characters.', { max: SIGN_IN_LIMITS.PASSWORD });
    return errors;
};

const fieldMessage = (t: Translate, message: string | undefined): string | undefined =>
    message === undefined ? undefined : t(message);

const messageFor = (t: Translate, error: unknown): string => {
    if (!(error instanceof ApiError)) return t('Login failed. Please try again.');
    if (error.code === ApiError.NETWORK_ERROR)
        return t('Could not reach the server. Please check your connection and try again.');
    if (error.code === 'INVALID_CREDENTIALS' || error.code === 'ACCOUNT_INACTIVE') return t(error.message);
    return t('Login failed. Please try again.');
};

export function SignInForm() {
    const t = useT();
    const router = useRouter();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [passwordShown, setPasswordShown] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const { formRef, revealFirstError } = useRevealFirstError<HTMLFormElement>();

    useEffect(() => {
        let active = true;
        refreshSession()
            .then((user) => {
                if (!active || !user) return;
                router.replace(PORTAL_HOME);
                router.refresh();
            })
            .catch(() => undefined);
        return () => {
            active = false;
        };
    }, [router]);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (sending) return;
        const errors = checkFields(t, identifier, password);
        setFieldErrors(errors);
        revealFirstError();
        setFormError(null);
        if (errors.identifier || errors.password) return;

        setSending(true);
        try {
            await signIn({ identifier: identifier.trim(), password, remember: true });
            router.replace(PORTAL_HOME);
            router.refresh();
        } catch (error) {
            if (error instanceof ApiError && error.errors.length > 0) {
                setFieldErrors({
                    identifier: fieldMessage(t, error.fieldError('identifier')),
                    password: fieldMessage(t, error.fieldError('password')),
                });
                revealFirstError();
            } else {
                setFormError(messageFor(t, error));
            }
            setSending(false);
        }
    };

    return (
        <form ref={formRef} className="pq-auth-card" noValidate onSubmit={submit}>
            <AuthLogo />
            <h1>{t('Partner Portal')}</h1>
            <p>{t('Sign in with your Walk Into The Wild website details.')}</p>
            {formError && (
                <div className="banner banner-danger" role="alert">
                    {formError}
                </div>
            )}
            <div className={`field${fieldErrors.identifier ? ' is-invalid' : ''}`}>
                <label className="label" htmlFor="si-identifier">
                    {t('Login ID')}
                    <span className="req" aria-hidden="true">
                        *
                    </span>
                </label>
                <input
                    id="si-identifier"
                    className="input"
                    name="identifier"
                    autoComplete="username"
                    placeholder={t('Mobile no. or email')}
                    maxLength={SIGN_IN_LIMITS.IDENTIFIER}
                    value={identifier}
                    aria-invalid={fieldErrors.identifier ? true : undefined}
                    onChange={(event) => {
                        setIdentifier(event.target.value);
                        setFieldErrors((errors) => ({ ...errors, identifier: undefined }));
                    }}
                />
                {fieldErrors.identifier && (
                    <span className="error" role="alert">
                        {fieldErrors.identifier}
                    </span>
                )}
            </div>
            <div className={`field${fieldErrors.password ? ' is-invalid' : ''}`}>
                <label className="label" htmlFor="si-password">
                    {t('Password')}
                    <span className="req" aria-hidden="true">
                        *
                    </span>
                </label>
                <div style={PASSWORD_WRAP_STYLE}>
                    <input
                        id="si-password"
                        style={PASSWORD_INPUT_STYLE}
                        className="input"
                        type={passwordShown ? 'text' : 'password'}
                        name="password"
                        autoComplete="current-password"
                        maxLength={SIGN_IN_LIMITS.PASSWORD}
                        value={password}
                        aria-invalid={fieldErrors.password ? true : undefined}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            setFieldErrors((errors) => ({ ...errors, password: undefined }));
                        }}
                    />
                    <PasswordToggle shown={passwordShown} onToggle={() => setPasswordShown((shown) => !shown)} />
                </div>
                {fieldErrors.password && (
                    <span className="error" role="alert">
                        {fieldErrors.password}
                    </span>
                )}
            </div>
            <Link href="/forgot-password" style={{ alignSelf: 'flex-end', marginTop: '-12px', font: 'var(--text-label)' }}>
                {t('Forgot password?')}
            </Link>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={sending}>
                {sending ? t('Signing in…') : t('Sign in')}
            </button>
            <p style={{ textAlign: 'center' }}>
                {t('Not a partner yet?')}{' '}
                <a href={`${config.websiteUrl}${BECOME_A_PARTNER_PATH}`} style={{ fontWeight: 600 }}>
                    {t('Become a Partner')}
                </a>
            </p>
        </form>
    );
}
