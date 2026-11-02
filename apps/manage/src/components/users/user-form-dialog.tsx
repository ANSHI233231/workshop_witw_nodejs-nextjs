'use client';

import { type FormEvent, useState } from 'react';

import { PasswordField } from '@/components/console/password-field';
import { CheckIcon, CloseIcon, SaveIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useRevealFirstError } from '@/hooks/ui/use-reveal-first-error';
import type { Translate } from '@/lib/i18n/locale';
import { mobileInput } from '@/lib/mobile-input';
import { ApiError } from '@/services/api-error';
import { createUser, updateUser } from '@/services/users.service';
import { SystemRole, USER_EDIT_LIMITS, type UserDetail } from '@/types/users.types';

import { SYSTEM_ROLE_OPTIONS } from './user-labels';

type Field = 'name' | 'username' | 'mobile' | 'email' | 'password' | 'confirmPassword';

type FieldErrors = Partial<Record<Field, string>>;

const INDIAN_MOBILE = /^[6-9]\d{9}$/;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_SHAPE = /^[A-Za-z0-9._-]+$/;

const usernameProblem = (username: string, t: Translate): string | undefined => {
    if (!username) return undefined;
    if (username.length < USER_EDIT_LIMITS.USERNAME_MIN)
        return t('Username must be at least {min} characters.', { min: USER_EDIT_LIMITS.USERNAME_MIN });
    if (username.length > USER_EDIT_LIMITS.USERNAME_MAX)
        return t('Username can be at most {max} characters.', { max: USER_EDIT_LIMITS.USERNAME_MAX });
    return USERNAME_SHAPE.test(username)
        ? undefined
        : t('Username can use letters, digits, dot, underscore and hyphen only.');
};

const checkFields = (
    name: string,
    username: string,
    mobile: string,
    email: string,
    password: string,
    confirmPassword: string,
    adding: boolean,
    t: Translate,
): FieldErrors => {
    const errors: FieldErrors = {};
    const usernameError = usernameProblem(username, t);
    if (usernameError) errors.username = usernameError;
    if (!name) errors.name = t('Enter a name.');
    else if (name.length < USER_EDIT_LIMITS.NAME_MIN)
        errors.name = t('Name must be at least {min} characters.', { min: USER_EDIT_LIMITS.NAME_MIN });
    else if (name.length > USER_EDIT_LIMITS.NAME_MAX)
        errors.name = t('Name can be at most {max} characters.', { max: USER_EDIT_LIMITS.NAME_MAX });
    if (!INDIAN_MOBILE.test(mobile)) errors.mobile = t('Enter a 10-digit mobile number.');
    if (!EMAIL_SHAPE.test(email) || email.length > USER_EDIT_LIMITS.EMAIL_MAX)
        errors.email = t('Enter a valid email address.');
    if (!adding) return errors;
    if (!password) errors.password = t('Enter a password.');
    else if (password.length < USER_EDIT_LIMITS.PASSWORD_MIN)
        errors.password = t('Password must be at least {min} characters.', { min: USER_EDIT_LIMITS.PASSWORD_MIN });
    else if (password.length > USER_EDIT_LIMITS.PASSWORD_MAX)
        errors.password = t('Password can be at most {max} characters.', { max: USER_EDIT_LIMITS.PASSWORD_MAX });
    if (!confirmPassword) errors.confirmPassword = t('Re-enter the password.');
    else if (password && confirmPassword !== password) errors.confirmPassword = t('Passwords do not match.');
    return errors;
};

const FIELD_OF_CODE: Readonly<Record<string, Field>> = {
    USERNAME_TAKEN: 'username',
    EMAIL_TAKEN: 'email',
    MOBILE_TAKEN: 'mobile',
};

const MESSAGE_OF_CODE: Readonly<Record<string, string>> = {
    EMAIL_TAKEN: 'This email is already in use.',
};

const savedRoleIds = (roleIds: readonly number[]): number[] =>
    roleIds.includes(SystemRole.SUPER_ADMIN) ? [SystemRole.SUPER_ADMIN] : [...roleIds].sort((a, b) => a - b);

export function UserFormDialog({
    user,
    onClose,
    onSaved,
}: {
    readonly user: UserDetail | null;
    readonly onClose: () => void;
    readonly onSaved: (user: UserDetail, added: boolean) => void;
}) {
    const t = useT();
    const adding = user === null;
    const [name, setName] = useState(user?.name ?? '');
    const [username, setUsername] = useState(user?.username ?? '');
    const [mobile, setMobile] = useState(user?.mobile ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [roleIds, setRoleIds] = useState<readonly number[]>(user?.systemRoleIds ?? []);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [failure, setFailure] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const { formRef, revealFirstError } = useRevealFirstError<HTMLFormElement>();
    const superAdmin = roleIds.includes(SystemRole.SUPER_ADMIN);

    const clear = (field: Field) => setFieldErrors((errors) => ({ ...errors, [field]: undefined }));
    const toggleRole = (roleId: number) =>
        setRoleIds((ids) => (ids.includes(roleId) ? ids.filter((id) => id !== roleId) : [...ids, roleId]));

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const input = {
            name: name.trim(),
            username: username.trim() || null,
            mobile: mobile.replace(/\s+/g, ''),
            email: email.trim().toLowerCase(),
            systemRoleIds: savedRoleIds(roleIds),
        };
        const errors = checkFields(
            input.name,
            input.username ?? '',
            input.mobile,
            input.email,
            password,
            confirmPassword,
            adding,
            t,
        );
        setFieldErrors(errors);
        revealFirstError();
        setFailure(null);
        if (Object.values(errors).some(Boolean)) return;
        setSaving(true);
        try {
            const saved = adding
                ? await createUser({ ...input, password, confirmPassword })
                : await updateUser(user.id, input);
            onSaved(saved, adding);
        } catch (error) {
            const field = error instanceof ApiError ? FIELD_OF_CODE[error.code] : undefined;
            if (field && error instanceof ApiError)
                setFieldErrors({ [field]: t(MESSAGE_OF_CODE[error.code] ?? error.message) });
            else if (error instanceof ApiError && error.errors.length > 0) {
                const translatedFieldError = (name: string): string | undefined => {
                    const message = error.fieldError(name);
                    return message && t(message);
                };
                setFieldErrors({
                    name: translatedFieldError('name'),
                    username: translatedFieldError('username'),
                    mobile: translatedFieldError('mobile'),
                    email: translatedFieldError('email'),
                    password: translatedFieldError('password'),
                    confirmPassword: translatedFieldError('confirmPassword'),
                });
            } else
                setFailure(
                    error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
                        ? t(error.message)
                        : t('The user could not be saved. Please try again.'),
                );
            revealFirstError();
            setSaving(false);
        }
    };

    const textField = (
        field: Exclude<Field, 'password'>,
        label: string,
        type: string,
        placeholder: string,
        value: string,
        setValue: (value: string) => void,
        maxLength?: number,
        required = true,
    ) => (
        <div className="field">
            <label className="label" htmlFor={`uf-${field}`}>
                {t(label)}
                {required && (
                    <span className="req" aria-hidden="true">
                        *
                    </span>
                )}
            </label>
            <input
                className={`input${fieldErrors[field] ? ' is-error' : ''}`}
                id={`uf-${field}`}
                type={type}
                inputMode={field === 'mobile' ? 'numeric' : undefined}
                placeholder={t(placeholder)}
                maxLength={maxLength}
                value={value}
                onChange={(event) => {
                    setValue(field === 'mobile' ? mobileInput(event.target.value) : event.target.value);
                    clear(field);
                }}
            />
            {fieldErrors[field] && (
                <span className="us-err" role="alert">
                    {fieldErrors[field]}
                </span>
            )}
        </div>
    );

    return (
        <div className="overlay">
            <form
                ref={formRef}
                className="modal us-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="us-title"
                noValidate
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="us-title">
                        {adding ? t('Add User') : t('Edit User')}
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
                    {failure && (
                        <div className="banner banner-danger" role="alert" style={{ marginBottom: 'var(--space-lg)' }}>
                            {failure}
                        </div>
                    )}
                    <div className="us-grid">
                        {textField('name', 'Name', 'text', 'Enter full name', name, setName, USER_EDIT_LIMITS.NAME_MAX)}
                        {textField('mobile', 'Mobile', 'tel', 'Enter 10-digit mobile number', mobile, setMobile)}
                        <div className="field uf-role-f">
                            <span className="label">{t('Role')}</span>
                            <div className="uf-roles" role="group" aria-label={t('Role')}>
                                {SYSTEM_ROLE_OPTIONS.map((option) => {
                                    const implied = superAdmin && option.id !== SystemRole.SUPER_ADMIN;
                                    const on = implied || roleIds.includes(option.id);
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            className={`uf-chk${on ? ' is-on' : ''}`}
                                            role="checkbox"
                                            aria-checked={on}
                                            disabled={implied}
                                            onClick={() => toggleRole(option.id)}
                                        >
                                            <span className="uf-box">
                                                <CheckIcon />
                                            </span>
                                            {t(option.label)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {textField(
                            'email',
                            'Email',
                            'email',
                            'Enter email address',
                            email,
                            setEmail,
                            USER_EDIT_LIMITS.EMAIL_MAX,
                        )}
                        {textField(
                            'username',
                            'Username',
                            'text',
                            'Choose a username (optional)',
                            username,
                            setUsername,
                            USER_EDIT_LIMITS.USERNAME_MAX,
                            false,
                        )}
                        {adding && (
                            <PasswordField
                                id="uf-pass"
                                label={t('Password')}
                                placeholder={t('Enter password')}
                                autoComplete="new-password"
                                required
                                value={password}
                                error={fieldErrors.password}
                                onChange={(value) => {
                                    setPassword(value);
                                    clear('password');
                                }}
                            />
                        )}
                        {adding && (
                            <PasswordField
                                id="uf-pass2"
                                label={t('Confirm Password')}
                                placeholder={t('Re-enter password')}
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                error={fieldErrors.confirmPassword}
                                onChange={(value) => {
                                    setConfirmPassword(value);
                                    clear('confirmPassword');
                                }}
                            />
                        )}
                    </div>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        <CloseIcon />
                        {t('Cancel')}
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        <SaveIcon />
                        {saving ? t('Saving…') : t('Save')}
                    </button>
                </div>
            </form>
        </div>
    );
}
