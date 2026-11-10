'use client';

import { useEffect, useRef, useState } from 'react';

import { ChevronDownIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import type { HostOption } from '@/types/shared-safari.types';

type HostFilterProps = {
    readonly hosts: readonly HostOption[];
    readonly hostId: number | undefined;
    readonly onChange: (hostId: number | undefined) => void;
};

export function HostFilter({ hosts, hostId, onChange }: HostFilterProps) {
    const t = useT();
    const rootRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const chosen = hosts.find((host) => host.id === hostId);
    const needle = query.trim().toLowerCase();
    const shown = [
        { id: undefined, name: t('Any') },
        ...hosts.map((host) => ({ id: host.id as number | undefined, name: host.name })),
    ].filter((option) => needle === '' || (option.id !== undefined && option.name.toLowerCase().includes(needle)));

    useEffect(() => {
        if (!open) return;
        const closeOutside = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', closeOutside);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('mousedown', closeOutside);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [open]);

    const pick = (id: number | undefined) => {
        setOpen(false);
        onChange(id);
    };

    return (
        <div className="ss ssc-ss" ref={rootRef}>
            <button
                type="button"
                className="select ss-sel fw-sm"
                style={{ minWidth: 180 }}
                aria-label={t('Host')}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => {
                    setQuery('');
                    setOpen(!open);
                }}
            >
                <span>{chosen ? t('Host: {name}', { name: chosen.name }) : t('Host: Any')}</span>
                <ChevronDownIcon />
            </button>
            {open && (
                <div className="ss-pop" role="dialog" aria-label={t('Choose a host')}>
                    <div className="input-group">
                        <SearchIcon />
                        <input
                            className="input"
                            placeholder={t('Search host…')}
                            aria-label={t('Search host')}
                            value={query}
                            autoFocus
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>
                    <ul className="ss-list" role="listbox" aria-label={t('Hosts')}>
                        {shown.map((option) => (
                            <li
                                key={option.id ?? 'any'}
                                className={option.id === hostId ? 'ss-opt is-active' : 'ss-opt'}
                                role="option"
                                aria-selected={option.id === hostId}
                                onClick={() => pick(option.id)}
                            >
                                {option.name}
                            </li>
                        ))}
                    </ul>
                    {shown.length === 0 && <p className="ss-empty">{t('No hosts found.')}</p>}
                </div>
            )}
        </div>
    );
}
