'use client';

import { type KeyboardEvent, type UIEvent, useEffect, useId, useRef, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { useFloatingPanel } from '@/hooks/ui/use-floating-panel';

export type RemoteOption = {
    readonly id: number;
    readonly label: string;
    readonly context: string | null;
    readonly details?: readonly string[];
};

export type RemotePage = { readonly options: readonly RemoteOption[]; readonly total: number };

export type RemotePageLoader = (search: string, page: number, signal: AbortSignal) => Promise<RemotePage>;

const SEARCH_PAUSE_MS = 250;
const LOAD_MORE_DISTANCE_PX = 48;
const OPEN_KEYS = new Set(['Enter', ' ', 'ArrowDown', 'ArrowUp']);
const PANEL_MIN_WIDTH = 320;
const panelMinWidth = () => PANEL_MIN_WIDTH;

export function RemoteSelect({
    ariaLabel,
    allLabel,
    searchPlaceholder,
    value,
    disabled = false,
    invalid = false,
    load,
    loadPage,
    onChange,
}: {
    readonly ariaLabel: string;
    readonly allLabel: string;
    readonly searchPlaceholder: string;
    readonly value: RemoteOption | undefined;
    readonly disabled?: boolean;
    readonly invalid?: boolean;
    readonly load?: (search: string, signal: AbortSignal) => Promise<readonly RemoteOption[]>;
    readonly loadPage?: RemotePageLoader;
    readonly onChange: (option: RemoteOption | undefined) => void;
}) {
    const listId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<readonly RemoteOption[]>([]);
    const [total, setTotal] = useState(0);
    const t = useT();
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const loadedPage = useRef(1);
    const moreController = useRef<AbortController | null>(null);
    const pageOf = (): RemotePageLoader =>
        loadPage ??
        (async (search, _page, signal) => {
            const found = load ? await load(search, signal) : [];
            return { options: found, total: found.length };
        });
    const loadOptions = useRef(pageOf());
    useFloatingPanel(selectRef, panelRef, open && !disabled, panelMinWidth);

    useEffect(() => {
        loadOptions.current = pageOf();
    });

    useEffect(() => {
        if (!open) return;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            setLoading(true);
            moreController.current?.abort();
            setLoadingMore(false);
            loadOptions
                .current(query.trim(), 1, controller.signal)
                .then((found) => {
                    loadedPage.current = 1;
                    setOptions(found.options);
                    setTotal(found.total);
                    setActiveIndex(0);
                })
                .catch(() => {
                    setOptions([]);
                    setTotal(0);
                })
                .finally(() => setLoading(false));
        }, SEARCH_PAUSE_MS);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [open, query]);

    useEffect(() => {
        if (!open) return;
        searchRef.current?.focus();
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', closeOnOutsideClick);
        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, [open]);

    const choices: readonly (RemoteOption | undefined)[] = [undefined, ...options];

    const loadMore = () => {
        if (loading || loadingMore || options.length >= total) return;
        const controller = new AbortController();
        moreController.current = controller;
        setLoadingMore(true);
        const nextPage = loadedPage.current + 1;
        loadOptions
            .current(query.trim(), nextPage, controller.signal)
            .then((next) => {
                loadedPage.current = nextPage;
                setTotal(next.total);
                setOptions((current) => [
                    ...current,
                    ...next.options.filter((option) => !current.some((had) => had.id === option.id)),
                ]);
            })
            .catch(() => undefined)
            .finally(() => {
                if (!controller.signal.aborted) setLoadingMore(false);
            });
    };

    const onListScroll = (event: UIEvent<HTMLUListElement>) => {
        const list = event.currentTarget;
        if (list.scrollTop + list.clientHeight >= list.scrollHeight - LOAD_MORE_DISTANCE_PX) loadMore();
    };

    const choose = (option: RemoteOption | undefined) => {
        setOpen(false);
        setQuery('');
        selectRef.current?.focus();
        onChange(option);
    };

    const onSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
            selectRef.current?.focus();
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (activeIndex >= choices.length - 2) loadMore();
            setActiveIndex((index) => Math.min(index + 1, choices.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            choose(choices[activeIndex]);
        }
    };

    return (
        <div className="picker fw-sm" ref={rootRef}>
            <select
                ref={selectRef}
                className="select fw-sm"
                aria-label={ariaLabel}
                aria-invalid={invalid ? true : undefined}
                disabled={disabled}
                aria-expanded={open}
                aria-controls={listId}
                value={value?.id ?? ''}
                onChange={() => undefined}
                onMouseDown={(event) => {
                    event.preventDefault();
                    setOpen((isOpen) => !isOpen);
                }}
                onKeyDown={(event) => {
                    if (!OPEN_KEYS.has(event.key)) return;
                    event.preventDefault();
                    setOpen(true);
                }}
            >
                <option value="">{allLabel}</option>
                {value && <option value={value.id}>{value.label}</option>}
            </select>
            {open && !disabled && (
                <div className="picker-panel" ref={panelRef}>
                    <input
                        ref={searchRef}
                        className="input"
                        placeholder={searchPlaceholder}
                        aria-label={t('Search {field}', { field: ariaLabel })}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={onSearchKey}
                    />
                    <ul
                        className="picker-list"
                        id={listId}
                        role="listbox"
                        aria-label={ariaLabel}
                        onScroll={onListScroll}
                    >
                        {choices.map((option, index) => (
                            <li
                                key={option?.id ?? 'all'}
                                role="option"
                                aria-selected={(option?.id ?? undefined) === value?.id}
                                className={`picker-option${index === activeIndex ? ' is-active' : ''}`}
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    choose(option);
                                }}
                            >
                                {option ? option.label : allLabel}
                                {option?.context && <span className="picker-context"> · {option.context}</span>}
                                {option?.details && option.details.length > 0 && (
                                    <span className="picker-details">{option.details.join(' · ')}</span>
                                )}
                            </li>
                        ))}
                        {!loading && options.length === 0 && <li className="picker-empty">{t('No matches')}</li>}
                        {(loading || loadingMore) && <li className="picker-empty">{t('Loading…')}</li>}
                    </ul>
                </div>
            )}
        </div>
    );
}
