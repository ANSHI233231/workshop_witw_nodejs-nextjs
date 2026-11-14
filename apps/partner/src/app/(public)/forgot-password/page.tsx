import type { Metadata } from 'next';

import { ForgotPasswordSteps } from '@/components/forgot-password/forgot-password-steps';
import { AuthLogo, AuthPage } from '@/components/sign-in/auth-card';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { type PageSearchParams, searchParam } from '@/lib/search-params';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Forgot Password'),
});

const TOKEN_MAX = 200;

const NOTE =
    'Enter the email address registered with your account. We will send a password reset link to that email.';

export default async function ForgotPasswordPage({
    searchParams,
}: {
    readonly searchParams: Promise<PageSearchParams>;
}) {
    const token = searchParam((await searchParams)['token'], TOKEN_MAX) || undefined;
    return (
        <AuthPage>
            <div className="pq-auth-card">
                <AuthLogo />
                <ForgotPasswordSteps key={token ?? 'request'} token={token} note={NOTE} />
            </div>
        </AuthPage>
    );
}
