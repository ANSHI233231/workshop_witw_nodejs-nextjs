import { type ConsoleAccess, type ConsoleArea, ConsoleRole, type ConsoleRoleItem } from '@/types/console.types';

const AREAS_OF: Readonly<Record<ConsoleAccess, readonly ConsoleArea[]>> = {
    super: ['platform'],
};

export const consoleAccessOf = (roles: readonly ConsoleRoleItem[]): ConsoleAccess | undefined =>
    roles.some((role) => role.id === ConsoleRole.SUPER_ADMIN) ? 'super' : undefined;

export const consoleAreasOf = (access: ConsoleAccess): readonly ConsoleArea[] => AREAS_OF[access];

export const mayOpenArea = (access: ConsoleAccess, _roles: readonly ConsoleRoleItem[], area: ConsoleArea): boolean =>
    consoleAreasOf(access).includes(area);

export const consoleRoleLabel = (_access: ConsoleAccess, roles: readonly ConsoleRoleItem[]): string =>
    roles.find((role) => role.id === ConsoleRole.SUPER_ADMIN)?.name ?? '';
