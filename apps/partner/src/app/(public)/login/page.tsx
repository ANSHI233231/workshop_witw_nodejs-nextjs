import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AuthPage } from '@/components/sign-in/auth-card';
import { SignInForm } from '@/components/sign-in/sign-in-form';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { portalSession } from '@/lib/portal-session';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await serverTranslator()).t('Sign in') });

export default async function LoginPage() {
    if (await portalSession()) redirect('/');
    return (
        <AuthPage>
            <SignInForm />
        </AuthPage>
    );
}
