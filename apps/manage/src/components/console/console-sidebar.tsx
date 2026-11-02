'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type CSSProperties, Fragment, useMemo, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { useDrawerTools } from '@/hooks/ui/use-drawer-tools';
import type { Locale } from '@/lib/i18n/locale';

import {
    ChevronDownIcon,
    ChevronRightIcon,
    DashboardIcon,
    SettingsIcon,
    UserRoleIcon,
} from './console-icons';
import {
    type ConsoleIconName,
    type ConsoleMenuLink,
    type ConsoleMenuNode,
    type ConsoleMenuSubgroup,
} from './console-menu';
import { CONSOLE_SECTION_ICONS } from './console-section-icons';
import { DrawerLanguageBar } from './drawer-language-bar';

const ICONS: Record<ConsoleIconName, () => React.JSX.Element> = {
    DashboardIcon,
    UserRoleIcon,
    SettingsIcon,
};

const toggled = (current: string | null, key: string): string | null => (current === key ? null : key);

const routeMatches = (pathname: string, href: string): boolean =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

type MenuRoute = { readonly prefix: string; readonly href: string };

const routesOf = (link: ConsoleMenuLink): readonly MenuRoute[] => {
    const href = link.href;
    if (!href) return [];
    return [href, ...(link.matches ?? [])].map((prefix) => ({ prefix, href }));
};

const menuRoutes = (menu: readonly ConsoleMenuNode[]): readonly MenuRoute[] =>
    menu.flatMap((node) => {
        if (node.kind === 'section') return [];
        if (node.kind === 'link') return routesOf(node);
        const links =
            node.kind === 'flat'
                ? node.subgroup.links
                : node.children.flatMap((child) => ('kind' in child ? child.links : [child]));
        return links.flatMap(routesOf);
    });

const bestRoute = (routes: readonly MenuRoute[], pathname: string): string | undefined =>
    routes.filter((route) => routeMatches(pathname, route.prefix)).sort((a, b) => b.prefix.length - a.prefix.length)[0]
        ?.href;

type CurrentRoute = (href: string | undefined) => boolean;

const subgroupHolds = (subgroup: ConsoleMenuSubgroup, isCurrent: CurrentRoute): boolean =>
    subgroup.links.some((link) => isCurrent(link.href));

const childHolds = (child: ConsoleMenuLink | ConsoleMenuSubgroup, isCurrent: CurrentRoute): boolean =>
    'kind' in child ? subgroupHolds(child, isCurrent) : isCurrent(child.href);

const currentGroupKey = (menu: readonly ConsoleMenuNode[], isCurrent: CurrentRoute): string | null =>
    menu.find(
        (node): node is Extract<ConsoleMenuNode, { kind: 'group' }> =>
            node.kind === 'group' && node.children.some((child) => childHolds(child, isCurrent)),
    )?.key ?? null;

const currentSubgroupKey = (menu: readonly ConsoleMenuNode[], isCurrent: CurrentRoute): string | null => {
    for (const node of menu) {
        if (node.kind !== 'group') continue;
        for (const child of node.children) {
            if ('kind' in child && subgroupHolds(child, isCurrent)) return child.key;
        }
    }
    return null;
};

function SideLink({ link, isCurrent }: { readonly link: ConsoleMenuLink; readonly isCurrent: CurrentRoute }) {
    const t = useT();
    const linkClass = link.isLead ? 'side-link side-lk' : 'side-link';
    if (!link.href) return <a className={linkClass}>{t(link.label)}</a>;
    const current = isCurrent(link.href);
    return (
        <Link
            className={`${linkClass}${current ? ' is-current' : ''}`}
            href={link.href}
            aria-current={current ? 'page' : undefined}
        >
            {t(link.label)}
        </Link>
    );
}

function Subgroup({
    subgroup,
    isCurrent,
    open,
    onToggle,
}: {
    readonly subgroup: ConsoleMenuSubgroup;
    readonly isCurrent: CurrentRoute;
    readonly open: boolean;
    readonly onToggle: () => void;
}) {
    const t = useT();
    const active = subgroupHolds(subgroup, isCurrent);
    return (
        <>
            <button
                type="button"
                className={`side-subbtn${active ? ' is-active' : ''}${open ? ' is-open' : ''}`}
                aria-expanded={open}
                onClick={onToggle}
            >
                <span>{t(subgroup.label)}</span>
                <ChevronRightIcon />
            </button>
            {open && (
                <div className="side-sub2">
                    {subgroup.heading && <div className="side-sg">{t(subgroup.heading)}</div>}
                    {subgroup.links.map((link) => (
                        <SideLink key={link.screen} link={link} isCurrent={isCurrent} />
                    ))}
                </div>
            )}
        </>
    );
}

export function ConsoleSidebar({
    menu,
    open,
    language,
    onLanguageChange,
}: {
    readonly menu: readonly ConsoleMenuNode[];
    readonly open: boolean;
    readonly language: Locale;
    readonly onLanguageChange: (language: Locale) => void;
}) {
    const t = useT();
    useDrawerTools(open);
    const pathname = usePathname();
    const routes = useMemo(() => menuRoutes(menu), [menu]);
    const isCurrent: CurrentRoute = (href) => !!href && bestRoute(routes, pathname) === href;
    const [openGroup, setOpenGroup] = useState<string | null>(() => currentGroupKey(menu, isCurrent));
    const [openSubgroup, setOpenSubgroup] = useState<string | null>(() => currentSubgroupKey(menu, isCurrent));

    return (
        <aside className={`sidebar${open ? ' is-open' : ''}`} aria-label={t('Admin menu')}>
            <nav>
                {menu.map((node) => {
                    if (node.kind === 'section') {
                        return (
                            <div key={node.label} className="side-sec" style={{ '--sc': node.color } as CSSProperties}>
                                <div className="side-sec-t">
                                    <i></i>
                                    {t(node.label)}
                                </div>
                            </div>
                        );
                    }
                    if (node.kind === 'flat') {
                        return (
                            <Fragment key={node.key}>
                                <div className="side-sec" style={{ '--sc': node.color } as CSSProperties}>
                                    <div className="side-sec-t">
                                        {CONSOLE_SECTION_ICONS[node.label]}
                                        {t(node.label)}
                                    </div>
                                </div>
                                <div className="side-flat">
                                    {node.subgroup.heading && <div className="side-sg">{t(node.subgroup.heading)}</div>}
                                    {node.subgroup.links.map((link) => (
                                        <SideLink key={link.screen} link={link} isCurrent={isCurrent} />
                                    ))}
                                </div>
                            </Fragment>
                        );
                    }
                    const Icon = ICONS[node.icon];
                    if (node.kind === 'link') {
                        if (!node.href) {
                            return (
                                <a key={node.screen} className="side-item">
                                    <Icon />
                                    <span>{t(node.label)}</span>
                                </a>
                            );
                        }
                        const active = isCurrent(node.href);
                        return (
                            <Link
                                key={node.screen}
                                className={`side-item${active ? ' is-active' : ''}`}
                                href={node.href}
                                aria-current={active ? 'page' : undefined}
                            >
                                <Icon />
                                <span>{t(node.label)}</span>
                            </Link>
                        );
                    }
                    const open = openGroup === node.key;
                    const holdsCurrent = node.children.some((child) => childHolds(child, isCurrent));
                    return (
                        <Fragment key={node.key}>
                            <button
                                type="button"
                                className={`side-item${holdsCurrent ? ' is-active' : ''}${open ? ' is-open' : ''}`}
                                aria-expanded={open}
                                onClick={() => setOpenGroup((current) => toggled(current, node.key))}
                            >
                                <Icon />
                                <span>{t(node.label)}</span>
                                <ChevronDownIcon />
                            </button>
                            {open && (
                                <div className="side-sub">
                                    {node.children.map((child) =>
                                        'kind' in child ? (
                                            <Subgroup
                                                key={child.key}
                                                subgroup={child}
                                                isCurrent={isCurrent}
                                                open={openSubgroup === child.key}
                                                onToggle={() =>
                                                    setOpenSubgroup((current) => toggled(current, child.key))
                                                }
                                            />
                                        ) : (
                                            <SideLink key={child.screen} link={child} isCurrent={isCurrent} />
                                        ),
                                    )}
                                </div>
                            )}
                        </Fragment>
                    );
                })}
            </nav>
            <DrawerLanguageBar language={language} onChange={onLanguageChange} />
        </aside>
    );
}
