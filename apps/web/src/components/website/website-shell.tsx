import type { ReactNode } from 'react';

import { consoleSession } from '@/lib/console-session';

import { WitwSiteFrame } from './witw-site-frame';

import styles from './website.module.css';

export async function WebsiteShell({ children }: { readonly children: ReactNode }) {
    const session = await consoleSession();
    return <WitwSiteFrame user={session?.user ?? null}>{children}</WitwSiteFrame>;
}

export async function WebsiteAuth({ children }: { readonly children: ReactNode }) {
    return (
        <WebsiteShell>
            <main className={styles.main}>
                <div className={styles.authWrap}>{children}</div>
            </main>
        </WebsiteShell>
    );
}

export async function WebsitePage({ children }: { readonly children: ReactNode }) {
    return (
        <WebsiteShell>
            <main className="wb-main">{children}</main>
        </WebsiteShell>
    );
}
