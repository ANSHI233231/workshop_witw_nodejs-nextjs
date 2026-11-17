'use client';

import Link from 'next/link';

import { useT } from '@/hooks/i18n/use-t';
import { config } from '@/lib/config';

import { ExternalLinkIcon, LockIcon, LogOutIcon } from './portal-icons';
import type { PortalIdentity } from './portal-identity';

export function PortalUserMenu({
    identity,
    onChangePassword,
    onSignOut,
}: {
    readonly identity: PortalIdentity;
    readonly onChangePassword: () => void;
    readonly onSignOut: () => void;
}) {
    const t = useT();
    return (
        <div className="dd user-dd" role="menu">
            <div className="dd-who">
                <div className="list-title">{identity.name}</div>
                {identity.email && <div className="list-meta">{identity.email}</div>}
                <div className="list-meta">{identity.roleLine(t)}</div>
            </div>
            <a className="mega-link" href={config.websiteUrl}>
                <ExternalLinkIcon />
                {t('Website')}
            </a>
            <button type="button" className="mega-link dd-btn" onClick={onChangePassword}>
                <LockIcon />
                {t('Change Password')}
            </button>
            <div className="dd-sep"></div>
            <Link
                className="mega-link"
                href="/login"
                onClick={(event) => {
                    event.preventDefault();
                    onSignOut();
                }}
            >
                <LogOutIcon />
                {t('Log Out')}
            </Link>
        </div>
    );
}
