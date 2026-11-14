import type { ReactNode } from 'react';

function Icon({ children, className = 'icon ' }: { readonly children: ReactNode; readonly className?: string }) {
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

type IconProps = { readonly className?: string };

export function StarIcon() {
    return (
        <Icon>
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
        </Icon>
    );
}

export function ClockIcon() {
    return (
        <Icon>
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </Icon>
    );
}

export function BedIcon() {
    return (
        <Icon>
            <path d="M2 4v16"></path>
            <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
            <path d="M2 17h20"></path>
            <path d="M6 8v9"></path>
        </Icon>
    );
}

export function CameraIcon() {
    return (
        <Icon>
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
            <circle cx="12" cy="13" r="3"></circle>
        </Icon>
    );
}

export function FlagIcon() {
    return (
        <Icon>
            <path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"></path>
        </Icon>
    );
}

export function UtensilsIcon() {
    return (
        <Icon>
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
            <path d="M7 2v20"></path>
            <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
        </Icon>
    );
}

export function ChevronLeftIcon() {
    return (
        <Icon>
            <path d="m15 18-6-6 6-6"></path>
        </Icon>
    );
}

export function ChevronRightIcon() {
    return (
        <Icon>
            <path d="m9 18 6-6-6-6"></path>
        </Icon>
    );
}

export function ChevronDownIcon() {
    return (
        <Icon>
            <path d="m6 9 6 6 6-6"></path>
        </Icon>
    );
}

export function CheckIcon() {
    return (
        <Icon>
            <path d="M20 6 9 17l-5-5"></path>
        </Icon>
    );
}

export function CrossIcon() {
    return (
        <Icon>
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
        </Icon>
    );
}

export function PackageStateIcon({ className }: IconProps) {
    return (
        <Icon className={className}>
            <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path>
            <path d="M12 22V12"></path>
            <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"></path>
            <path d="m7.5 4.27 9 5.15"></path>
        </Icon>
    );
}

export function ExternalIcon() {
    return (
        <Icon>
            <path d="M15 3h6v6"></path>
            <path d="M10 14 21 3"></path>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        </Icon>
    );
}
