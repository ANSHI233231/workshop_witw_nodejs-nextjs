import { cookies } from 'next/headers';
import { forbidden, redirect } from 'next/navigation';
import { cache } from 'react';

import { getConsoleRoles, getSignedInUser } from '@/services/auth.service';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { ConsoleArea } from '@/types/console.types';

import { consoleAccessOf, mayOpenArea } from './console-access';

const readAccessToken = async (): Promise<string | undefined> => (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

export const consoleSession = cache(async () => {
    const accessToken = await readAccessToken();
    const user = await getSignedInUser(accessToken);
    if (!user) return null;
    const roles = await getConsoleRoles(accessToken);
    const access = consoleAccessOf(roles);
    if (!access) forbidden();
    return { user, roles, access };
});

export const requireConsoleArea = async (area: ConsoleArea): Promise<void> => {
    const session = await consoleSession();
    if (!session) redirect('/login');
    if (!mayOpenArea(session.access, session.roles, area)) forbidden();
};
