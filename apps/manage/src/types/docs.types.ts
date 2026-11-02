export type DocEntry = {
    readonly path: string;
    readonly title: string;
    readonly hasHeading: boolean;
    readonly added: string;
    readonly addedOrder: number;
    readonly updated: string;
    readonly isCommitted: boolean;
    readonly addedBy: string | undefined;
    readonly updatedBy: string | undefined;
    readonly editors: readonly string[];
};

export type DocLink = { readonly path: string; readonly title: string };

export type DocFileNode = DocEntry & { readonly kind: 'file' };

export type DocFolderNode = {
    readonly kind: 'folder';
    readonly path: string;
    readonly title: string;
    readonly readme: string | undefined;
    readonly children: readonly DocTreeNode[];
};

export type DocTreeNode = DocFileNode | DocFolderNode;

export type DocSearchHit = {
    readonly path: string;
    readonly title: string;
    readonly snippet: string;
    readonly anchor: string | undefined;
    readonly editors: readonly string[] | undefined;
};

export type DocSearchResult = {
    readonly hits: readonly DocSearchHit[];
    readonly capped: boolean;
};

export const DOC_SEARCH_LIMITS = {
    QUERY: 100,
    WORDS: 8,
    RESULTS: 30,
} as const;
