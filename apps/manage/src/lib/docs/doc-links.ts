export const DOCS_ROUTE = '/docs';
export const DOCS_SOURCE_ROUTE = '/docs-source';
export const ROOT_README = 'README.md';
export const README_NAME = 'README.md';
export const EXCLUDED_TOP_FOLDERS: ReadonlySet<string> = new Set(['tools', 'translations', 'prototype']);
export const EXCLUDED_FOLDERS: ReadonlySet<string> = new Set(['node_modules']);

const DOCS_FOLDER = 'docs';
const WEB_LINK = /^(https?:|mailto:)/i;
const OTHER_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

const normalizePath = (value: string): string => {
    const absolute = value.startsWith('/');
    const segments: string[] = [];
    for (const segment of value.split('/')) {
        if (segment === '' || segment === '.') continue;
        if (segment === '..' && segments.length > 0 && segments[segments.length - 1] !== '..') segments.pop();
        else if (segment !== '..' || !absolute) segments.push(segment);
    }
    const joined = segments.join('/');
    return absolute ? `/${joined}` : joined || '.';
};

const joinPaths = (...parts: readonly string[]): string => normalizePath(parts.filter(Boolean).join('/'));

export const isIncludedDocPath = (docPath: string): boolean => {
    if (!docPath.endsWith('.md') || docPath.includes('\\') || docPath.includes('\0')) return false;
    if (docPath.startsWith('/') || normalizePath(docPath) !== docPath) return false;
    const segments = docPath.split('/');
    if (segments.some((segment) => segment === '' || segment === '..' || segment.startsWith('.'))) return false;
    if (segments.some((segment) => EXCLUDED_FOLDERS.has(segment))) return false;
    return !(segments.length > 1 && EXCLUDED_TOP_FOLDERS.has(segments[0] ?? ''));
};

export const docHref = (docPath: string, anchor?: string): string => {
    const base =
        docPath === ROOT_README ? DOCS_ROUTE : `${DOCS_ROUTE}/${docPath.split('/').map(encodeURIComponent).join('/')}`;
    return anchor ? `${base}#${encodeURIComponent(anchor)}` : base;
};

export const docSourceHref = (docPath: string): string =>
    `${DOCS_SOURCE_ROUTE}/${docPath.split('/').map(encodeURIComponent).join('/')}`;

export const folderOf = (docPath: string): string => {
    const slash = docPath.lastIndexOf('/');
    return slash < 0 ? '' : docPath.slice(0, slash);
};

export type ResolvedLink =
    | { readonly kind: 'anchor'; readonly href: string }
    | { readonly kind: 'doc'; readonly href: string }
    | { readonly kind: 'web'; readonly href: string }
    | { readonly kind: 'repo'; readonly path: string };

const decoded = (value: string): string => {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

const docOfRepoPath = (repoPath: string, known: ReadonlySet<string>): string | undefined => {
    if (repoPath === DOCS_FOLDER) return ROOT_README;
    if (!repoPath.startsWith(`${DOCS_FOLDER}/`)) return undefined;
    const inside = repoPath.slice(DOCS_FOLDER.length + 1).replace(/\/+$/, '');
    if (known.has(inside)) return inside;
    const readme = inside ? `${inside}/${README_NAME}` : ROOT_README;
    return known.has(readme) ? readme : undefined;
};

export const resolveDocLink = (href: string, fromDoc: string, known: ReadonlySet<string>): ResolvedLink => {
    const target = href.trim();
    if (target.startsWith('#')) return { kind: 'anchor', href: target };
    if (WEB_LINK.test(target)) return { kind: 'web', href: target };
    if (OTHER_SCHEME.test(target)) return { kind: 'repo', path: target };
    const hashAt = target.indexOf('#');
    const pathPart = decoded(hashAt >= 0 ? target.slice(0, hashAt) : target);
    const anchor = hashAt >= 0 ? decoded(target.slice(hashAt + 1)) : undefined;
    if (!pathPart) return { kind: 'anchor', href: anchor ? `#${anchor}` : '#' };
    const repoPath = pathPart.startsWith('/')
        ? normalizePath(pathPart.slice(1))
        : joinPaths(DOCS_FOLDER, folderOf(fromDoc), pathPart);
    const doc = docOfRepoPath(repoPath, known);
    if (doc) return { kind: 'doc', href: docHref(doc, anchor) };
    return { kind: 'repo', path: repoPath.replace(/\/+$/, '') };
};
