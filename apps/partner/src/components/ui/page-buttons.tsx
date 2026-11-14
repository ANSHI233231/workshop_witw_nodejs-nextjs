'use client';

import { useT } from '@/hooks/i18n/use-t';
import { formatCount } from '@/lib/format';

const EDGE_PAGES = 3;

type PageSlot = { readonly kind: 'page'; readonly page: number } | { readonly kind: 'gap'; readonly after: number };

const pageSlots = (page: number, totalPages: number): PageSlot[] => {
    const shown = new Set<number>([1, totalPages, page - 1, page, page + 1]);
    if (page <= 2) for (let number = 1; number <= EDGE_PAGES; number += 1) shown.add(number);
    if (page >= totalPages - 1)
        for (let number = totalPages - EDGE_PAGES + 1; number <= totalPages; number += 1) shown.add(number);
    const pages = [...shown].filter((number) => number >= 1 && number <= totalPages).sort((a, b) => a - b);
    return pages.flatMap((number, index): PageSlot[] => {
        const previous = pages[index - 1];
        const slot: PageSlot = { kind: 'page', page: number };
        return previous !== undefined && number - previous > 1 ? [{ kind: 'gap', after: previous }, slot] : [slot];
    });
};

function ChevronIcon({ path }: { readonly path: string }) {
    return (
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
            <path d={path}></path>
        </svg>
    );
}

export function PageButtons({
    page,
    totalPages,
    onPage,
    disabled = false,
}: {
    readonly page: number;
    readonly totalPages: number;
    readonly onPage: (page: number) => void;
    readonly disabled?: boolean;
}) {
    const t = useT();
    const pageCount = Math.max(1, totalPages);
    return (
        <div className="pagination">
            <button
                type="button"
                className="page-btn"
                aria-label={t('Previous page')}
                disabled={disabled || page <= 1}
                onClick={() => onPage(page - 1)}
            >
                <ChevronIcon path="m15 18-6-6 6-6" />
            </button>
            {pageSlots(page, pageCount).map((slot) =>
                slot.kind === 'gap' ? (
                    <span key={`gap-${slot.after}`} className="page-btn" aria-hidden="true">
                        …
                    </span>
                ) : (
                    <button
                        key={slot.page}
                        type="button"
                        className="page-btn"
                        aria-current={slot.page === page ? 'page' : undefined}
                        disabled={disabled}
                        onClick={() => onPage(slot.page)}
                    >
                        {formatCount(slot.page)}
                    </button>
                ),
            )}
            <button
                type="button"
                className="page-btn"
                aria-label={t('Next page')}
                disabled={disabled || page >= pageCount}
                onClick={() => onPage(page + 1)}
            >
                <ChevronIcon path="m9 18 6-6-6-6" />
            </button>
        </div>
    );
}
