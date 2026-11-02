'use client';

import { type CSSProperties, type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';

import { useFloatingPanel } from '@/hooks/ui/use-floating-panel';
import { cn } from '@/lib/class-names';

export type SearchableOption = {
    readonly value: number;
    readonly label: string;
    readonly detail?: string;
    readonly badge?: string;
};

type SearchableSelectProps = {
    readonly id?: string;
    readonly options: readonly SearchableOption[];
    readonly value: number | undefined;
    readonly onChange: (value: number | undefined) => void;
    readonly placeholder: string;
    readonly searchPlaceholder: string;
    readonly emptyText: string;
    readonly clearLabel?: string;
    readonly disabled?: boolean;
    readonly invalid?: boolean;
    readonly describedBy?: string;
    readonly ariaLabel?: string;
    readonly selectClassName?: string;
    readonly selectStyle?: CSSProperties;
};

const OPEN_KEYS = new Set(['Enter', ' ', 'ArrowDown', 'ArrowUp']);

const FILTER_PANEL_MIN_WIDTH = 260;

const panelMinWidth = (anchor: HTMLElement): number => (anchor.closest('.filter-bar') ? FILTER_PANEL_MIN_WIDTH : 0);

const matches = (option: SearchableOption, query: string) =>
    [option.label, option.detail, option.badge].some((text) => text?.toLowerCase().includes(query));

export function SearchableSelect({
    id,
    options,
    value,
    onChange,
    placeholder,
    searchPlaceholder,
    emptyText,
    clearLabel,
    disabled = false,
    invalid = false,
    describedBy,
    ariaLabel,
    selectClassName,
    selectStyle,
}: SearchableSelectProps) {
    const listId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const popRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    useFloatingPanel(selectRef, popRef, open, panelMinWidth);

    const selected = options.find((option) => option.value === value);
    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return needle ? options.filter((option) => matches(option, needle)) : options;
    }, [options, query]);

    useEffect(() => {
        if (!open) return;
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', closeOnOutsideClick);
        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, [open]);

    useEffect(() => {
        if (open) searchRef.current?.focus();
    }, [open]);

    useEffect(() => {
        listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex, open]);

    const openList = () => {
        if (disabled) return;
        setQuery('');
        setActiveIndex(
            Math.max(
                0,
                options.findIndex((option) => option.value === value),
            ),
        );
        setOpen(true);
    };

    const close = () => {
        setOpen(false);
        selectRef.current?.focus();
    };

    const choose = (option: SearchableOption) => {
        onChange(option.value);
        close();
    };

    const showClear = Boolean(clearLabel) && !query.trim();

    const clear = () => {
        onChange(undefined);
        close();
    };

    const onSelectKeyDown = (event: KeyboardEvent<HTMLSelectElement>) => {
        if (!OPEN_KEYS.has(event.key)) return;
        event.preventDefault();
        openList();
    };

    const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            const option = filtered[activeIndex];
            if (option) choose(option);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            close();
        } else if (event.key === 'Tab') {
            setOpen(false);
        }
    };

    return (
        <div className="ss" ref={rootRef}>
            <select
                id={id}
                ref={selectRef}
                className={cn('select', selectClassName)}
                style={selectStyle}
                value={selected ? String(selected.value) : ''}
                disabled={disabled}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                aria-label={ariaLabel}
                onMouseDown={(event) => {
                    event.preventDefault();
                    if (open) close();
                    else openList();
                }}
                onKeyDown={onSelectKeyDown}
                onChange={() => undefined}
            >
                <option value="">{placeholder}</option>
                {selected && (
                    <option value={String(selected.value)}>
                        {selected.badge ? `${selected.label} (${selected.badge})` : selected.label}
                    </option>
                )}
            </select>
            {open && (
                <div className="ss-pop" ref={popRef}>
                    <input
                        ref={searchRef}
                        className="input"
                        placeholder={searchPlaceholder}
                        value={query}
                        aria-controls={listId}
                        aria-activedescendant={
                            filtered[activeIndex] ? `${listId}-${filtered[activeIndex].value}` : undefined
                        }
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setActiveIndex(0);
                        }}
                        onKeyDown={onSearchKeyDown}
                    />
                    {filtered.length === 0 ? (
                        <p className="ss-empty">{emptyText}</p>
                    ) : (
                        <ul className="ss-list" id={listId} role="listbox" ref={listRef}>
                            {showClear && (
                                <li
                                    role="option"
                                    aria-selected={value === undefined}
                                    className="ss-opt"
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                        clear();
                                    }}
                                >
                                    {clearLabel}
                                </li>
                            )}
                            {filtered.map((option, index) => (
                                <li
                                    key={option.value}
                                    id={`${listId}-${option.value}`}
                                    role="option"
                                    aria-selected={option.value === value}
                                    data-active={index === activeIndex}
                                    className={cn(
                                        'ss-opt',
                                        index === activeIndex && 'is-active',
                                        (option.detail || option.badge) && 'has-more',
                                    )}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                        choose(option);
                                    }}
                                >
                                    {option.detail || option.badge ? (
                                        <>
                                            <span className="ss-main">
                                                <span>{option.label}</span>
                                                {option.detail && <small className="ss-detail">{option.detail}</small>}
                                            </span>
                                            {option.badge && <span className="ss-badge">{option.badge}</span>}
                                        </>
                                    ) : (
                                        option.label
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
