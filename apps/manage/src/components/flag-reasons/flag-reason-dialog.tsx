'use client';

import { type FormEvent, useState } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import type { Translate } from '@/lib/i18n/locale';
import { ApiError } from '@/services/api-error';
import { createFlagReason, updateFlagReason } from '@/services/flag-reason.service';
import {
    FLAG_REASON_LIMITS,
    type FlagReason,
    FlagReasonStatus,
    type FlagReasonStatusCode,
} from '@/types/flag-reason.types';

const NAME_TAKEN = 'FLAG_REASON_NAME_TAKEN';

const nameProblemOf = (t: Translate, name: string): string | null => {
    if (!name) return t('Enter the reason.');
    if (name.length > FLAG_REASON_LIMITS.NAME_MAX) {
        return t('Use up to {max} characters.', { max: FLAG_REASON_LIMITS.NAME_MAX });
    }
    return null;
};

type SaveProblem = { readonly name: string | null; readonly form: string | null };

const saveProblemOf = (t: Translate, error: unknown): SaveProblem => {
    if (!(error instanceof ApiError) || error.code === ApiError.NETWORK_ERROR) {
        return { name: null, form: t('It could not be saved. Please try again.') };
    }
    if (error.code === NAME_TAKEN) return { name: t(error.message), form: null };
    const field = error.fieldError('name');
    return field ? { name: t(field), form: null } : { name: null, form: t(error.message) };
};

export function FlagReasonDialog({
    editing,
    onSaved,
    onClose,
}: {
    readonly editing: FlagReason | null;
    readonly onSaved: (record: FlagReason) => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    const [name, setName] = useState(editing?.name ?? '');
    const [status, setStatus] = useState<FlagReasonStatusCode>(editing?.status ?? FlagReasonStatus.ACTIVE);
    const [nameError, setNameError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const isActive = status === FlagReasonStatus.ACTIVE;

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = name.trim();
        const problem = nameProblemOf(t, trimmed);
        setNameError(problem);
        setFormError(null);
        if (problem) return;
        setSaving(true);
        try {
            onSaved(
                editing
                    ? await updateFlagReason(editing.id, { name: trimmed, status })
                    : await createFlagReason(trimmed),
            );
        } catch (error) {
            const found = saveProblemOf(t, error);
            setNameError(found.name);
            setFormError(found.form);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="overlay" onClick={onClose}>
            <form
                className="modal is-sm"
                role="dialog"
                aria-modal="true"
                aria-labelledby="rs-t"
                noValidate
                onClick={(event) => event.stopPropagation()}
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="rs-t">
                        {editing ? t('Edit reason') : t('Add reason')}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="ss-stack-lg">
                        {formError && (
                            <div className="banner banner-danger" role="alert">
                                {formError}
                            </div>
                        )}
                        <div className={nameError ? 'field is-invalid' : 'field'}>
                            <label className="label" htmlFor="rs-name">
                                {t('Reason')}
                                <span className="req" aria-hidden="true">
                                    *
                                </span>
                            </label>
                            <input
                                id="rs-name"
                                className="input"
                                maxLength={FLAG_REASON_LIMITS.NAME_MAX}
                                placeholder={t('e.g. Hate speech')}
                                value={name}
                                aria-invalid={nameError ? true : undefined}
                                autoFocus
                                onChange={(event) => {
                                    setName(event.target.value);
                                    setNameError(null);
                                }}
                            />
                            <span className="helper">
                                {t('Up to {max} characters', { max: FLAG_REASON_LIMITS.NAME_MAX })}
                            </span>
                            {nameError && (
                                <span className="error" role="alert">
                                    {nameError}
                                </span>
                            )}
                        </div>
                        {editing && (
                            <div className="field ssc-swrow">
                                <span className="label" id="rf-st-l">
                                    {t('Status')}
                                </span>
                                <div className="ssc-sw">
                                    <button
                                        type="button"
                                        className={isActive ? 'mt-switch is-on' : 'mt-switch'}
                                        role="switch"
                                        aria-checked={isActive}
                                        aria-labelledby="rf-st-l"
                                        onClick={() =>
                                            setStatus(isActive ? FlagReasonStatus.INACTIVE : FlagReasonStatus.ACTIVE)
                                        }
                                    >
                                        <span className="mt-knob"></span>
                                    </button>
                                    <span>{isActive ? t('Active') : t('Inactive')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {editing ? t('Save') : t('Add reason')}
                    </button>
                </div>
            </form>
        </div>
    );
}
