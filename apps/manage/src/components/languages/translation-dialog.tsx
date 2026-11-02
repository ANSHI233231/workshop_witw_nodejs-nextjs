'use client';

import { type FormEvent, useState } from 'react';

import { CloseIcon, SaveIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useRevealFirstError } from '@/hooks/ui/use-reveal-first-error';
import type { Translate } from '@/lib/i18n/locale';
import { createAppTranslation, updateAppTranslation } from '@/services/language.service';
import {
    APP_TRANSLATION_LIMITS,
    type AppTranslation,
    type AppTranslationInput,
    type AppTranslationLanguage,
} from '@/types/language.types';

import { clearField, type FieldErrors, saveErrorsOf } from './language-errors';

const fieldOf = (code: string): string => `texts.${code}`;

const problemsOf = (
    t: Translate,
    input: AppTranslationInput,
    languages: readonly AppTranslationLanguage[],
): Record<string, string> => {
    const problems: Record<string, string> = {};
    if (!input.enText) problems['enText'] = t('Enter the English text.');
    else if (input.enText.length > APP_TRANSLATION_LIMITS.TEXT_MAX)
        problems['enText'] = t('English text can be at most {max} characters.', {
            max: APP_TRANSLATION_LIMITS.TEXT_MAX,
        });
    for (const language of languages) {
        if ((input.texts[language.code] ?? '').length > APP_TRANSLATION_LIMITS.TEXT_MAX)
            problems[fieldOf(language.code)] = t('{language} text can be at most {max} characters.', {
                language: language.name,
                max: APP_TRANSLATION_LIMITS.TEXT_MAX,
            });
    }
    return problems;
};

export function TranslationDialog({
    editing,
    languages,
    onSaved,
    onClose,
}: {
    readonly editing: AppTranslation | null;
    readonly languages: readonly AppTranslationLanguage[];
    readonly onSaved: (record: AppTranslation) => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    const { formRef, revealFirstError } = useRevealFirstError<HTMLFormElement>();
    const [enText, setEnText] = useState(editing?.enText ?? '');
    const [texts, setTexts] = useState<Readonly<Record<string, string>>>(editing?.texts ?? {});
    const [errors, setErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const input = {
            enText: enText.trim(),
            texts: Object.fromEntries(
                languages.map((language) => [language.code, (texts[language.code] ?? '').trim()]),
            ),
        };
        const problems = problemsOf(t, input, languages);
        setErrors(problems);
        setFormError(null);
        if (Object.keys(problems).length > 0) {
            revealFirstError();
            return;
        }
        setSaving(true);
        try {
            onSaved(editing ? await updateAppTranslation(editing.id, input) : await createAppTranslation(input));
        } catch (error) {
            const found = saveErrorsOf(error, ['enText', ...languages.map((language) => fieldOf(language.code))], t);
            setErrors(found.fields);
            setFormError(found.form);
            revealFirstError();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="overlay">
            <form
                ref={formRef}
                className="modal pa-modal mm-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="tr-title"
                noValidate
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="tr-title">
                        {editing ? t('Edit Translation') : t('Add Translation')}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    {formError && (
                        <div className="banner banner-danger" role="alert">
                            {formError}
                        </div>
                    )}
                    <div className="field">
                        <label className="label" htmlFor="tr-en">
                            {t('English Text')}
                            <span className="req" aria-hidden="true">
                                *
                            </span>
                        </label>
                        <textarea
                            className={`textarea${errors['enText'] ? ' is-error' : ''}`}
                            id="tr-en"
                            rows={2}
                            value={enText}
                            maxLength={APP_TRANSLATION_LIMITS.TEXT_MAX}
                            aria-invalid={errors['enText'] ? true : undefined}
                            onChange={(event) => {
                                setEnText(event.target.value);
                                setErrors((current) => clearField(current, 'enText'));
                            }}
                        />
                        {errors['enText'] && (
                            <span className="error-text" role="alert">
                                {errors['enText']}
                            </span>
                        )}
                    </div>
                    {languages.map((language) => {
                        const field = fieldOf(language.code);
                        return (
                            <div key={language.code} className="field">
                                <label className="label" htmlFor={`tr-${language.code}`}>
                                    {t('{language} Text', { language: language.name })}
                                    <span lang={language.code}> ({language.nativeName})</span>
                                </label>
                                <textarea
                                    className={`textarea${errors[field] ? ' is-error' : ''}`}
                                    id={`tr-${language.code}`}
                                    lang={language.code}
                                    rows={2}
                                    value={texts[language.code] ?? ''}
                                    maxLength={APP_TRANSLATION_LIMITS.TEXT_MAX}
                                    aria-invalid={errors[field] ? true : undefined}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setTexts((current) => ({ ...current, [language.code]: value }));
                                        setErrors((current) => clearField(current, field));
                                    }}
                                />
                                {errors[field] ? (
                                    <span className="error-text" role="alert">
                                        {errors[field]}
                                    </span>
                                ) : (
                                    <span className="helper">{t('Leave empty to show the English text.')}</span>
                                )}
                            </div>
                        );
                    })}
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
