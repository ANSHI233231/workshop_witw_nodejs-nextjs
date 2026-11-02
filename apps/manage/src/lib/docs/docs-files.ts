import 'server-only';

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import { cache } from 'react';

import { logger } from '@/lib/logger';
import {
    DOC_SEARCH_LIMITS,
    type DocEntry,
    type DocFolderNode,
    type DocLink,
    type DocSearchHit,
    type DocSearchResult,
} from '@/types/docs.types';

import { EXCLUDED_FOLDERS, EXCLUDED_TOP_FOLDERS, folderOf, isIncludedDocPath, README_NAME } from './doc-links';
import { buildDocTree, docOrder, folderLabel } from './docs-tree';
import { createSlugger, firstHeadingTitle, parseInline, plainText } from './markdown';

const DOCS_ROOT = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '..', '..', 'docs');
const REPO_ROOT = path.dirname(DOCS_ROOT);
const DIAGRAM_FOLDER = path.join(DOCS_ROOT, 'how-it-works', 'workflows', 'documents', 'diagrams');
const DIAGRAM_NAME = /^[0-9a-f]{16}\.png$/;
const DIAGRAM_ROUTE = '/docs-diagram';
const MARKDOWN_EXTENSION = '.md';
const SNIPPET_RADIUS = 70;
const HEADING_LINE = /^ {0,3}#{1,6}[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$/;
const FENCE_LINE = /^ {0,3}(`{3,}|~{3,})/;
const DATED_NAME = /^(\d{4}-\d{2}-\d{2})-/;
const GIT_DOCS_PREFIX = 'docs/';
const GIT_HISTORY = [
    '-c',
    'core.quotePath=false',
    'log',
    '--no-renames',
    '--format=%x00%aI%x09%an',
    '--name-only',
    '--',
    'docs',
];
const GIT_CHANGES = ['status', '--porcelain=v1', '-z', '--no-renames', '--untracked-files=all', '--', 'docs'];
const TEMPLATE_FILE = 'TEMPLATE.md';
const GIT_OUTPUT_LIMIT = 64 * 1024 * 1024;
const NOT_IN_GIT_ORDER = Number.MAX_SAFE_INTEGER;

const runFile = promisify(execFile);

const log = logger.category('docs');

type LoadedDoc = {
    readonly path: string;
    readonly title: string;
    readonly hasHeading: boolean;
    readonly content: string;
    readonly modifiedAt: number;
};

const loaded = new Map<string, LoadedDoc>();

type GitChange = { readonly date: string; readonly author: string };

type GitHistory = {
    readonly firstAdded: ReadonlyMap<string, GitChange>;
    readonly lastChanged: ReadonlyMap<string, GitChange>;
    readonly authors: ReadonlyMap<string, ReadonlyMap<string, number>>;
    readonly uncommitted: ReadonlySet<string>;
    readonly readAt: number;
};

const docsPathOf = (repoPath: string): string | undefined =>
    repoPath.startsWith(GIT_DOCS_PREFIX) ? repoPath.slice(GIT_DOCS_PREFIX.length) : undefined;

const readGitHistory = async (): Promise<GitHistory | null> => {
    try {
        const readAt = Date.now();
        const options = { cwd: REPO_ROOT, maxBuffer: GIT_OUTPUT_LIMIT };
        const [history, changes] = await Promise.all([
            runFile('git', GIT_HISTORY, options),
            runFile('git', GIT_CHANGES, options),
        ]);
        const firstAdded = new Map<string, GitChange>();
        const lastChanged = new Map<string, GitChange>();
        const authors = new Map<string, Map<string, number>>();
        for (const commit of history.stdout.split('\0').slice(1)) {
            const [header = '', ...names] = commit.split('\n');
            const tab = header.indexOf('\t');
            const change = { date: header.slice(0, tab).trim(), author: header.slice(tab + 1).trim() };
            for (const name of names) {
                const docPath = docsPathOf(name);
                if (!docPath) continue;
                firstAdded.set(docPath, change);
                if (!lastChanged.has(docPath)) lastChanged.set(docPath, change);
                const counts = authors.get(docPath) ?? new Map<string, number>();
                counts.set(change.author, (counts.get(change.author) ?? 0) + 1);
                authors.set(docPath, counts);
            }
        }
        const uncommitted = new Set(
            changes.stdout
                .split('\0')
                .map((entry) => docsPathOf(entry.slice(3)))
                .filter((docPath): docPath is string => docPath !== undefined),
        );
        return { firstAdded, lastChanged, authors, uncommitted, readAt };
    } catch (error) {
        log.warn('Could not read the documentation history from git', { error });
        return null;
    }
};

let gitHistoryRead: Promise<GitHistory | null> | undefined;

const gitHistory = async (newestChange: number): Promise<GitHistory | null> => {
    const current = await gitHistoryRead;
    if (!gitHistoryRead || (current && newestChange > current.readAt)) gitHistoryRead = readGitHistory();
    return gitHistoryRead;
};

const dayOf = (milliseconds: number): string => new Date(milliseconds).toISOString().slice(0, 10);

const editorsOf = (counts: ReadonlyMap<string, number> | undefined): readonly string[] =>
    [...(counts ?? new Map<string, number>()).entries()]
        .filter(([author]) => author !== '')
        .sort(([nameA, countA], [nameB, countB]) => countB - countA || nameA.localeCompare(nameB))
        .map(([author]) => author);

const entryOf = (doc: LoadedDoc, history: GitHistory | null): DocEntry => {
    const base = { path: doc.path, title: doc.title, hasHeading: doc.hasHeading };
    const modified = dayOf(doc.modifiedAt);
    const added = history?.firstAdded.get(doc.path);
    const changed = history?.lastChanged.get(doc.path);
    const committed = Boolean(history && changed && !history.uncommitted.has(doc.path));
    const people = {
        updated: committed && changed ? changed.date.slice(0, 10) : modified,
        isCommitted: committed,
        addedBy: added?.author || undefined,
        updatedBy: committed ? changed?.author || undefined : undefined,
        editors: editorsOf(history?.authors.get(doc.path)),
    };
    const dated = DATED_NAME.exec(doc.path.slice(doc.path.lastIndexOf('/') + 1))?.[1];
    if (dated) return { ...base, ...people, added: dated, addedOrder: Date.parse(dated) };
    if (!history) return { ...base, ...people, added: modified, addedOrder: doc.modifiedAt };
    if (!added) return { ...base, ...people, added: modified, addedOrder: NOT_IN_GIT_ORDER };
    return { ...base, ...people, added: added.date.slice(0, 10), addedOrder: Date.parse(added.date) };
};

const isInsideRoot = (absolute: string): boolean => absolute.startsWith(`${DOCS_ROOT}${path.sep}`);

const skipsFolder = (name: string, depth: number): boolean =>
    name.startsWith('.') || EXCLUDED_FOLDERS.has(name) || (depth === 0 && EXCLUDED_TOP_FOLDERS.has(name));

const markdownPathsUnder = async (folder: string, depth: number): Promise<string[]> => {
    const entries = await readdir(folder, { withFileTypes: true });
    const nested = await Promise.all(
        entries.map(async (entry) => {
            const absolute = path.join(folder, entry.name);
            if (entry.isDirectory())
                return skipsFolder(entry.name, depth) ? [] : markdownPathsUnder(absolute, depth + 1);
            if (entry.isFile() && entry.name.endsWith(MARKDOWN_EXTENSION) && !entry.name.startsWith('.')) {
                return [path.relative(DOCS_ROOT, absolute).split(path.sep).join('/')];
            }
            return [];
        }),
    );
    return nested.flat();
};

const fileNameTitle = (docPath: string): string =>
    docPath.slice(docPath.lastIndexOf('/') + 1).slice(0, -MARKDOWN_EXTENSION.length);

const loadDoc = async (docPath: string): Promise<LoadedDoc | null> => {
    const absolute = path.resolve(DOCS_ROOT, docPath);
    if (!isInsideRoot(absolute)) return null;
    try {
        const { mtimeMs } = await stat(absolute);
        const known = loaded.get(docPath);
        if (known && known.modifiedAt === mtimeMs) return known;
        const content = (await readFile(absolute, 'utf8')).replace(/\r\n|\r/g, '\n');
        const heading = firstHeadingTitle(content);
        const doc = {
            path: docPath,
            title: heading ?? fileNameTitle(docPath),
            hasHeading: heading !== undefined,
            content,
            modifiedAt: mtimeMs,
        };
        loaded.set(docPath, doc);
        return doc;
    } catch (error) {
        log.warn('Could not read a documentation file', { docPath, error });
        return null;
    }
};

const withTemplateTitles = (docs: readonly LoadedDoc[]): LoadedDoc[] => {
    const byPath = new Map(docs.map((doc) => [doc.path, doc]));
    return docs.map((doc) => {
        if (doc.path !== TEMPLATE_FILE && !doc.path.endsWith(`/${TEMPLATE_FILE}`)) return doc;
        const folder = folderOf(doc.path);
        const readme = byPath.get(folder ? `${folder}/${README_NAME}` : README_NAME);
        const label = readme?.hasHeading ? readme.title : folderLabel(folder || 'docs');
        return { ...doc, title: `Template: ${label}`, hasHeading: true };
    });
};

const loadLibrary = cache(async () => {
    const paths = (await markdownPathsUnder(DOCS_ROOT, 0)).filter(isIncludedDocPath);
    const docs = withTemplateTitles(
        (await Promise.all(paths.map(loadDoc))).filter((doc): doc is LoadedDoc => doc !== null),
    );
    const byPath = new Map(docs.map((doc) => [doc.path, doc]));
    const history = await gitHistory(Math.max(0, ...docs.map((doc) => doc.modifiedAt)));
    const entries = new Map(docs.map((doc) => [doc.path, entryOf(doc, history)]));
    const tree = buildDocTree([...entries.values()]);
    const order = docOrder(tree);
    return { byPath, entries, tree, order };
});

export type DocLibrary = {
    readonly tree: DocFolderNode;
    readonly order: readonly DocLink[];
    readonly known: ReadonlySet<string>;
};

export const docLibrary = async (): Promise<DocLibrary> => {
    const { byPath, tree, order } = await loadLibrary();
    return { tree, order, known: new Set(byPath.keys()) };
};

export type DocPage = LoadedDoc & { readonly entry: DocEntry };

export const readDoc = async (docPath: string): Promise<DocPage | null> => {
    if (!isIncludedDocPath(docPath)) return null;
    const { byPath, entries } = await loadLibrary();
    const doc = byPath.get(docPath);
    const entry = entries.get(docPath);
    return doc && entry ? { ...doc, entry } : null;
};

export const readDocSource = async (docPath: string): Promise<Buffer | null> => {
    if (!isIncludedDocPath(docPath)) return null;
    const { byPath } = await loadLibrary();
    if (!byPath.has(docPath)) return null;
    const absolute = path.resolve(DOCS_ROOT, docPath);
    if (!isInsideRoot(absolute)) return null;
    try {
        return await readFile(absolute);
    } catch (error) {
        log.warn('Could not read a documentation file', { docPath, error });
        return null;
    }
};

export const diagramNameOf = (source: string): string =>
    `${createHash('sha256').update(source).digest('hex').slice(0, 16)}.png`;

const fileExists = async (absolute: string): Promise<boolean> => {
    try {
        return (await stat(absolute)).isFile();
    } catch {
        return false;
    }
};

export const diagramUrls = async (sources: readonly string[]): Promise<ReadonlyMap<string, string>> => {
    const found = await Promise.all(
        sources.map(async (source): Promise<readonly [string, string] | null> => {
            const name = diagramNameOf(source);
            return (await fileExists(path.join(DIAGRAM_FOLDER, name))) ? [source, `${DIAGRAM_ROUTE}/${name}`] : null;
        }),
    );
    return new Map(found.filter((entry): entry is readonly [string, string] => entry !== null));
};

export const readDiagram = async (name: string): Promise<Buffer | null> => {
    if (!DIAGRAM_NAME.test(name)) return null;
    const absolute = path.join(DIAGRAM_FOLDER, name);
    if (path.dirname(absolute) !== DIAGRAM_FOLDER || !(await fileExists(absolute))) return null;
    return readFile(absolute);
};

const wordsOf = (query: string): string[] =>
    [...new Set(query.slice(0, DOC_SEARCH_LIMITS.QUERY).toLowerCase().split(/\s+/).filter(Boolean))].slice(
        0,
        DOC_SEARCH_LIMITS.WORDS,
    );

const snippetAt = (content: string, at: number): string => {
    if (at < 0) return '';
    const start = Math.max(0, at - SNIPPET_RADIUS);
    const end = Math.min(content.length, at + SNIPPET_RADIUS);
    const text = content.slice(start, end).replace(/\s+/g, ' ').trim();
    return `${start > 0 ? '… ' : ''}${text}${end < content.length ? ' …' : ''}`;
};

const anchorBefore = (content: string, at: number): string | undefined => {
    if (at < 0) return undefined;
    const slugger = createSlugger();
    let anchor: string | undefined;
    let offset = 0;
    let fenced = false;
    for (const line of content.split('\n')) {
        if (offset > at) break;
        if (FENCE_LINE.test(line)) fenced = !fenced;
        const heading = fenced ? null : HEADING_LINE.exec(line);
        if (heading) anchor = slugger(plainText(parseInline((heading[1] ?? '').trim())));
        offset += line.length + 1;
    }
    return anchor;
};

const longestOf = (words: readonly string[]): string =>
    words.reduce((longest, word) => (word.length > longest.length ? word : longest), '');

const matchRank = (title: string, phrase: string, phraseAt: number, words: readonly string[]): number => {
    if (title.includes(phrase)) return 3;
    if (phraseAt >= 0) return 2;
    return words.every((word) => title.includes(word)) ? 1 : 0;
};

const NO_RESULTS: DocSearchResult = { hits: [], capped: false };

export const searchDocs = async (query: string): Promise<DocSearchResult> => {
    const words = wordsOf(query);
    if (words.length === 0) return NO_RESULTS;
    const phrase = words.join(' ');
    const { byPath, entries, order } = await loadLibrary();
    const hits: (DocSearchHit & { readonly rank: number })[] = [];
    for (const { path: docPath } of order) {
        const doc = byPath.get(docPath);
        if (!doc) continue;
        const editors = entries.get(docPath)?.editors ?? [];
        const title = doc.title.toLowerCase();
        const body = doc.content.toLowerCase();
        const people = editors.join('\n').toLowerCase();
        if (!words.every((word) => title.includes(word) || body.includes(word) || people.includes(word))) continue;
        const bodyWords = words.filter((word) => body.includes(word));
        const byAuthorOnly = bodyWords.length === 0 && words.some((word) => people.includes(word));
        const phraseAt = body.replace(/\s/g, ' ').indexOf(phrase);
        const at = phraseAt >= 0 ? phraseAt : bodyWords.length > 0 ? body.indexOf(longestOf(bodyWords)) : -1;
        hits.push({
            path: doc.path,
            title: doc.title,
            snippet: byAuthorOnly ? '' : snippetAt(doc.content, at),
            anchor: byAuthorOnly ? undefined : anchorBefore(doc.content, at),
            editors: byAuthorOnly ? editors : undefined,
            rank: matchRank(title, phrase, phraseAt, words),
        });
    }
    return {
        hits: hits
            .sort((a, b) => b.rank - a.rank)
            .slice(0, DOC_SEARCH_LIMITS.RESULTS)
            .map(({ path: hitPath, title, snippet, anchor, editors }) => ({
                path: hitPath,
                title,
                snippet,
                anchor,
                editors,
            })),
        capped: hits.length > DOC_SEARCH_LIMITS.RESULTS,
    };
};
