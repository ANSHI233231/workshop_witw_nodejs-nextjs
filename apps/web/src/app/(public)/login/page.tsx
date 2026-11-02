import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SignInScreen } from '@/components/sign-in/sign-in-screen';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { getSignedInUser } from '@/services/auth.service';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await serverTranslator()).t('Login') });

export default async function LoginPage() {
    const user = await getSignedInUser((await cookies()).get(ACCESS_TOKEN_COOKIE)?.value);
    if (user) redirect('/dashboard');
    return <SignInScreen />;
}
