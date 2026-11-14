export type ParkTestDataRow = { readonly id: number; readonly label: string };

export type ParkTestDataTable = { readonly table: string; readonly rows: readonly ParkTestDataRow[] };

export type ParkTestDataMarker = { readonly textPrefix: string; readonly slugPrefix: string };

export type ParkTestData = {
    readonly parkIds: readonly number[];
    readonly tables: readonly ParkTestDataTable[];
    readonly references: readonly ParkTestDataTable[];
    readonly folders: readonly string[];
};
