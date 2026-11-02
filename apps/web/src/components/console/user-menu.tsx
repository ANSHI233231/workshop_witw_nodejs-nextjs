'use client';

import Link from 'next/link';

import { useT } from '@/hooks/i18n/use-t';
import type { AuthUser } from '@/types/auth.types';

export function UserMenu({
    user,
    roleLabel,
    onChangePassword,
    onSignOut,
}: {
    readonly user: AuthUser;
    readonly roleLabel: string;
    readonly onChangePassword: () => void;
    readonly onSignOut: () => void;
}) {
    const t = useT();
    return (
        <div className="dd user-dd" role="menu">
            <div className="dd-who">
                <div className="list-title">{user.name}</div>
                <div className="list-meta">{user.email ?? user.username}</div>
                {roleLabel && <div className="list-meta">{roleLabel}</div>}
            </div>
            <button type="button" className="mega-link dd-btn" onClick={onChangePassword}>
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
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>{' '}
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
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
                    <path d="m16 17 5-5-5-5"></path> <path d="M21 12H9"></path>{' '}
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                </svg>
                {t('Log Out')}
            </Link>
        </div>
    );
}
