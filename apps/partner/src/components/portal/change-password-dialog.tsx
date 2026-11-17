'use client';

import { type FormEvent, useState } from 'react';

import { useRevealFirstError } from '@/hooks/ui/use-reveal-first-error';
import { changePassword } from '@/services/auth.service';
import { ApiError } from '@/services/api-error';
import { useT } from '@/hooks/i18n/use-t';
import { formatDateTime } from '@/lib/format';
import type { Translate } from '@/lib/i18n/locale';
import { type AuthUser, PASSWORD_LIMITS } from '@/types/auth.types';

import { PasswordField } from './password-field';

type FieldErrors = { currentPassword?: string; password?: string; confirmPassword?: string };

const checkFields = (t: Translate, currentPassword: string, password: string, confirmPassword: string): FieldErrors => {
    const errors: FieldErrors = {};
    if (!currentPassword) errors.currentPassword = t('Enter your current password.');
    if (!password) errors.password = t('Enter a password.');
    else if (password.length < PASSWORD_LIMITS.MIN)
        errors.password = t('Password must be at least {min} characters.', { min: PASSWORD_LIMITS.MIN });
    else if (password.length > PASSWORD_LIMITS.MAX)
        errors.password = t('Password can be at most {max} characters.', { max: PASSWORD_LIMITS.MAX });
    if (!confirmPassword) errors.confirmPassword = t('Re-enter your password.');
    else if (confirmPassword !== password) errors.confirmPassword = t('Passwords do not match.');
    return errors;
};

const fieldMessage = (t: Translate, message: string | undefined): string | undefined =>
    message === undefined ? undefined : t(message);

const failureMessage = (t: Translate, error: unknown): string => {
    if (error instanceof ApiError && error.code === ApiError.NETWORK_ERROR)
        return t('The server could not be reached. Please try again.');
    return t('The password could not be updated. Please try again.');
};

export function ChangePasswordDialog({
    user,
    roleLabel,
    context,
    onClose,
    onChanged,
}: {
    readonly user: AuthUser;
    readonly roleLabel: string;
    readonly context?: { readonly label: string; readonly value: string };
    readonly onClose: () => void;
    readonly onChanged: () => void;
}) {
    const t = useT();
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [failure, setFailure] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const { formRef, revealFirstError } = useRevealFirstError<HTMLFormElement>();

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const errors = checkFields(t, currentPassword, password, confirmPassword);
        setFieldErrors(errors);
        setFailure(null);
        if (errors.currentPassword || errors.password || errors.confirmPassword) {
            revealFirstError();
            return;
        }
        setSaving(true);
        try {
            await changePassword({ currentPassword, password, confirmPassword });
            onChanged();
        } catch (error) {
            if (error instanceof ApiError && error.errors.length > 0) {
                setFieldErrors({
                    currentPassword: fieldMessage(t, error.fieldError('currentPassword')),
                    password: fieldMessage(t, error.fieldError('password')),
                    confirmPassword: fieldMessage(t, error.fieldError('confirmPassword')),
                });
                revealFirstError();
            } else {
                setFailure(failureMessage(t, error));
            }
            setSaving(false);
        }
    };

    return (
        <div className="overlay">
            <form
                ref={formRef}
                className="modal pw-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="pw-title"
                noValidate
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="pw-title">
                        <span className="pw-ic">
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
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>{' '}
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </span>
                        {t('Change Password')}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
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
                            <path d="M18 6 6 18"></path> <path d="m6 6 12 12"></path>
                        </svg>
                    </button>
                </div>
                <div className="modal-body">
                    <dl className="pw-info">
                        <dt>{t('Name')}</dt>
                        <dd>{user.name}</dd>
                        <dt>{t('Username')}</dt>
                        <dd>{user.username ? `@${user.username}` : '–'}</dd>
                        <dt>{t('Email')}</dt>
                        <dd>{user.email ?? '–'}</dd>
                        {context && (
                            <>
                                <dt>{context.label}</dt>
                                <dd>{context.value}</dd>
                            </>
                        )}
                        <dt>{t('Role')}</dt>
                        <dd>{roleLabel || '–'}</dd>
                        <dt>{t('Status')}</dt>
                        <dd>
                            <span className="badge badge-success">{t('Active')}</span>
                        </dd>
                        <dt>{t('Password updated')}</dt>
                        <dd>{user.passwordChangedAt ? formatDateTime(user.passwordChangedAt) : '–'}</dd>
                    </dl>
                    <div className="pw-stack">
                        {failure && (
                            <div className="banner banner-danger" role="alert">
                                {failure}
                            </div>
                        )}
                        <PasswordField
                            id="pw-current"
                            label={t('Current Password')}
                            placeholder={t('Enter current password')}
                            autoComplete="current-password"
                            value={currentPassword}
                            error={fieldErrors.currentPassword}
                            onChange={(value) => {
                                setCurrentPassword(value);
                                setFieldErrors((errors) => ({ ...errors, currentPassword: undefined }));
                            }}
                        />
                        <PasswordField
                            id="pw-new"
                            label={t('New Password')}
                            placeholder={t('Enter new password')}
                            autoComplete="new-password"
                            value={password}
                            error={fieldErrors.password}
                            onChange={(value) => {
                                setPassword(value);
                                setFieldErrors((errors) => ({ ...errors, password: undefined }));
                            }}
                        />
                        <PasswordField
                            id="pw-confirm"
                            label={t('Confirm Password')}
                            placeholder={t('Confirm new password')}
                            autoComplete="new-password"
                            value={confirmPassword}
                            error={fieldErrors.confirmPassword}
                            onChange={(value) => {
                                setConfirmPassword(value);
                                setFieldErrors((errors) => ({ ...errors, confirmPassword: undefined }));
                            }}
                        />
                    </div>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? t('Changing…') : t('Change Password')}
                    </button>
                </div>
            </form>
        </div>
    );
}
