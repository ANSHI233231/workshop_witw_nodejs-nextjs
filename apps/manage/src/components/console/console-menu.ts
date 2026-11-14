import type { ConsoleAccess } from '@/types/console.types';

export type ConsoleIconName =
    | 'DashboardIcon'
    | 'SharedSafariIcon'
    | 'PartnersIcon'
    | 'PackagesIcon'
    | 'UserRoleIcon'
    | 'SettingsIcon';

export type ConsoleMenuLink = {
    readonly label: string;
    readonly screen: string;
    readonly href: string | undefined;
    readonly matches?: readonly string[];
    readonly isLead?: boolean;
};

export type ConsoleMenuSubgroup = {
    readonly kind: 'subgroup';
    readonly key: string;
    readonly label: string;
    readonly heading?: string;
    readonly links: readonly ConsoleMenuLink[];
};

export type ConsoleMenuNode =
    | { readonly kind: 'section'; readonly label: string; readonly color: string }
    | {
          readonly kind: 'flat';
          readonly key: string;
          readonly label: string;
          readonly color: string;
          readonly subgroup: ConsoleMenuSubgroup;
      }
    | ({ readonly kind: 'link'; readonly icon: ConsoleIconName } & ConsoleMenuLink)
    | {
          readonly kind: 'group';
          readonly key: string;
          readonly label: string;
          readonly icon: ConsoleIconName;
          readonly children: readonly (ConsoleMenuLink | ConsoleMenuSubgroup)[];
      };

export const CONSOLE_MENU: readonly ConsoleMenuNode[] = [
    { kind: 'link', label: 'Dashboard', icon: 'DashboardIcon', screen: 'Admin-Dashboard', href: '/' },
    {
        kind: 'group',
        key: 'shared-safari',
        label: 'Shared Safari',
        icon: 'SharedSafariIcon',
        children: [
            { label: 'Shared Safaris', screen: 'C1-Shared-Safaris-list', href: '/shared-safaris' },
            { label: 'Flagged Comments', screen: 'C4-Flagged-Comments', href: '/flagged-comments' },
            { label: 'Parks', screen: 'C5-Parks-list', href: '/parks' },
            { label: 'Flag Reasons', screen: 'C7-Flag-Reasons', href: '/flag-reasons' },
        ],
    },
    {
        kind: 'group',
        key: 'partners',
        label: 'Partners',
        icon: 'PartnersIcon',
        children: [
            { label: 'Partner Requests', screen: 'PC1-Partner-Requests', href: '/partner-requests' },
            { label: 'Partners', screen: 'PC2-Partners', href: '/partners' },
            { label: 'Quote Requests', screen: 'PC9-Quote-Requests', href: '/quote-requests' },
        ],
    },
    {
        kind: 'group',
        key: 'packages',
        label: 'Packages',
        icon: 'PackagesIcon',
        children: [
            { label: 'Package Approvals', screen: 'PC3-Package-Approvals', href: '/package-approvals' },
            { label: 'Packages', screen: 'PC4-Packages', href: '/packages' },
            { label: 'Gallery Approvals', screen: 'PC7-Gallery-Approvals', href: '/gallery-approvals' },
            { label: 'Galleries', screen: 'PC8-Galleries', href: '/galleries' },
            { label: 'Package Delete Reasons', screen: 'PC6-Package-Delete-Reasons', href: '/package-delete-reasons' },
        ],
    },
    { kind: 'section', label: 'Platform', color: 'var(--color-primary)' },
    {
        kind: 'group',
        key: 'user-and-role',
        label: 'User & Role',
        icon: 'UserRoleIcon',
        children: [
            { label: 'Users', screen: 'Admin-Users-Roles-Users', href: '/users' },
            { label: 'Roles', screen: 'Admin-Users-Roles-Roles', href: '/roles' },
        ],
    },
    {
        kind: 'group',
        key: 'settings',
        label: 'System',
        icon: 'SettingsIcon',
        children: [
            {
                kind: 'subgroup',
                key: 'settings/notification',
                label: 'Notification',
                links: [
                    {
                        label: 'Notification Templates',
                        screen: 'Admin-Notification-Templates',
                        href: '/notifications/templates',
                    },
                    { label: 'Delivery Log', screen: 'Admin-Delivery-Log', href: '/notifications/delivery-log' },
                ],
            },
            {
                kind: 'subgroup',
                key: 'settings/logs',
                label: 'Logs',
                links: [
                    { label: 'Audit Log', screen: 'Admin-Audit-Log', href: '/audit-log' },
                    { label: 'System Logs', screen: 'Admin-System-Logs', href: '/system-logs' },
                    { label: 'Error Logs', screen: 'Admin-Error-Logs', href: '/error-logs' },
                ],
            },
            { label: 'Background Jobs', screen: 'Admin-Background-Jobs', href: '/background-jobs' },
            {
                kind: 'subgroup',
                key: 'settings/languages',
                label: 'Languages',
                links: [
                    { label: 'Language Master', screen: 'Admin-Language-Master', href: '/languages/master' },
                    {
                        label: 'App Translations',
                        screen: 'Admin-Language-Translation',
                        href: '/languages/translations',
                    },
                ],
            },
            { label: 'Tech Documentation', screen: 'Admin-Tech-Documentation', href: '/docs' },
        ],
    },
];

const MENUS: Readonly<Record<ConsoleAccess, readonly ConsoleMenuNode[]>> = {
    super: CONSOLE_MENU,
};

export const consoleMenuFor = (access: ConsoleAccess): readonly ConsoleMenuNode[] => MENUS[access];
