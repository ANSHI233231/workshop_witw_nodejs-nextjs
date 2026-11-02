import type { Metadata } from 'next';

import { ForgotPasswordSteps } from '@/components/forgot-password/forgot-password-steps';
import { AuthScreen } from '@/components/sign-in/auth-screen';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { type PageSearchParams, searchParam } from '@/lib/search-params';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Forgot Password'),
});

const TOKEN_MAX = 200;

const NOTE =
    'Enter the email address registered with your Admin Console account. We will send a password reset link to that email.';

export default async function ForgotPasswordPage({
    searchParams,
}: {
    readonly searchParams: Promise<PageSearchParams>;
}) {
    const token = searchParam((await searchParams)['token'], TOKEN_MAX) || undefined;
    return (
        <AuthScreen>
            <div
                className="auth-card"
                style={{
                    width: '440px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-md)',
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-lg)',
                }}
            >
                <ForgotPasswordSteps key={token ?? 'request'} token={token} note={NOTE} />
            </div>
        </AuthScreen>
    );
}
