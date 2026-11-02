'use client';

import { type FormEvent, Fragment, useState } from 'react';

import { CloseIcon, SaveIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useRevealFirstError } from '@/hooks/ui/use-reveal-first-error';
import type { Translate } from '@/lib/i18n/locale';
import { createLanguage, updateLanguage } from '@/services/language.service';
import {
    BASE_LANGUAGE_CODE,
    LANGUAGE_SITE_LABEL,
    LANGUAGE_CODE_PATTERN,
    LANGUAGE_LIMITS,
    type Language,
    type LanguageSite,
    type NewLanguage,
} from '@/types/language.types';

import { clearField, type FieldErrors, saveErrorsOf } from './language-errors';

const DEFAULT_FOR_ORDER: readonly LanguageSite[] = ['web', 'web-website', 'manage'];

const FIELDS = ['name', 'nativeName', 'shortName', 'code', 'shownIn', 'defaultFor'] as const;

const problemsOf = (t: Translate, input: NewLanguage): Record<string, string> => {
    const problems: Record<string, string> = {};
    if (!input.name) problems['name'] = t('Enter a name.');
    else if (input.name.length < LANGUAGE_LIMITS.NAME_MIN)
        problems['name'] = t('Name must be at least {min} characters.', { min: LANGUAGE_LIMITS.NAME_MIN });
    else if (input.name.length > LANGUAGE_LIMITS.NAME_MAX)
        problems['name'] = t('Name can be at most {max} characters.', { max: LANGUAGE_LIMITS.NAME_MAX });
    if (!input.nativeName) problems['nativeName'] = t('Enter the native name.');
    else if (input.nativeName.length > LANGUAGE_LIMITS.NATIVE_NAME_MAX)
        problems['nativeName'] = t('Native name can be at most {max} characters.', {
            max: LANGUAGE_LIMITS.NATIVE_NAME_MAX,
        });
    if (!input.shortName) problems['shortName'] = t('Enter the short name.');
    else if (input.shortName.length > LANGUAGE_LIMITS.SHORT_NAME_MAX)
        problems['shortName'] = t('Short name can be at most {max} characters.', {
            max: LANGUAGE_LIMITS.SHORT_NAME_MAX,
        });
    if (!input.code) problems['code'] = t('Enter a code.');
    else if (!LANGUAGE_CODE_PATTERN.test(input.code))
        problems['code'] = t('Enter the two-letter code in small letters, e.g. hi.');
    return problems;
};

function Field({
    id,
    label,
    value,
    placeholder,
    maxLength,
    error,
    disabled = false,
    onChange,
}: {
    readonly id: string;
    readonly label: string;
    readonly value: string;
    readonly placeholder: string;
    readonly maxLength: number;
    readonly error: string | undefined;
    readonly disabled?: boolean;
    readonly onChange: (value: string) => void;
}) {
    return (
        <div className="field">
            <label className="label" htmlFor={id}>
                {label}
                <span className="req" aria-hidden="true">
                    *
                </span>
            </label>
            <input
                className={`input${error ? ' is-error' : ''}`}
                id={id}
                value={value}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={disabled}
                aria-invalid={error ? true : undefined}
                onChange={(event) => onChange(event.target.value)}
            />
            {error && (
                <span className="error-text" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}

export function LanguageDialog({
    editing,
    onSaved,
    onClose,
}: {
    readonly editing: Language | null;
    readonly onSaved: (record: Language) => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    const { formRef, revealFirstError } = useRevealFirstError<HTMLFormElement>();
    const [name, setName] = useState(editing?.name ?? '');
    const [nativeName, setNativeName] = useState(editing?.nativeName ?? '');
    const [shortName, setShortName] = useState(editing?.shortName ?? '');
    const [code, setCode] = useState(editing?.code ?? '');
    const isBase = editing?.code === BASE_LANGUAGE_CODE;
    const [shownIn, setShownIn] = useState<readonly LanguageSite[]>(editing?.shownIn ?? DEFAULT_FOR_ORDER);
    const [defaultFor, setDefaultFor] = useState<readonly LanguageSite[]>(editing?.defaultFor ?? []);

    const changePlace = (site: LanguageSite, shown: boolean, isDefault: boolean) => {
        setShownIn((current) => (shown ? [...new Set([...current, site])] : current.filter((place) => place !== site)));
        setDefaultFor((current) =>
            isDefault ? [...new Set([...current, site])] : current.filter((place) => place !== site),
        );
        setErrors((current) => clearField(clearField(current, 'shownIn'), 'defaultFor'));
    };
    const [errors, setErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const input = {
            name: name.trim(),
            nativeName: nativeName.trim(),
            shortName: shortName.trim(),
            code: code.trim(),
            shownIn,
            defaultFor,
        };
        const problems = problemsOf(t, input);
        setErrors(problems);
        setFormError(null);
        if (Object.keys(problems).length > 0) {
            revealFirstError();
            return;
        }
        setSaving(true);
        try {
            const { code: newCode, ...fields } = input;
            onSaved(
                editing
                    ? await updateLanguage(editing.code, fields)
                    : await createLanguage({ ...fields, code: newCode }),
            );
        } catch (error) {
            const found = saveErrorsOf(error, FIELDS, t);
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
                aria-labelledby="lang-title"
                noValidate
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="lang-title">
                        {editing ? t('Edit Language') : t('Add Language')}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body pa-body">
                    {formError && (
                        <div className="banner banner-danger" role="alert">
                            {formError}
                        </div>
                    )}
                    <div className="pa-grid">
                        <Field
                            id="lang-name"
                            label={t('Name')}
                            value={name}
                            placeholder={t('e.g. Hindi')}
                            maxLength={LANGUAGE_LIMITS.NAME_MAX}
                            error={errors['name']}
                            onChange={(value) => {
                                setName(value);
                                setErrors((current) => clearField(current, 'name'));
                            }}
                        />
                        <Field
                            id="lang-native-name"
                            label={t('Native Name')}
                            value={nativeName}
                            placeholder={t('e.g. हिन्दी')}
                            maxLength={LANGUAGE_LIMITS.NATIVE_NAME_MAX}
                            error={errors['nativeName']}
                            onChange={(value) => {
                                setNativeName(value);
                                setErrors((current) => clearField(current, 'nativeName'));
                            }}
                        />
                        <Field
                            id="lang-short-name"
                            label={t('Short Name')}
                            value={shortName}
                            placeholder={t('e.g. हि')}
                            maxLength={LANGUAGE_LIMITS.SHORT_NAME_MAX}
                            error={errors['shortName']}
                            onChange={(value) => {
                                setShortName(value);
                                setErrors((current) => clearField(current, 'shortName'));
                            }}
                        />
                        <Field
                            id="lang-code"
                            label={t('Code')}
                            value={code}
                            placeholder={t('e.g. hi')}
                            maxLength={2}
                            error={errors['code']}
                            disabled={editing !== null}
                            onChange={(value) => {
                                setCode(value.toLowerCase());
                                setErrors((current) => clearField(current, 'code'));
                            }}
                        />
                    </div>
                    <div className="field" role="group" aria-labelledby="lang-places">
                        <span className="label" id="lang-places">
                            {t('Where it is shown')}
                        </span>
                        <div className="lg-places">
                            <span className="lg-places-head">{t('Portal or website')}</span>
                            <span className="lg-places-head">{t('Shown')}</span>
                            <span className="lg-places-head">{t('Default')}</span>
                            {DEFAULT_FOR_ORDER.map((site) => {
                                const shown = shownIn.includes(site);
                                const isDefault = defaultFor.includes(site);
                                const label = t(LANGUAGE_SITE_LABEL[site]);
                                return (
                                    <Fragment key={site}>
                                        <span>{label}</span>
                                        <input
                                            type="checkbox"
                                            aria-label={t('Shown in {place}', { place: label })}
                                            checked={shown}
                                            disabled={isBase}
                                            onChange={(event) =>
                                                changePlace(
                                                    site,
                                                    event.target.checked,
                                                    event.target.checked && isDefault,
                                                )
                                            }
                                        />
                                        <input
                                            type="checkbox"
                                            aria-label={t('Default for {place}', { place: label })}
                                            checked={isDefault}
                                            onChange={(event) =>
                                                changePlace(site, shown || event.target.checked, event.target.checked)
                                            }
                                        />
                                    </Fragment>
                                );
                            })}
                        </div>
                        {errors['shownIn'] || errors['defaultFor'] ? (
                            <span className="error-text" role="alert">
                                {errors['shownIn'] ?? errors['defaultFor']}
                            </span>
                        ) : (
                            <span className="helper">
                                {isBase
                                    ? t('English is the base language and is shown everywhere.')
                                    : t(
                                          'Shown: the language appears on that place’s switch. Default: the language that place starts in; each place has exactly one.',
                                      )}
                            </span>
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
