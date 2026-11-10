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
