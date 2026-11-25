export type ChatTestDataRow = { readonly id: number; readonly label: string };

export type ChatTestDataTable = { readonly table: string; readonly rows: readonly ChatTestDataRow[] };

export type ChatTestData = {
    readonly conversationIds: readonly number[];
    readonly tables: readonly ChatTestDataTable[];
};
