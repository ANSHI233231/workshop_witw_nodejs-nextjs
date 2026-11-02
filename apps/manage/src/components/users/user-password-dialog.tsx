'use client';

import { type FormEvent, useState } from 'react';

import { PasswordField } from '@/components/console/password-field';
import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import type { Translate } from '@/lib/i18n/locale';
import { setUserPassword } from '@/services/users.service';
import { ApiError } from '@/services/api-error';
import { USER_EDIT_LIMITS, type UserListItem } from '@/types/users.types';

import { STATUS_BADGES } from './user-labels';

const passwordProblem = (password: string, confirmPassword: string, t: Translate): string | null => {
    if (!password || !confirmPassword) return t('Enter the new password in both fields.');
    if (password.length < USER_EDIT_LIMITS.PASSWORD_MIN)
        return t('Password must be at least {min} characters.', { min: USER_EDIT_LIMITS.PASSWORD_MIN });
    if (password.length > USER_EDIT_LIMITS.PASSWORD_MAX)
        return t('Password can be at most {max} characters.', { max: USER_EDIT_LIMITS.PASSWORD_MAX });
    if (password !== confirmPassword) return t('Passwords do not match.');
    return null;
};

export function UserPasswordDialog({
    user,
    onClose,
    onChanged,
}: {
    readonly user: UserListItem;
    readonly onClose: () => void;
    readonly onChanged: () => void;
}) {
    const t = useT();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [problem, setProblem] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const badge = STATUS_BADGES[user.status];

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const found = passwordProblem(password, confirmPassword, t);
        setProblem(found);
        if (found) return;
        setSaving(true);
        try {
            await setUserPassword(user.id, { password, confirmPassword });
            onChanged();
        } catch (error) {
            setProblem(
                error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
                    ? t(error.errors[0]?.message ?? error.message)
                    : t('The password could not be changed. Please try again.'),
            );
            setSaving(false);
        }
    };

    return (
        <div className="overlay">
            <form
                className="modal pw-modal us-pw"
                role="dialog"
                aria-modal="true"
                aria-labelledby="rp-title"
                noValidate
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="rp-title">
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
                    <button
                        type="button"
                        className="btn-icon"
                        aria-label={t('Close')}
                        data-tooltip={t('Close')}
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <dl className="pw-info">
                        <dt>{t('Name')}</dt>
                        <dd>{user.name}</dd>
                        <dt>{t('Email')}</dt>
                        <dd>{user.email ?? '–'}</dd>
                        <dt>{t('Role')}</dt>
                        <dd>{user.roleNames.length > 0 ? user.roleNames.join(', ') : '–'}</dd>
                        <dt>{t('Status')}</dt>
                        <dd>
                            <span className={badge.className}>{t(badge.label)}</span>
                        </dd>
                    </dl>
                    <div className="us-pwf">
                        <PasswordField
                            id="up-np"
                            label={t('New Password')}
                            placeholder={t('Enter new password')}
                            autoComplete="new-password"
                            value={password}
                            onChange={(value) => {
                                setPassword(value);
                                setProblem(null);
                            }}
                        />
                        <PasswordField
                            id="up-cp"
                            label={t('Confirm Password')}
                            placeholder={t('Enter confirm password')}
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(value) => {
                                setConfirmPassword(value);
                                setProblem(null);
                            }}
                        />
                    </div>
                    {problem && (
                        <span className="us-err" role="alert">
                            {problem}
                        </span>
                    )}
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
