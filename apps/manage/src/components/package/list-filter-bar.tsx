'use client';

import { CloseIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';

export type FilterSelect = {
    readonly label: string;
    readonly allLabel: string;
    readonly value: string;
    readonly options: readonly { readonly value: string; readonly label: string }[];
    readonly onChange: (value: string, search: string) => void;
};

export function ListFilterBar({
    placeholder,
    search,
    maxLength,
    selects,
    filtered,
    onSearch,
    onClear,
}: {
    readonly placeholder: string;
    readonly search: string;
    readonly maxLength: number;
    readonly selects: readonly FilterSelect[];
    readonly filtered: boolean;
    readonly onSearch: (search: string) => void;
    readonly onClear: () => void;
}) {
    const t = useT();
    const [text, setText, clearText] = useSearchText(search, onSearch);
    return (
        <div className="filter-bar">
            <div className="ssc-tools" style={{ flexWrap: 'wrap' }}>
                <div className="input-group fw-md">
                    <SearchIcon />
                    <input
                        className="input"
                        placeholder={placeholder}
                        aria-label={t('Search')}
                        maxLength={maxLength}
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                    />
                </div>
                {selects.map((select) => (
                    <select
                        key={select.label}
                        className="select fw-sm"
                        aria-label={select.label}
                        value={select.value}
                        onChange={(event) => select.onChange(event.target.value, text.trim())}
                    >
                        <option value="">{select.allLabel}</option>
                        {select.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ))}
            </div>
            {(filtered || text.trim() !== '') && (
                <button
                    type="button"
                    className="btn btn-text ssc-clear"
                    onClick={() => {
                        clearText();
                        onClear();
                    }}
                >
                    <CloseIcon />
                    {t('Clear filters')}
                </button>
            )}
        </div>
    );
}
