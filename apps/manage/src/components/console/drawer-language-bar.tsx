'use client';

import { useLanguages } from '@/hooks/i18n/use-languages';
import { useT } from '@/hooks/i18n/use-t';
import type { Locale } from '@/lib/i18n/locale';

export function DrawerLanguageBar({
    language,
    onChange,
}: {
    readonly language: Locale;
    readonly onChange: (language: Locale) => void;
}) {
    const t = useT();
    const { languages } = useLanguages();
    return (
        <div id="mdr-tools" role="toolbar" aria-label={t('Quick tools')}>
            <div className="mdr-lang" role="group" aria-label={t('Language')}>
                {languages.map((option) => (
                    <button
                        key={option.code}
                        type="button"
                        className={`mdr-lb${language === option.code ? ' is-on' : ''}`}
                        aria-pressed={language === option.code}
                        aria-label={option.nativeName}
                        onClick={() => onChange(option.code)}
                        lang={option.code}
                    >
                        {option.shortName}
                    </button>
                ))}
            </div>
        </div>
    );
}
