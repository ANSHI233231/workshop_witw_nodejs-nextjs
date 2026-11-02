import { cookies } from 'next/headers';
import { forbidden, redirect } from 'next/navigation';
import { cache } from 'react';

import { getSignedInUser } from '@/services/auth.service';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { ConsoleArea } from '@/types/console.types';

import { consoleAccessOf, mayOpenArea } from './console-access';

const readAccessToken = async (): Promise<string | undefined> => (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

export const consoleSession = cache(async () => {
    const accessToken = await readAccessToken();
    const user = await getSignedInUser(accessToken);
    if (!user) return null;
    return { user, access: consoleAccessOf() };
});

export const requireConsoleArea = async (area: ConsoleArea): Promise<void> => {
    const session = await consoleSession();
    if (!session) redirect('/login');
    if (!mayOpenArea(session.access, area)) forbidden();
};
