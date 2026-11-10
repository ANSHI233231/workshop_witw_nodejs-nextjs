import type { ReactNode } from 'react';

function Svg({ className = 'icon ', children }: { readonly className?: string; readonly children: ReactNode }) {
    return (
        <svg
            className={className}
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

export function FlagStateIcon() {
    return (
        <Svg className="icon state-icon">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" x2="4" y1="22" y2="15"></line>
        </Svg>
    );
}
