export type SharedSafariTestDataRow = { readonly id: number; readonly label: string };

export type SharedSafariTestDataTable = { readonly table: string; readonly rows: readonly SharedSafariTestDataRow[] };

export type SharedSafariTestDataScope = {
    readonly userIds: readonly number[];
    readonly textPrefix: string;
    readonly slugPrefix: string;
};

export type SharedSafariTestData = {
    readonly safariIds: readonly number[];
    readonly memberIds: readonly number[];
    readonly commentIds: readonly number[];
    readonly flagIds: readonly number[];
    readonly tables: readonly SharedSafariTestDataTable[];
    readonly folders: readonly string[];
    readonly kept: readonly SharedSafariTestDataTable[];
};
