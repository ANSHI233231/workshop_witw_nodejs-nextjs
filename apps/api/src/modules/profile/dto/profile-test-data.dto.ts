export type ProfileTestDataRow = { readonly id: number; readonly label: string };

export type ProfileTestDataTable = { readonly table: string; readonly rows: readonly ProfileTestDataRow[] };

export type ProfileTestData = {
    readonly profileIds: readonly number[];
    readonly tables: readonly ProfileTestDataTable[];
    readonly folders: readonly string[];
};
