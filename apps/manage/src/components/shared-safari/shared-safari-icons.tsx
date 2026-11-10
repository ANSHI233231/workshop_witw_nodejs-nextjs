import type { ReactNode } from 'react';

function Svg({ children, className = 'icon ' }: { readonly children: ReactNode; readonly className?: string }) {
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

const PIN_PATH =
    'M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z';

export function PinIcon() {
    return (
        <Svg>
            <path d="M12 17v5"></path>
            <path d={PIN_PATH}></path>
        </Svg>
    );
}

export function PinToggleIcon() {
    return (
        <Svg className="icon ssc-pin">
            <path d="M12 17v5"></path>
            <path d={PIN_PATH}></path>
        </Svg>
    );
}

export function TrashIcon() {
    return (
        <Svg>
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            <line x1="10" x2="10" y1="11" y2="17"></line>
            <line x1="14" x2="14" y1="11" y2="17"></line>
        </Svg>
    );
}

export function FlagIcon({ state = false }: { readonly state?: boolean }) {
    return (
        <Svg className={state ? 'icon state-icon' : 'icon '}>
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" x2="4" y1="22" y2="15"></line>
        </Svg>
    );
}

export function IgnoreIcon() {
    return (
        <Svg>
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m16 9-5.5 5.5L8 12"></path>
        </Svg>
    );
}

export function WarningIcon() {
    return (
        <Svg>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
            <path d="M12 9v4"></path>
            <path d="M12 17h.01"></path>
        </Svg>
    );
}

export function SearchStateIcon() {
    return (
        <Svg className="icon state-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
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
