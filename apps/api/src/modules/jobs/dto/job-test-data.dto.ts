export type JobTestDataRow = { readonly id: number; readonly label: string };

export type JobTestDataTable = { readonly table: string; readonly rows: readonly JobTestDataRow[] };

export type JobTestDataMarker = { readonly textPrefix: string };

export type JobTestData = {
    readonly runIds: readonly number[];
    readonly tables: readonly JobTestDataTable[];
    readonly blockers: readonly string[];
};
