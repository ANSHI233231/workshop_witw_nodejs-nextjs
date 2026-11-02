'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { signOut } from '@/services/auth.service';

export function SiteAccount({ name }: { readonly name: string | null }) {
    const t = useT();
    const router = useRouter();
    const [leaving, setLeaving] = useState(false);

    if (!name) {
        return (
            <Link href="/login" className="btn btn-primary">
                {t('Sign in')}
            </Link>
        );
    }

    const leave = async () => {
        setLeaving(true);
        try {
            await signOut();
        } finally {
            setLeaving(false);
            router.refresh();
        }
    };

    return (
        <>
            <Link href="/dashboard" className="btn btn-primary" title={name}>
                {t('Dashboard')}
            </Link>
            <button type="button" className="btn btn-secondary" disabled={leaving} onClick={() => void leave()}>
                {t('Sign out')}
            </button>
        </>
    );
}
