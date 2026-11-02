import type { DocEntry, DocFolderNode, DocLink, DocTreeNode } from '@/types/docs.types';

import { folderOf, README_NAME, ROOT_README } from './doc-links';

type FolderDraft = {
    readonly path: string;
    readonly folders: Map<string, FolderDraft>;
    readonly files: DocEntry[];
    readme: DocEntry | undefined;
};

const draftOf = (folderPath: string): FolderDraft => ({
    path: folderPath,
    folders: new Map(),
    files: [],
    readme: undefined,
});

const byTitle = (a: DocTreeNode, b: DocTreeNode): number =>
    a.title.localeCompare(b.title, 'en', { sensitivity: 'base', numeric: true });

const newestFirst = (a: DocEntry, b: DocEntry): number =>
    b.addedOrder - a.addedOrder || a.path.localeCompare(b.path, 'en', { numeric: true });

export const folderLabel = (folderPath: string): string => {
    const name = folderPath.slice(folderPath.lastIndexOf('/') + 1).replace(/[-_]+/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
};

const finish = (draft: FolderDraft): DocFolderNode => {
    const folders = [...draft.folders.values()].map(finish).sort(byTitle);
    const files = [...draft.files].sort(newestFirst).map((file): DocTreeNode => ({ kind: 'file', ...file }));
    return {
        kind: 'folder',
        path: draft.path,
        title: draft.readme?.hasHeading ? draft.readme.title : folderLabel(draft.path),
        readme: draft.readme?.path,
        children: [...folders, ...files],
    };
};

export const buildDocTree = (entries: readonly DocEntry[]): DocFolderNode => {
    const root = draftOf('');
    for (const entry of entries) {
        let folder = root;
        const folderPath = folderOf(entry.path);
        if (folderPath) {
            let walked = '';
            for (const segment of folderPath.split('/')) {
                walked = walked ? `${walked}/${segment}` : segment;
                let next = folder.folders.get(segment);
                if (!next) {
                    next = draftOf(walked);
                    folder.folders.set(segment, next);
                }
                folder = next;
            }
        }
        const isReadme = entry.path === ROOT_README || entry.path.endsWith(`/${README_NAME}`);
        if (isReadme) folder.readme = entry;
        else folder.files.push(entry);
    }
    return finish(root);
};

export const docOrder = (node: DocTreeNode): readonly DocLink[] => {
    if (node.kind === 'file') return [node];
    const own = node.readme ? [{ path: node.readme, title: node.title }] : [];
    return [...own, ...node.children.flatMap(docOrder)];
};
