import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SignUpScreen } from '@/components/sign-in/sign-up-screen';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { getSignedInUser } from '@/services/auth.service';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await serverTranslator()).t('Sign Up') });

export default async function SignUpPage() {
    const user = await getSignedInUser((await cookies()).get(ACCESS_TOKEN_COOKIE)?.value);
    if (user) redirect('/');
    return <SignUpScreen />;
}
