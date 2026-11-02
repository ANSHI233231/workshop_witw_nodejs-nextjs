'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useT } from '@/hooks/i18n/use-t';

import type { ConsoleMenuNode } from './console-menu';

type MenuLink = Extract<ConsoleMenuNode, { kind: 'link' }>;

const isLink = (node: ConsoleMenuNode): node is MenuLink => node.kind === 'link';

const isCurrent = (pathname: string, href: string): boolean => pathname === href || pathname.startsWith(`${href}/`);

export function PortalNav({ menu }: { readonly menu: readonly ConsoleMenuNode[] }) {
    const t = useT();
    const pathname = usePathname();
    return (
        <nav className="topnav" aria-label={t('Main menu')}>
            {menu.filter(isLink).map((link) => {
                const active = link.href !== undefined && isCurrent(pathname, link.href);
                return (
                    <div key={link.screen} className="nav-slot">
                        {link.href ? (
                            <Link
                                href={link.href}
                                className={`nav-item${active ? ' is-active' : ''}`}
                                aria-current={active ? 'page' : undefined}
                            >
                                {t(link.label)}
                            </Link>
                        ) : (
                            <a className="nav-item">{t(link.label)}</a>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
