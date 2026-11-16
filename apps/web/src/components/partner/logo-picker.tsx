'use client';

import { useRef, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { LOGO_ACCEPT } from '@/types/partner.types';

import { checkLogoFile, type LogoChoice } from './partner-rules';

const DEFAULT_LOGO = '/witw/logo.png';

export function LogoPicker({
    choice,
    currentUrl,
    error,
    inputId,
    onChange,
}: {
    readonly choice: LogoChoice;
    readonly currentUrl: string | null;
    readonly error: string | undefined;
    readonly inputId: string;
    readonly onChange: (choice: LogoChoice, error: string | undefined) => void;
}) {
    const t = useT();
    const fileInput = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [inputKey, setInputKey] = useState(0);
    const errorId = `${inputId}-error`;
    const labelId = `${inputId}-label`;

    const shown = choice.file ? preview : choice.removed ? null : currentUrl;

    const clearInput = () => {
        setPreview(null);
        setInputKey((key) => key + 1);
    };

    const pick = (file: File | undefined) => {
        if (!file) return;
        const problem = checkLogoFile(t, file);
        if (problem) {
            clearInput();
            onChange({ file: null, removed: choice.removed }, problem);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setPreview(typeof reader.result === 'string' ? reader.result : null);
        reader.readAsDataURL(file);
        onChange({ file, removed: false }, undefined);
    };

    const remove = () => {
        clearInput();
        onChange({ file: null, removed: currentUrl !== null }, undefined);
    };

    return (
        <div className={error ? 'field is-invalid' : 'field'}>
            <span className="label" id={labelId}>
                {t('Logo')}
            </span>
            <div className="pk-logo">
                <span className="pk-logo-box">
                    {shown ? (
                        <img src={shown} alt={t('Logo')} />
                    ) : (
                        <img className="pk-logo-default" src={DEFAULT_LOGO} alt={t('No logo yet')} />
                    )}
                </span>
                <div className="pk-logo-actions">
                    <input
                        key={inputKey}
                        ref={fileInput}
                        className="sr-only"
                        type="file"
                        tabIndex={-1}
                        aria-hidden="true"
                        accept={LOGO_ACCEPT}
                        onChange={(event) => pick(event.target.files?.[0])}
                    />
                    <button
                        id={inputId}
                        type="button"
                        aria-labelledby={`${labelId} ${inputId}`}
                        className="btn btn-secondary"
                        aria-describedby={error ? errorId : undefined}
                        onClick={() => fileInput.current?.click()}
                    >
                        {t('Upload logo')}
                    </button>
                    {choice.file && <span className="pk-logo-name">{choice.file.name}</span>}
                    {shown && (
                        <button type="button" className="btn btn-text" onClick={remove}>
                            {t('Remove')}
                        </button>
                    )}
                </div>
            </div>
            <span className="helper">{t('JPG, JPEG, PNG or WEBP, up to 1 MB')}</span>
            {error && (
                <span id={errorId} className="error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
