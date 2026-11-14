export type AuthTestDataRow = { readonly id: number; readonly label: string };

export type AuthTestDataTable = { readonly table: string; readonly rows: readonly AuthTestDataRow[] };

export type AuthTestData = {
    readonly refreshTokenIds: readonly number[];
    readonly passwordResetIds: readonly number[];
    readonly tables: readonly AuthTestDataTable[];
};
