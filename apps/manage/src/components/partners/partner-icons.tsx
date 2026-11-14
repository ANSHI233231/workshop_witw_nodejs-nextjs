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

export function ApproveIcon() {
    return (
        <Svg>
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m16 9-5.5 5.5L8 12"></path>
        </Svg>
    );
}

export function RejectIcon() {
    return (
        <Svg>
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m15 9-6 6"></path>
            <path d="m9 9 6 6"></path>
        </Svg>
    );
}

export function ToggleStatusIcon() {
    return (
        <Svg>
            <rect width="20" height="12" x="2" y="6" rx="6" ry="6"></rect>
            <circle cx="16" cy="12" r="2"></circle>
        </Svg>
    );
}

export function EmptyListIcon() {
    return (
        <Svg>
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
        </Svg>
    );
}
