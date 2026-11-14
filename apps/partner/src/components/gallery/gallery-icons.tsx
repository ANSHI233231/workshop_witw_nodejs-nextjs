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

export function ChevronLeftIcon() {
    return (
        <Svg>
            <path d="m15 18-6-6 6-6"></path>
        </Svg>
    );
}

export function ChevronRightIcon() {
    return (
        <Svg>
            <path d="m9 18 6-6-6-6"></path>
        </Svg>
    );
}

export function UploadIcon() {
    return (
        <Svg>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" x2="12" y1="3" y2="15"></line>
        </Svg>
    );
}

export function EmptyGalleryIcon() {
    return (
        <Svg>
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
        </Svg>
    );
}
