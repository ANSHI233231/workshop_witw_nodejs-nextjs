import type { ConsoleAccess } from '@/types/console.types';

export type ConsoleIconName = 'DashboardIcon' | 'UserRoleIcon' | 'SettingsIcon';

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
    { kind: 'link', label: 'Shared Safaris', icon: 'DashboardIcon', screen: 'W1-Shared-Safaris-list', href: '/' },
];

const MENUS: Readonly<Record<ConsoleAccess, readonly ConsoleMenuNode[]>> = {
    member: CONSOLE_MENU,
};

export const consoleMenuFor = (access: ConsoleAccess): readonly ConsoleMenuNode[] => MENUS[access];
