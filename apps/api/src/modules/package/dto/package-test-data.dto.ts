export type PackageTestDataRow = { readonly id: number; readonly label: string };

export type PackageTestDataTable = { readonly table: string; readonly rows: readonly PackageTestDataRow[] };

export type PackageTestDataScope = {
    readonly partnerIds: readonly number[];
    readonly textPrefix: string;
    readonly slugPrefix: string;
};

export type PackageTestData = {
    readonly packageIds: readonly number[];
    readonly versionIds: readonly number[];
    readonly deleteReasonIds: readonly number[];
    readonly tables: readonly PackageTestDataTable[];
    readonly folders: readonly string[];
    readonly kept: readonly PackageTestDataTable[];
    readonly blockers: readonly string[];
};
