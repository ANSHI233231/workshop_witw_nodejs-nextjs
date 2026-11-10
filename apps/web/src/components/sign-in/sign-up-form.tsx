'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';

import { PASSWORD_INPUT_STYLE, PASSWORD_WRAP_STYLE, PasswordToggle } from '@/components/ui/password-toggle';
import { useT } from '@/hooks/i18n/use-t';
import { useRevealFirstError } from '@/hooks/ui/use-reveal-first-error';
import type { Translate } from '@/lib/i18n/locale';
import { MOBILE_INPUT_LENGTH, mobileInput } from '@/lib/mobile-input';
import { ApiError } from '@/services/api-error';
import { refreshSession, signUp } from '@/services/auth.service';
import { PASSWORD_LIMITS, SIGN_UP_LIMITS } from '@/types/auth.types';

import { rememberSignUp } from './signed-up-welcome';

type Field = 'name' | 'email' | 'mobile' | 'password';

type FieldErrors = Partial<Record<Field, string>>;

const FIELDS: readonly Field[] = ['name', 'email', 'mobile', 'password'];

const SIGNED_IN_HOME = '/';

const SIGNED_UP_HOME = '/';

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_OF_CODE: Readonly<Record<string, Field>> = {
    EMAIL_TAKEN: 'email',
    MOBILE_TAKEN: 'mobile',
};

const checkFields = (t: Translate, name: string, email: string, mobile: string, password: string): FieldErrors => {
    const errors: FieldErrors = {};
    const fullName = name.trim();
    const address = email.trim();
    if (fullName.length < SIGN_UP_LIMITS.NAME_MIN) errors.name = t('Enter your full name.');
    else if (fullName.length > SIGN_UP_LIMITS.NAME_MAX)
        errors.name = t('Name can be at most {max} characters.', { max: SIGN_UP_LIMITS.NAME_MAX });
    if (!EMAIL_SHAPE.test(address) || address.length > SIGN_UP_LIMITS.EMAIL)
        errors.email = t('Enter a valid email address.');
    if (!INDIAN_MOBILE.test(mobile)) errors.mobile = t('Enter a 10-digit mobile number.');
    if (password.length < PASSWORD_LIMITS.MIN)
        errors.password = t('Use at least {min} characters.', { min: PASSWORD_LIMITS.MIN });
    else if (password.length > PASSWORD_LIMITS.MAX)
        errors.password = t('Password can be at most {max} characters.', { max: PASSWORD_LIMITS.MAX });
    return errors;
};

const hasErrors = (errors: FieldErrors): boolean => FIELDS.some((field) => errors[field] !== undefined);

const fieldErrorsOf = (t: Translate, error: ApiError): FieldErrors => {
    const takenField = FIELD_OF_CODE[error.code];
    if (takenField) return { [takenField]: t(error.message) };
    return Object.fromEntries(
        FIELDS.flatMap((field) => {
            const message = error.fieldError(field);
            return message === undefined ? [] : [[field, t(message)]];
        }),
    );
};

const messageFor = (t: Translate, error: unknown): string => {
    if (error instanceof ApiError && error.code === ApiError.NETWORK_ERROR)
        return t('Could not reach the server. Please check your connection and try again.');
    return t('Sign up failed. Please try again.');
};

export function SignUpForm() {
    const t = useT();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
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
                router.replace(SIGNED_IN_HOME);
                router.refresh();
            })
            .catch(() => undefined);
        return () => {
            active = false;
        };
    }, [router]);

    const clear = (field: Field) => setFieldErrors((errors) => ({ ...errors, [field]: undefined }));

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (sending) return;
        const errors = checkFields(t, name, email, mobile, password);
        setFieldErrors(errors);
        revealFirstError();
        setFormError(null);
        if (hasErrors(errors)) return;

        setSending(true);
        try {
            const user = await signUp({ name: name.trim(), email: email.trim(), mobile, password });
            rememberSignUp(user.name);
            router.replace(SIGNED_UP_HOME);
            router.refresh();
        } catch (error) {
            const apiFieldErrors = error instanceof ApiError ? fieldErrorsOf(t, error) : {};
            if (hasErrors(apiFieldErrors)) {
                setFieldErrors(apiFieldErrors);
                revealFirstError();
            } else {
                setFormError(messageFor(t, error));
            }
            setSending(false);
        }
    };

    const fieldClass = (field: Field): string => `field${fieldErrors[field] ? ' is-invalid' : ''}`;

    const errorOf = (field: Field) =>
        fieldErrors[field] && (
            <span className="error" role="alert">
                {fieldErrors[field]}
            </span>
        );

    const required = (
        <span className="req" aria-hidden="true">
            *
        </span>
    );

    return (
        <form
            ref={formRef}
            className="auth-card"
            style={{
                width: '440px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-lg)',
            }}
            noValidate
            onSubmit={submit}
        >
            <h1 style={{ font: 'var(--text-kpi)', margin: '0' }}>{t('Sign Up')}</h1>
            <p className="helper" style={{ margin: '-8px 0 0', font: 'var(--text-body)' }}>
                {t('Create your Walk Into The Wild account.')}
            </p>
            <div className={fieldClass('name')}>
                <label className="label" htmlFor="su-name">
                    {t('Full Name')}
                    {required}
                </label>
                <input
                    id="su-name"
                    className="input"
                    autoComplete="name"
                    placeholder={t('Enter your full name')}
                    maxLength={SIGN_UP_LIMITS.NAME_MAX}
                    name="name"
                    value={name}
                    aria-invalid={fieldErrors.name ? true : undefined}
                    onChange={(event) => {
                        setName(event.target.value);
                        clear('name');
                    }}
                />
                {errorOf('name')}
            </div>
            <div className={fieldClass('email')}>
                <label className="label" htmlFor="su-email">
                    {t('Email')}
                    {required}
                </label>
                <input
                    id="su-email"
                    className="input"
                    type="email"
                    autoComplete="email"
                    placeholder={t('Enter your email')}
                    maxLength={SIGN_UP_LIMITS.EMAIL}
                    name="email"
                    value={email}
                    aria-invalid={fieldErrors.email ? true : undefined}
                    onChange={(event) => {
                        setEmail(event.target.value);
                        clear('email');
                    }}
                />
                {errorOf('email')}
            </div>
            <div className={fieldClass('mobile')}>
                <label className="label" htmlFor="su-mobile">
                    {t('Mobile Number')}
                    {required}
                </label>
                <input
                    id="su-mobile"
                    className="input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder={t('10-digit mobile number')}
                    maxLength={MOBILE_INPUT_LENGTH}
                    name="mobile"
                    value={mobile}
                    aria-invalid={fieldErrors.mobile ? true : undefined}
                    onChange={(event) => {
                        setMobile(mobileInput(event.target.value));
                        clear('mobile');
                    }}
                />
                {errorOf('mobile')}
            </div>
            <div className={fieldClass('password')}>
                <label className="label" htmlFor="su-password">
                    {t('Password')}
                    {required}
                </label>
                <div style={PASSWORD_WRAP_STYLE}>
                    <input
                        id="su-password"
                        style={PASSWORD_INPUT_STYLE}
                        className="input"
                        type={passwordShown ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder={t('At least {min} characters', { min: PASSWORD_LIMITS.MIN })}
                        maxLength={PASSWORD_LIMITS.MAX}
                        name="password"
                        value={password}
                        aria-invalid={fieldErrors.password ? true : undefined}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            clear('password');
                        }}
                    />
                    <PasswordToggle shown={passwordShown} onToggle={() => setPasswordShown((shown) => !shown)} />
                </div>
                {errorOf('password')}
            </div>
            {formError && (
                <div className="banner banner-danger" role="alert">
                    {formError}
                </div>
            )}
            <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', textDecoration: 'none' }}
                disabled={sending}
            >
                {sending ? t('Signing up…') : t('Sign Up')}
            </button>
            <p className="auth-switch" style={{ margin: '0', textAlign: 'center', font: 'var(--text-body)' }}>
                {t('Already have an account?')}{' '}
                <Link href="/login" style={{ fontWeight: 600 }}>
                    {t('Login')}
                </Link>
            </p>
        </form>
    );
}
