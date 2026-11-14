export type TestDataRow = { readonly id: number; readonly label: string };

export type TestDataTable = { readonly table: string; readonly rows: readonly TestDataRow[] };

export type TestAccountMarker = {
    readonly emailPrefix: string;
    readonly keptEmails: readonly string[];
    readonly protectedEmailSuffixes: readonly string[];
};

export type UsersTestData = {
    readonly userIds: readonly number[];
    readonly tables: readonly TestDataTable[];
    readonly kept: readonly TestDataTable[];
    readonly blockers: readonly string[];
};
