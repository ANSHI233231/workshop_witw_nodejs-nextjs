import Link from 'next/link';
import type { ReactNode } from 'react';

import { consoleSession } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';

import { SiteAccount } from './site-account';

import styles from './website.module.css';

export async function WebsiteShell({ children }: { readonly children: ReactNode }) {
    const { t } = await serverTranslator();
    const session = await consoleSession();
    return (
        <div className={styles.site}>
            <header className={styles.bar}>
                <Link href="/" className={styles.brand}>
                    <span className={styles.mark}>
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                            <path d="m9 12 2 2 4-4" />
                        </svg>
                    </span>
                    {t('Starter')}
                </Link>
                <nav className={styles.links} aria-label={t('Website')}>
                    <Link href="/" className={styles.link}>
                        {t('Home')}
                    </Link>
                    <Link href="/#install" className={styles.link}>
                        {t('Install')}
                    </Link>
                    <Link href="/#new-project" className={styles.link}>
                        {t('New project')}
                    </Link>
                    {session && <span className={styles.who}>{session.user.name}</span>}
                    <SiteAccount name={session?.user.name ?? null} />
                </nav>
            </header>
            <main className={styles.main}>{children}</main>
            <footer className={styles.footer}>
                {t('Starter · README.md and AGENTS.md in the repository have the details.')}
            </footer>
        </div>
    );
}

export async function WebsiteAuth({ children }: { readonly children: ReactNode }) {
    return (
        <WebsiteShell>
            <div className={styles.authWrap}>{children}</div>
        </WebsiteShell>
    );
}
