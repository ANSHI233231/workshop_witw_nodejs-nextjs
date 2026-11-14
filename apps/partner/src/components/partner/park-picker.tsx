'use client';

import { useState } from 'react';

import { CloseIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import type { ParkOption } from '@/types/partner.types';

export function ParkPicker({
    parks,
    selected,
    error,
    onChange,
}: {
    readonly parks: readonly ParkOption[];
    readonly selected: readonly number[];
    readonly error: string | undefined;
    readonly onChange: (ids: readonly number[]) => void;
}) {
    const t = useT();
    const [query, setQuery] = useState('');
    const needle = query.trim().toLowerCase();
    const shown = needle ? parks.filter((park) => park.name.toLowerCase().includes(needle)) : parks;
    const picked = selected.flatMap((id) => parks.filter((park) => park.id === id));
    const toggle = (id: number) =>
        onChange(selected.includes(id) ? selected.filter((current) => current !== id) : [...selected, id]);

    return (
        <div className={error ? 'field is-invalid' : 'field'}>
            <span className="label" id="pk-parks-l">
                {t('Parks you operate in')}
                <span className="req" aria-hidden="true">
                    *
                </span>
            </span>
            <div className="pk-parkbox">
                {picked.length > 0 && (
                    <div className="pk-picked">
                        {picked.map((park) => (
                            <span key={park.id} className="ss-chip">
                                {park.name}
                                <button
                                    type="button"
                                    className="btn-icon"
                                    aria-label={t('Remove {name}', { name: park.name })}
                                    onClick={() => toggle(park.id)}
                                >
                                    <CloseIcon />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                <div className="input-group">
                    <SearchIcon />
                    <input
                        className="input"
                        placeholder={t('Search parks')}
                        aria-label={t('Search parks')}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>
                <div className="pk-parklist" role="group" aria-label={t('Parks')}>
                    {shown.map((park) => (
                        <label key={park.id} className="check">
                            <input
                                type="checkbox"
                                checked={selected.includes(park.id)}
                                onChange={() => toggle(park.id)}
                            />
                            {park.name}
                        </label>
                    ))}
                </div>
            </div>
            {error && (
                <span className="error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
