export type FlagReasonTestDataRow = { readonly id: number; readonly label: string };

export type FlagReasonTestDataTable = { readonly table: string; readonly rows: readonly FlagReasonTestDataRow[] };

export type FlagReasonTestDataMarker = { readonly textPrefix: string };

export type FlagReasonTestData = {
    readonly flagReasonIds: readonly number[];
    readonly tables: readonly FlagReasonTestDataTable[];
    readonly references: readonly FlagReasonTestDataTable[];
};
