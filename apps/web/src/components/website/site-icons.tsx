import type { ReactNode } from 'react';

function SiteIcon({ children }: { readonly children: ReactNode }) {
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

export function UserCircleIcon() {
    return (
        <SiteIcon>
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="10" r="3"></circle>
            <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
        </SiteIcon>
    );
}

export function BinocularsIcon() {
    return (
        <SiteIcon>
            <path d="M10 10h4"></path>
            <path d="M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"></path>
            <path d="M20 21a2 2 0 0 0 2-2v-3.851c0-1.39-2-2.962-2-4.829V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2z"></path>
            <path d="M 22 16 L 2 16"></path>
            <path d="M4 21a2 2 0 0 1-2-2v-3.851c0-1.39 2-2.962 2-4.829V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2z"></path>
            <path d="M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3"></path>
        </SiteIcon>
    );
}

export function LockIcon() {
    return (
        <SiteIcon>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </SiteIcon>
    );
}

export function LogOutIcon() {
    return (
        <SiteIcon>
            <path d="m16 17 5-5-5-5"></path>
            <path d="M21 12H9"></path>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        </SiteIcon>
    );
}

export function InstagramIcon() {
    return (
        <SiteIcon>
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
        </SiteIcon>
    );
}

export function ArrowLeftIcon() {
    return (
        <SiteIcon>
            <path d="m12 19-7-7 7-7"></path>
            <path d="M19 12H5"></path>
        </SiteIcon>
    );
}

export function ArrowUpIcon() {
    return (
        <SiteIcon>
            <path d="m5 12 7-7 7 7"></path>
            <path d="M12 19V5"></path>
        </SiteIcon>
    );
}

export function ExternalLinkIcon() {
    return (
        <SiteIcon>
            <path d="M15 3h6v6"></path>
            <path d="M10 14 21 3"></path>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        </SiteIcon>
    );
}

export function SendIcon() {
    return (
        <SiteIcon>
            <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
            <path d="m21.854 2.147-10.94 10.939"></path>
        </SiteIcon>
    );
}

export function MailIcon() {
    return (
        <SiteIcon>
            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
        </SiteIcon>
    );
}

export function UserIcon() {
    return (
        <SiteIcon>
            <circle cx="12" cy="8" r="5"></circle>
            <path d="M20 21a8 8 0 0 0-16 0"></path>
        </SiteIcon>
    );
}

export function PackageBoxIcon() {
    return (
        <SiteIcon>
            <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path>
            <path d="M12 22V12"></path>
            <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"></path>
            <path d="m7.5 4.27 9 5.15"></path>
        </SiteIcon>
    );
}

export function HeartIcon() {
    return (
        <SiteIcon>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
        </SiteIcon>
    );
}

export function MessageSquareIcon() {
    return (
        <SiteIcon>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </SiteIcon>
    );
}
