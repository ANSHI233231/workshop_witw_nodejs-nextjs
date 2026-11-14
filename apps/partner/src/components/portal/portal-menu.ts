import type { PartnerState } from '@/types/portal.types';

export type PortalIconName =
    | 'DashboardIcon'
    | 'PackagesIcon'
    | 'GalleryIcon'
    | 'QuoteRequestsIcon'
    | 'NotificationsIcon'
    | 'BusinessProfileIcon'
    | 'PartnerRequestIcon';

export type PortalMenuItem = { readonly label: string; readonly href: string; readonly icon: PortalIconName };

export const PARTNER_MENU: readonly PortalMenuItem[] = [
    { label: 'Dashboard', href: '/', icon: 'DashboardIcon' },
    { label: 'Packages', href: '/packages', icon: 'PackagesIcon' },
    { label: 'Gallery', href: '/gallery', icon: 'GalleryIcon' },
    { label: 'Quote Requests', href: '/quote-requests', icon: 'QuoteRequestsIcon' },
    { label: 'Notifications', href: '/notifications', icon: 'NotificationsIcon' },
    { label: 'Business Profile', href: '/business-profile', icon: 'BusinessProfileIcon' },
];

export const REQUEST_MENU: readonly PortalMenuItem[] = [
    { label: 'Partner request', href: '/partner-request', icon: 'PartnerRequestIcon' },
];

export const portalMenuFor = (state: PartnerState): readonly PortalMenuItem[] =>
    state === 'active' ? PARTNER_MENU : REQUEST_MENU;
