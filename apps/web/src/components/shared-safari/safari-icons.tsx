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

export function CloseIcon() {
    return (
        <Icon>
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
        </Icon>
    );
}

export function MapPinIcon() {
    return (
        <Icon>
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
            <circle cx="12" cy="10" r="3"></circle>
        </Icon>
    );
}

export function SearchIcon({ className }: IconProps) {
    return (
        <Icon className={className}>
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
        </Icon>
    );
}

export function BinocularsStateIcon({ className }: IconProps) {
    return (
        <Icon className={className}>
            <path d="M10 10h4"></path>
            <path d="M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"></path>
            <path d="M20 21a2 2 0 0 0 2-2v-3.851c0-1.39-2-2.962-2-4.829V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2z"></path>
            <path d="M 22 16 L 2 16"></path>
            <path d="M4 21a2 2 0 0 1-2-2v-3.851c0-1.39 2-2.962 2-4.829V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2z"></path>
            <path d="M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3"></path>
        </Icon>
    );
}

export function SlidersIcon() {
    return (
        <Icon>
            <line x1="21" x2="14" y1="4" y2="4"></line>
            <line x1="10" x2="3" y1="4" y2="4"></line>
            <line x1="21" x2="12" y1="12" y2="12"></line>
            <line x1="8" x2="3" y1="12" y2="12"></line>
            <line x1="21" x2="16" y1="20" y2="20"></line>
            <line x1="12" x2="3" y1="20" y2="20"></line>
            <line x1="14" x2="14" y1="2" y2="6"></line>
            <line x1="8" x2="8" y1="10" y2="14"></line>
            <line x1="16" x2="16" y1="18" y2="22"></line>
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

export function CalendarIcon() {
    return (
        <Icon>
            <path d="M8 2v4"></path>
            <path d="M16 2v4"></path>
            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
            <path d="M3 10h18"></path>
        </Icon>
    );
}

export function UsersIcon({ className }: IconProps) {
    return (
        <Icon className={className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </Icon>
    );
}

export function CarIcon() {
    return (
        <Icon>
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
            <circle cx="7" cy="17" r="2"></circle>
            <path d="M9 17h6"></path>
            <circle cx="17" cy="17" r="2"></circle>
        </Icon>
    );
}

export function BuildingIcon() {
    return (
        <Icon>
            <rect width="16" height="20" x="4" y="2" rx="2"></rect>
            <path d="M9 22v-4h6v4"></path>
            <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"></path>
        </Icon>
    );
}

export function RupeeIcon() {
    return (
        <Icon>
            <path d="M6 3h12"></path>
            <path d="M6 8h12"></path>
            <path d="m6 13 8.5 8"></path>
            <path d="M6 13h3"></path>
            <path d="M9 13c6.667 0 6.667-10 0-10"></path>
        </Icon>
    );
}

export function InfoIcon() {
    return (
        <Icon>
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
        </Icon>
    );
}

export function CheckCircleIcon() {
    return (
        <Icon>
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m16 9-5.5 5.5L8 12"></path>
        </Icon>
    );
}

export function FacebookIcon() {
    return (
        <Icon>
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </Icon>
    );
}

export function XLogoIcon() {
    return (
        <Icon>
            <path d="M4 4l11.733 16H20L8.267 4z"></path>
            <path d="M4 20l6.768-6.768"></path>
            <path d="M20 4l-6.768 6.768"></path>
        </Icon>
    );
}

export function InstagramLogoIcon() {
    return (
        <Icon>
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
        </Icon>
    );
}

export function WhatsAppIcon() {
    return (
        <Icon>
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
        </Icon>
    );
}

export function LinkedInIcon() {
    return (
        <Icon>
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect width="4" height="12" x="2" y="9"></rect>
            <circle cx="4" cy="4" r="2"></circle>
        </Icon>
    );
}

export function TelegramIcon() {
    return (
        <Icon>
            <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
            <path d="m21.854 2.147-10.94 10.939"></path>
        </Icon>
    );
}

export function LinkIcon() {
    return (
        <Icon>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </Icon>
    );
}

export function FlagIcon() {
    return (
        <Icon>
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" x2="4" y1="22" y2="15"></line>
        </Icon>
    );
}

export function PencilIcon() {
    return (
        <Icon>
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
            <path d="m15 5 4 4"></path>
        </Icon>
    );
}

export function TrashIcon() {
    return (
        <Icon>
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            <line x1="10" x2="10" y1="11" y2="17"></line>
            <line x1="14" x2="14" y1="11" y2="17"></line>
        </Icon>
    );
}

export function ReplyIcon() {
    return (
        <Icon>
            <polyline points="15 10 20 15 15 20"></polyline>
            <path d="M4 4v7a4 4 0 0 0 4 4h12"></path>
        </Icon>
    );
}

export function EyeIcon() {
    return (
        <Icon>
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </Icon>
    );
}

export function ToggleIcon() {
    return (
        <Icon>
            <rect width="20" height="12" x="2" y="6" rx="6" ry="6"></rect>
            <circle cx="16" cy="12" r="2"></circle>
        </Icon>
    );
}

export function LeaveIcon() {
    return (
        <Icon>
            <path d="m16 17 5-5-5-5"></path>
            <path d="M21 12H9"></path>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        </Icon>
    );
}

export function PlusIcon() {
    return (
        <Icon>
            <path d="M5 12h14"></path>
            <path d="M12 5v14"></path>
        </Icon>
    );
}

export function ArrowUpIcon() {
    return (
        <Icon>
            <path d="m5 12 7-7 7 7"></path>
            <path d="M12 19V5"></path>
        </Icon>
    );
}
