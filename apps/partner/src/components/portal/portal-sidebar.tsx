'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useT } from '@/hooks/i18n/use-t';

import {
    BusinessProfileIcon,
    DashboardIcon,
    GalleryIcon,
    NotificationsIcon,
    PackagesIcon,
    PartnerRequestIcon,
    QuoteRequestsIcon,
} from './portal-icons';
import type { PortalIconName, PortalMenuItem } from './portal-menu';

const ICONS: Record<PortalIconName, () => React.JSX.Element> = {
    DashboardIcon,
    PackagesIcon,
    GalleryIcon,
    QuoteRequestsIcon,
    NotificationsIcon,
    BusinessProfileIcon,
    PartnerRequestIcon,
};

const routeMatches = (pathname: string, href: string): boolean =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

export function PortalSidebar({ menu, open }: { readonly menu: readonly PortalMenuItem[]; readonly open: boolean }) {
    const t = useT();
    const pathname = usePathname();
    return (
        <aside className={`sidebar${open ? ' is-open' : ''}`} aria-label={t('Partner menu')}>
            <nav>
                {menu.map((item) => {
                    const Icon = ICONS[item.icon];
                    const active = routeMatches(pathname, item.href);
                    return (
                        <Link
                            key={item.href}
                            className={`side-item${active ? ' is-active' : ''}`}
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                        >
                            <Icon />
                            <span>{t(item.label)}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
