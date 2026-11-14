'use client';

import { useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { LOGO_ACCEPT } from '@/types/partner.types';

import { checkLogoFile, initialsOf, type LogoChoice } from './partner-rules';

export function LogoPicker({
    choice,
    currentUrl,
    businessName,
    error,
    inputId,
    onChange,
}: {
    readonly choice: LogoChoice;
    readonly currentUrl: string | null;
    readonly businessName: string;
    readonly error: string | undefined;
    readonly inputId: string;
    readonly onChange: (choice: LogoChoice, error: string | undefined) => void;
}) {
    const t = useT();
    const [preview, setPreview] = useState<string | null>(null);
    const [inputKey, setInputKey] = useState(0);

    const shown = choice.file ? preview : choice.removed ? null : currentUrl;

    const pick = (file: File | undefined) => {
        if (!file) return;
        const problem = checkLogoFile(t, file);
        if (problem) {
            setPreview(null);
            setInputKey((key) => key + 1);
            onChange({ file: null, removed: choice.removed }, problem);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setPreview(typeof reader.result === 'string' ? reader.result : null);
        reader.readAsDataURL(file);
        onChange({ file, removed: false }, undefined);
    };

    const remove = () => {
        setPreview(null);
        setInputKey((key) => key + 1);
        onChange({ file: null, removed: currentUrl !== null }, undefined);
    };

    return (
        <div className={error ? 'field is-invalid' : 'field'}>
            <label className="label" htmlFor={inputId}>
                {t('Logo')}
            </label>
            <div className="pk-logo">
                <span className="pk-logo-box">
                    {shown ? <img src={shown} alt={t('Logo')} /> : initialsOf(businessName) || t('Logo')}
                </span>
                <div className="ss-stack">
                    <input
                        key={inputKey}
                        id={inputId}
                        className="input"
                        type="file"
                        accept={LOGO_ACCEPT}
                        aria-invalid={error ? true : undefined}
                        onChange={(event) => pick(event.target.files?.[0])}
                    />
                    {shown && (
                        <button type="button" className="btn btn-text" style={{ alignSelf: 'flex-start' }} onClick={remove}>
                            {t('Remove logo')}
                        </button>
                    )}
                </div>
            </div>
            <span className="helper">{t('JPG, JPEG, PNG or WEBP, up to 1 MB')}</span>
            {error && (
                <span className="error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
