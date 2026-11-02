'use client';

import { useLanguages } from '@/hooks/i18n/use-languages';
import { useT } from '@/hooks/i18n/use-t';
import {
    translatedLanguagesOf,
    translationFieldOf,
    type TranslationValues,
    withTranslation,
} from '@/lib/i18n/translation-values';

export function TranslationFields({
    column,
    label,
    values,
    errors,
    maxLength,
    onChange,
}: {
    readonly column: string;
    readonly label: string;
    readonly values: TranslationValues;
    readonly errors: Readonly<Record<string, string>>;
    readonly maxLength: number;
    readonly onChange: (values: TranslationValues, field: string) => void;
}) {
    const t = useT();
    const languages = translatedLanguagesOf(useLanguages().languages);
    if (languages.length === 0) return null;
    return (
        <>
            {languages.map((language) => {
                const field = translationFieldOf(language.code, column);
                const id = `tf-${language.code}-${column}`;
                const error = errors[field];
                return (
                    <div key={language.code} className="field">
                        <label className="label" htmlFor={id}>
                            {label} <span lang={language.code}>({language.nativeName})</span>
                        </label>
                        <input
                            className={`input${error ? ' is-error' : ''}`}
                            id={id}
                            lang={language.code}
                            value={values[language.code]?.[column] ?? ''}
                            maxLength={maxLength}
                            aria-invalid={error ? true : undefined}
                            onChange={(event) =>
                                onChange(withTranslation(values, language.code, column, event.target.value), field)
                            }
                        />
                        {error && (
                            <span className="error-text" role="alert">
                                {t(error)}
                            </span>
                        )}
                    </div>
                );
            })}
        </>
    );
}
