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

export function BreadcrumbChevronIcon() {
    return (
        <Svg>
            <path d="m9 18 6-6-6-6"></path>
        </Svg>
    );
}

export function ExportIcon() {
    return (
        <Svg>
            <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path>{' '}
            <path d="M14 2v5a1 1 0 0 0 1 1h5"></path> <path d="M12 18v-6"></path> <path d="m9 15 3 3 3-3"></path>
        </Svg>
    );
}

export function PlusIcon() {
    return (
        <Svg>
            <path d="M5 12h14"></path> <path d="M12 5v14"></path>
        </Svg>
    );
}

export function SearchIcon() {
    return (
        <Svg>
            <path d="m21 21-4.34-4.34"></path> <circle cx="11" cy="11" r="8"></circle>
        </Svg>
    );
}

export function ResetIcon() {
    return (
        <Svg>
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path> <path d="M3 3v5h5"></path>
        </Svg>
    );
}

export function CloseIcon() {
    return (
        <Svg>
            <path d="M18 6 6 18"></path> <path d="m6 6 12 12"></path>
        </Svg>
    );
}

export function KeyIcon() {
    return (
        <Svg>
            <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>{' '}
            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
        </Svg>
    );
}

export function SaveIcon() {
    return (
        <Svg>
            <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path>{' '}
            <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"></path> <path d="M7 3v4a1 1 0 0 0 1 1h7"></path>
        </Svg>
    );
}

export function ViewIcon() {
    return (
        <Svg>
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>{' '}
            <circle cx="12" cy="12" r="3"></circle>
        </Svg>
    );
}

export function EditIcon() {
    return (
        <Svg>
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>{' '}
            <path d="m15 5 4 4"></path>
        </Svg>
    );
}

export function DeleteIcon() {
    return (
        <Svg>
            <path d="M10 11v6"></path> <path d="M14 11v6"></path>{' '}
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path> <path d="M3 6h18"></path>{' '}
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </Svg>
    );
}

export function ImportIcon() {
    return (
        <Svg>
            <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path>{' '}
            <path d="M14 2v5a1 1 0 0 0 1 1h5"></path> <path d="M12 12v6"></path> <path d="m15 15-3-3-3 3"></path>
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

export function CityZoneIcon() {
    return (
        <Svg>
            <path d="M10 12h4"></path> <path d="M10 8h4"></path> <path d="M14 21v-3a2 2 0 0 0-4 0v3"></path>{' '}
            <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"></path>{' '}
            <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>
        </Svg>
    );
}

export function MapPinIcon() {
    return (
        <Svg>
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>{' '}
            <circle cx="12" cy="10" r="3"></circle>
        </Svg>
    );
}

export function RefreshIcon() {
    return (
        <Svg>
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M8 16H3v5"></path>
        </Svg>
    );
}

export function DownloadIcon() {
    return (
        <Svg>
            <path d="M12 15V3"></path>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <path d="m7 10 5 5 5-5"></path>
        </Svg>
    );
}

export function ExpandIcon() {
    return (
        <Svg>
            <path d="M15 3h6v6"></path>
            <path d="m21 3-7 7"></path>
            <path d="m3 21 7-7"></path>
            <path d="M9 21H3v-6"></path>
        </Svg>
    );
}

export function MailIcon() {
    return (
        <Svg>
            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
        </Svg>
    );
}

export function BellIcon() {
    return (
        <Svg>
            <path d="M10.268 21a2 2 0 0 0 3.464 0"></path>
            <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path>
        </Svg>
    );
}

export function CheckIcon() {
    return (
        <Svg>
            <path d="M20 6 9 17l-5-5"></path>
        </Svg>
    );
}

export function InfoIcon() {
    return (
        <Svg>
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
        </Svg>
    );
}

export function AlertCircleIcon() {
    return (
        <Svg>
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 8v4"></path>
            <path d="M12 16h.01"></path>
        </Svg>
    );
}

export function CopyIcon() {
    return (
        <Svg>
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
        </Svg>
    );
}

export function ArrowRightIcon() {
    return (
        <Svg>
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
        </Svg>
    );
}

export function ArrowLeftIcon() {
    return (
        <Svg>
            <path d="m12 19-7-7 7-7"></path>
            <path d="M19 12H5"></path>
        </Svg>
    );
}

export function LockIcon() {
    return (
        <Svg>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect> <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </Svg>
    );
}

export function SwitchIcon() {
    return (
        <Svg>
            <path d="m16 3 4 4-4 4"></path> <path d="M20 7H4"></path> <path d="m8 21-4-4 4-4"></path>{' '}
            <path d="M4 17h16"></path>
        </Svg>
    );
}

export function AssignFeaturesIcon() {
    return (
        <Svg>
            <path d="M13 5h8"></path> <path d="M13 12h8"></path> <path d="M13 19h8"></path>{' '}
            <path d="m3 17 2 2 4-4"></path> <path d="m3 7 2 2 4-4"></path>
        </Svg>
    );
}

export function SlidersIcon() {
    return (
        <Svg>
            <path d="M10 5H3"></path> <path d="M12 19H3"></path> <path d="M14 3v4"></path> <path d="M16 17v4"></path>{' '}
            <path d="M21 12h-9"></path> <path d="M21 19h-5"></path> <path d="M21 5h-7"></path> <path d="M8 10v4"></path>{' '}
            <path d="M8 12H3"></path>
        </Svg>
    );
}

export function TagIcon() {
    return (
        <Svg>
            <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path>{' '}
            <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle>
        </Svg>
    );
}

export function LayersIcon() {
    return (
        <Svg>
            <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path>{' '}
            <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path>{' '}
            <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path>
        </Svg>
    );
}

export function SparklesIcon() {
    return (
        <Svg>
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>{' '}
            <path d="M20 2v4"></path> <path d="M22 4h-4"></path> <circle cx="4" cy="20" r="2"></circle>
        </Svg>
    );
}

export function BuildingIcon() {
    return (
        <Svg>
            <path d="M12 10h.01"></path> <path d="M12 14h.01"></path> <path d="M12 6h.01"></path>{' '}
            <path d="M16 10h.01"></path> <path d="M16 14h.01"></path> <path d="M16 6h.01"></path>{' '}
            <path d="M8 10h.01"></path> <path d="M8 14h.01"></path> <path d="M8 6h.01"></path>{' '}
            <path d="M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"></path>{' '}
            <rect x="4" y="2" width="16" height="20" rx="2"></rect>
        </Svg>
    );
}

export function MapIcon() {
    return (
        <Svg>
            <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"></path>{' '}
            <path d="M15 5.764v15"></path> <path d="M9 3.236v15"></path>
        </Svg>
    );
}

export function PhoneIcon() {
    return (
        <Svg>
            <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path>
        </Svg>
    );
}

export function ImageIcon() {
    return (
        <Svg>
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect> <circle cx="9" cy="9" r="2"></circle>{' '}
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
        </Svg>
    );
}

export function MapServicesIcon() {
    return (
        <Svg>
            <path d="m3 17 2 2 4-4"></path>
            <path d="m3 7 2 2 4-4"></path>
            <path d="M13 6h8"></path>
            <path d="M13 12h8"></path>
            <path d="M13 18h8"></path>
        </Svg>
    );
}

export function ArrowUpIcon() {
    return (
        <Svg>
            <path d="m5 12 7-7 7 7"></path>
            <path d="M12 19V5"></path>
        </Svg>
    );
}

export function ArrowDownIcon() {
    return (
        <Svg>
            <path d="M12 5v14"></path>
            <path d="m19 12-7 7-7-7"></path>
        </Svg>
    );
}

export function ClockIcon() {
    return (
        <Svg>
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
        </Svg>
    );
}

export function PlayIcon() {
    return (
        <Svg>
            <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path>
        </Svg>
    );
}

export function StopIcon() {
    return (
        <Svg>
            <rect width="14" height="14" x="5" y="5" rx="2"></rect>
        </Svg>
    );
}

export function CancelIcon() {
    return (
        <Svg>
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m15 9-6 6"></path>
            <path d="m9 9 6 6"></path>
        </Svg>
    );
}

export function LogsIcon() {
    return (
        <Svg>
            <path d="M15 12h-5"></path>
            <path d="M15 8h-5"></path>
            <path d="M19 17V5a2 2 0 0 0-2-2H4"></path>
            <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"></path>
        </Svg>
    );
}
