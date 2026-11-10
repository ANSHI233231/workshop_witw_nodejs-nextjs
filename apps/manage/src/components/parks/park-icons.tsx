import type { ReactNode } from 'react';

function Svg({ children }: { readonly children: ReactNode }) {
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
            {children}
        </svg>
    );
}

export function StatusToggleIcon() {
    return (
        <Svg>
            <rect width="20" height="12" x="2" y="6" rx="6" ry="6"></rect>
            <circle cx="16" cy="12" r="2"></circle>
        </Svg>
    );
}

export function FiltersIcon() {
    return (
        <Svg>
            <line x1="21" x2="14" y1="4" y2="4"></line>
            <line x1="10" x2="3" y1="4" y2="4"></line>
            <line x1="21" x2="12" y1="12" y2="12"></line>
            <line x1="8" x2="3" y1="12" y2="12"></line>
            <line x1="21" x2="16" y1="20" y2="20"></line>
            <line x1="12" x2="3" y1="20" y2="20"></line>
            <line x1="14" x2="14" y1="2" y2="6"></line>
            <line x1="8" x2="8" y1="10" y2="14"></line>
            <line x1="16" x2="16" y1="18" y2="22"></line>
        </Svg>
    );
}
