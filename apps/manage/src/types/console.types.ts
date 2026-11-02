export const ConsoleRole = {
    SUPER_ADMIN: 100,
} as const;

export type ConsoleRoleItem = { readonly id: number; readonly name: string };

export type ConsoleAccess = 'super';

export type ConsoleArea = 'platform';
