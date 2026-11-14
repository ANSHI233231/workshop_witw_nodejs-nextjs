import type { ReactNode } from 'react';

function Svg({ children, filled = false }: { readonly children: ReactNode; readonly filled?: boolean }) {
    return (
        <svg
            className="icon "
            viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
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

export function PinIcon() {
    return (
        <Svg>
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle>
        </Svg>
    );
}

export function StarIcon() {
    return (
        <Svg filled>
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
        </Svg>
    );
}

export function ClockFactIcon() {
    return (
        <Svg>
            <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
        </Svg>
    );
}

export function CarIcon() {
    return (
        <Svg>
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle>
        </Svg>
    );
}

export function BedIcon() {
    return (
        <Svg>
            <path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path>
        </Svg>
    );
}

export function CameraIcon() {
    return (
        <Svg>
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle>
        </Svg>
    );
}

export function FlagIcon() {
    return (
        <Svg>
            <path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"></path>
        </Svg>
    );
}

export function UtensilsIcon() {
    return (
        <Svg>
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
        </Svg>
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

export function TickIcon() {
    return (
        <Svg>
            <path d="M20 6 9 17l-5-5"></path>
        </Svg>
    );
}

export function CrossIcon() {
    return (
        <Svg>
            <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
        </Svg>
    );
}

export function ChevronDownIcon() {
    return (
        <Svg>
            <path d="m6 9 6 6 6-6"></path>
        </Svg>
    );
}
