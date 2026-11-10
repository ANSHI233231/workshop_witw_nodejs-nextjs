'use client';

import { useRouter } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { config } from '@/lib/config';

import { API_DIGEST_PREFIX } from '@/services/api-error';

import { ArrowLeftIcon } from '@/components/website/site-icons';

export type StatusKind = 'forbidden' | 'not-found' | 'error';

const HOME = '/';
const CONTACT = config.supportUrl;

const STATUS_TEXTS: Readonly<
    Record<StatusKind, { readonly code: string; readonly title: string; readonly text: string }>
> = {
    forbidden: {
        code: '403',
        title: 'Unauthorised Access',
        text: 'You don’t have permission to view this page. If you think you should have access, please contact your administrator.',
    },
    'not-found': {
        code: '404',
        title: 'Page not found',
        text: 'The page you are looking for doesn’t exist, has been moved, or you don’t have access to it. Please check the address or go back to the previous page.',
    },
    error: {
        code: '500',
        title: 'Something went wrong',
        text: 'We’re having a problem on our side and couldn’t complete your request. Please try again in a few minutes.',
    },
};

export const errorDetailOf = (error: Error & { readonly digest?: string }): string | undefined => {
    if (error.digest?.startsWith(API_DIGEST_PREFIX)) return error.digest.slice(API_DIGEST_PREFIX.length);
    if (error.digest) return `Reference: ${error.digest}`;
    return error.message || undefined;
};

const goBack = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (window.history.length <= 1) return;
    event.preventDefault();
    window.history.back();
};

export function StatusLogo() {
    const t = useT();
    return (
        <div className="e4-logo">
            <span className="wordmark-mark">
                <img src="/witw/logo.png" alt="Walk Into The Wild" />
            </span>
            <span className="wordmark">{t('Portal')}</span>
        </div>
    );
}

export function StatusFrame({ framed, children }: { readonly framed: boolean; readonly children: ReactNode }) {
    if (framed) return <div className="page">{children}</div>;
    const card = <div className="e4-wrap">{children}</div>;
    return (
        <div className="app e4-app">
            <main className="app-content">{card}</main>
        </div>
    );
}

export function StatusPage({
    kind,
    framed = false,
    detail,
}: {
    readonly kind: StatusKind;
    readonly framed?: boolean;
    readonly detail?: string;
}) {
    const t = useT();
    const router = useRouter();
    const status = STATUS_TEXTS[kind];
    const goBackOrHome = (): void => {
        if (window.history.length > 1) router.back();
        else router.push(HOME);
    };
    if (framed) {
        return (
            <StatusFrame framed>
                <div className="nf">
                    <p className="nf-code">{status.code}</p>
                    <h1>{t(status.title)}</h1>
                    <p>{t(status.text)}</p>
                    <div className="ss-row">
                        <button type="button" className="btn btn-secondary" onClick={goBackOrHome}>
                            <ArrowLeftIcon />
                            {t('Go Back')}
                        </button>
                        <a className="btn btn-primary" href={HOME}>
                            {t('Shared Safaris')}
                        </a>
                    </div>
                    {detail && <p className="e4-help">{detail}</p>}
                </div>
            </StatusFrame>
        );
    }
    return (
        <StatusFrame framed={framed}>
            <section className="e4-card" aria-labelledby="e4-t">
                {!framed && <StatusLogo />}
                <p className="e4-code">{status.code}</p>
                <h1 className="e4-title" id="e4-t">
                    {t(status.title)}
                </h1>
                <p className="e4-text">{t(status.text)}</p>
                <div className="e4-acts">
                    <a className="btn btn-secondary" href={HOME} onClick={kind === 'not-found' ? undefined : goBack}>
                        <svg
                            className="icon "
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="m12 19-7-7 7-7"></path>
                            <path d="M19 12H5"></path>
                        </svg>
                        {t('Go Back')}
                    </a>
                    <a className="btn btn-primary" href={CONTACT}>
                        <svg
                            className="icon "
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>
                            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                        </svg>
                        {t('Contact Us')}
                    </a>
                </div>
                {detail && <p className="e4-help">{detail}</p>}
            </section>
        </StatusFrame>
    );
}
