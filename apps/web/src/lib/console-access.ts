import type { ConsoleAccess, ConsoleArea } from '@/types/console.types';

const AREAS_OF: Readonly<Record<ConsoleAccess, readonly ConsoleArea[]>> = {
    member: ['portal'],
};

export const consoleAccessOf = (): ConsoleAccess => 'member';

export const consoleAreasOf = (access: ConsoleAccess): readonly ConsoleArea[] => AREAS_OF[access];

export const mayOpenArea = (access: ConsoleAccess, area: ConsoleArea): boolean => consoleAreasOf(access).includes(area);

export const consoleRoleLabel = (): string => '';
