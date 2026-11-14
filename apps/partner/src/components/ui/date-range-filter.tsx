'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';

import {
    DATE_PRESETS,
    type DatePresetKey,
    type DateRange,
    presetOf,
    presetRange,
    rangeLabel,
    todayInIndia,
} from './date-range';

const POPUP_WIDTH = 300;

const POPUP_GAP = 6;

const WINDOW_EDGE = 8;

const POPUP_MIN_HEIGHT = 160;

const placeBelow = (button: HTMLElement): CSSProperties => {
    const box = button.getBoundingClientRect();
    const top = box.bottom + POPUP_GAP;
    return {
        position: 'fixed',
        top,
        left: Math.max(WINDOW_EDGE, Math.min(box.left, window.innerWidth - POPUP_WIDTH - WINDOW_EDGE)),
        maxHeight: Math.max(POPUP_MIN_HEIGHT, window.innerHeight - top - WINDOW_EDGE),
        overflowY: 'auto',
    };
};

export function DateRangeFilter({
    range,
    onChange,
}: {
    readonly range: DateRange;
    readonly onChange: (range: DateRange) => void;
}) {
    const today = todayInIndia();
    const [open, setOpen] = useState(false);
    const [chosen, setChosen] = useState<DatePresetKey>(presetOf(range, today));
    const t = useT();
    const [from, setFrom] = useState(range.from ?? '');
    const [to, setTo] = useState(range.to ?? '');
    const boxRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [place, setPlace] = useState<CSSProperties | undefined>(undefined);
    const current = presetOf(range, today);

    useEffect(() => {
        if (!open) return;
        const closeOutside = (event: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        const followButton = () => {
            if (buttonRef.current) setPlace(placeBelow(buttonRef.current));
        };
        document.addEventListener('mousedown', closeOutside);
        document.addEventListener('keydown', closeOnEscape);
        window.addEventListener('scroll', followButton, true);
        window.addEventListener('resize', followButton);
        return () => {
            document.removeEventListener('mousedown', closeOutside);
            document.removeEventListener('keydown', closeOnEscape);
            window.removeEventListener('scroll', followButton, true);
            window.removeEventListener('resize', followButton);
        };
    }, [open]);

    const toggle = () => {
        setChosen(current);
        setFrom(range.from ?? '');
        setTo(range.to ?? '');
        if (!open && buttonRef.current) setPlace(placeBelow(buttonRef.current));
        setOpen(!open);
    };

    const pick = (key: DatePresetKey) => {
        setChosen(key);
        if (key === 'custom') return;
        setOpen(false);
        onChange(presetRange(key, today));
    };

    const apply = () => {
        setOpen(false);
        onChange({ from: from || undefined, to: to || undefined });
    };

    const clear = () => {
        setFrom('');
        setTo('');
        setOpen(false);
        onChange({ from: undefined, to: undefined });
    };

    return (
        <div className="sb-df" ref={boxRef}>
            <button
                ref={buttonRef}
                type="button"
                className={`select fw-sm sb-dbtn${current !== 'all' ? ' is-set' : ''}`}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={toggle}
            >
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
                    <path d="M8 2v3"></path>
                    <path d="M16 2v3"></path>
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <path d="M3 9h18"></path>
                </svg>
                <span>{t('Date: {range}', { range: rangeLabel(range, today, t) })}</span>
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
                    <path d="m6 9 6 6 6-6"></path>
                </svg>
            </button>
            {open && (
                <div className="dd sb-dpop" style={place} role="dialog" aria-label={t('Date range')}>
                    <div className="sb-dpre">
                        {DATE_PRESETS.map((preset) => (
                            <button
                                key={preset.key}
                                type="button"
                                className={`sb-dopt${chosen === preset.key ? ' is-on' : ''}`}
                                onClick={() => pick(preset.key)}
                            >
                                {t(preset.label)}
                            </button>
                        ))}
                    </div>
                    {chosen === 'custom' && (
                        <>
                            <div className="sb-drange">
                                <div className="field">
                                    <label className="label" htmlFor="df-from">
                                        {t('From')}
                                    </label>
                                    <input
                                        className="input"
                                        type="date"
                                        id="df-from"
                                        value={from}
                                        max={to || undefined}
                                        onChange={(event) => setFrom(event.target.value)}
                                    />
                                </div>
                                <div className="field">
                                    <label className="label" htmlFor="df-to">
                                        {t('To')}
                                    </label>
                                    <input
                                        className="input"
                                        type="date"
                                        id="df-to"
                                        value={to}
                                        min={from || undefined}
                                        onChange={(event) => setTo(event.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="sb-dact">
                                <button type="button" className="btn btn-text" onClick={clear}>
                                    {t('Clear')}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    disabled={!from && !to}
                                    onClick={apply}
                                >
                                    {t('Apply')}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
