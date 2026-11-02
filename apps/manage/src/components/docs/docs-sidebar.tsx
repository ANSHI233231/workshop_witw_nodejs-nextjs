'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { ChevronDownIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { docHref } from '@/lib/docs/doc-links';
import { searchDocumentation } from '@/lib/docs/search-action';
import {
    DOC_SEARCH_LIMITS,
    type DocFolderNode,
    type DocSearchHit,
    type DocSearchResult,
    type DocTreeNode,
} from '@/types/docs.types';

const SEARCH_PAUSE_MS = 300;

const revealCurrent = (panel: HTMLElement | null) => {
    const current = panel?.querySelector<HTMLElement>('.dc-tree-link.is-current');
    if (!panel || !current) return;
    for (const scroller of [panel, panel.querySelector<HTMLElement>('.dc-side-body')]) {
        if (!scroller || scroller.scrollHeight <= scroller.clientHeight) continue;
        const box = scroller.getBoundingClientRect();
        const item = current.getBoundingClientRect();
        if (item.top < box.top || item.bottom > box.bottom) {
            scroller.scrollTop += item.top - box.top - (box.height - item.height) / 2;
        }
    }
};

const isAncestorOf = (folderPath: string, docPath: string): boolean =>
    folderPath === '' || docPath.startsWith(`${folderPath}/`);

type TreeProps = {
    readonly currentPath: string;
    readonly isOpen: (folder: DocFolderNode) => boolean;
    readonly onToggle: (folder: DocFolderNode) => void;
    readonly onOpenDoc: () => void;
};

function TreeNodes({ nodes, ...props }: TreeProps & { readonly nodes: readonly DocTreeNode[] }) {
    return (
        <ul className="dc-tree">
            {nodes.map((node) =>
                node.kind === 'file' ? (
                    <li key={node.path}>
                        <Link
                            href={docHref(node.path)}
                            className={`dc-tree-link${node.path === props.currentPath ? ' is-current' : ''}`}
                            aria-current={node.path === props.currentPath ? 'page' : undefined}
                            onClick={props.onOpenDoc}
                        >
                            {node.title}
                        </Link>
                    </li>
                ) : (
                    <TreeFolder key={node.path} folder={node} {...props} />
                ),
            )}
        </ul>
    );
}

function TreeFolder({ folder, ...props }: TreeProps & { readonly folder: DocFolderNode }) {
    const t = useT();
    const open = props.isOpen(folder);
    const current = folder.readme === props.currentPath;
    return (
        <li>
            <div className="dc-tree-row">
                <button
                    type="button"
                    className={`dc-tree-toggle${open ? ' is-open' : ''}`}
                    aria-expanded={open}
                    aria-label={open ? t('Collapse') : t('Expand')}
                    onClick={() => props.onToggle(folder)}
                >
                    <ChevronDownIcon />
                </button>
                {folder.readme ? (
                    <Link
                        href={docHref(folder.readme)}
                        className={`dc-tree-link dc-tree-folder${current ? ' is-current' : ''}`}
                        aria-current={current ? 'page' : undefined}
                        onClick={props.onOpenDoc}
                    >
                        {folder.title}
                    </Link>
                ) : (
                    <button
                        type="button"
                        className="dc-tree-link dc-tree-folder"
                        onClick={() => props.onToggle(folder)}
                    >
                        {folder.title}
                    </button>
                )}
            </div>
            {open ? <TreeNodes nodes={folder.children} {...props} /> : null}
        </li>
    );
}

function SearchResults({
    hits,
    capped,
    pending,
    onOpenDoc,
}: {
    readonly hits: readonly DocSearchHit[];
    readonly capped: boolean;
    readonly pending: boolean;
    readonly onOpenDoc: () => void;
}) {
    const t = useT();
    if (hits.length === 0)
        return <p className="dc-search-empty">{pending ? t('Searching…') : t('No matching files')}</p>;
    return (
        <ul className="dc-results">
            {hits.map((hit) => (
                <li key={hit.path}>
                    <Link href={docHref(hit.path, hit.anchor)} className="dc-result" onClick={onOpenDoc}>
                        <span className="dc-result-title">{hit.title}</span>
                        <span className="dc-result-path">{hit.path}</span>
                        {hit.editors ? (
                            <span className="dc-result-snippet">
                                {t('Edited by {names}', { names: hit.editors.join(', ') })}
                            </span>
                        ) : hit.snippet ? (
                            <span className="dc-result-snippet">{hit.snippet}</span>
                        ) : null}
                    </Link>
                </li>
            ))}
            {capped ? (
                <li className="dc-search-empty">
                    {t('Showing first {count} matches', { count: DOC_SEARCH_LIMITS.RESULTS })}
                </li>
            ) : null}
        </ul>
    );
}

export function DocsSidebar({ tree, currentPath }: { readonly tree: DocFolderNode; readonly currentPath: string }) {
    const t = useT();
    const [toggled, setToggled] = useState<ReadonlyMap<string, boolean>>(new Map());
    const [mobileOpen, setMobileOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [hits, setHits] = useState<DocSearchResult | null>(null);
    const [pending, setPending] = useState(false);
    const latest = useRef(0);
    const panel = useRef<HTMLElement>(null);

    useEffect(() => revealCurrent(panel.current), [currentPath, mobileOpen]);

    useEffect(() => {
        const text = query.trim();
        if (!text) return;
        const ticket = latest.current + 1;
        latest.current = ticket;
        const timer = window.setTimeout(() => {
            searchDocumentation(text)
                .then((found) => {
                    if (latest.current === ticket) setHits(found);
                })
                .catch(() => {
                    if (latest.current === ticket) setHits({ hits: [], capped: false });
                })
                .finally(() => {
                    if (latest.current === ticket) setPending(false);
                });
        }, SEARCH_PAUSE_MS);
        return () => window.clearTimeout(timer);
    }, [query]);

    const onQuery = (value: string) => {
        setQuery(value);
        if (value.trim()) {
            setPending(true);
        } else {
            latest.current += 1;
            setHits(null);
            setPending(false);
        }
    };

    const isOpen = (folder: DocFolderNode): boolean =>
        toggled.get(folder.path) ?? isAncestorOf(folder.path, currentPath);
    const onToggle = (folder: DocFolderNode) =>
        setToggled((current) => new Map(current).set(folder.path, !isOpen(folder)));
    const onOpenDoc = () => setMobileOpen(false);
    const searching = query.trim() !== '';

    return (
        <aside ref={panel} className={`dc-side${mobileOpen ? ' is-open' : ''}`} aria-label={t('Documentation files')}>
            <button
                type="button"
                className="btn btn-secondary dc-side-toggle"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((open) => !open)}
            >
                {mobileOpen ? t('Hide files') : t('Browse files')}
                <ChevronDownIcon />
            </button>
            <div className="dc-side-body">
                <div className="input-group dc-search">
                    <SearchIcon />
                    <input
                        className="input"
                        type="search"
                        placeholder={t('Search documentation')}
                        aria-label={t('Search documentation')}
                        maxLength={DOC_SEARCH_LIMITS.QUERY}
                        value={query}
                        onChange={(event) => onQuery(event.target.value)}
                    />
                </div>
                {searching ? (
                    <SearchResults
                        hits={hits?.hits ?? []}
                        capped={hits?.capped ?? false}
                        pending={pending}
                        onOpenDoc={onOpenDoc}
                    />
                ) : (
                    <nav aria-label={t('Documentation')}>
                        <Link
                            href={docHref(tree.readme ?? 'README.md')}
                            className={`dc-tree-link dc-tree-root${currentPath === tree.readme ? ' is-current' : ''}`}
                            aria-current={currentPath === tree.readme ? 'page' : undefined}
                            onClick={onOpenDoc}
                        >
                            {tree.title}
                        </Link>
                        <TreeNodes
                            nodes={tree.children}
                            currentPath={currentPath}
                            isOpen={isOpen}
                            onToggle={onToggle}
                            onOpenDoc={onOpenDoc}
                        />
                    </nav>
                )}
            </div>
        </aside>
    );
}
