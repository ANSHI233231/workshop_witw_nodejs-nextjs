export type PartnerTestDataRow = { readonly id: number; readonly label: string };

export type PartnerTestDataTable = { readonly table: string; readonly rows: readonly PartnerTestDataRow[] };

export type PartnerTestData = {
    readonly partnerIds: readonly number[];
    readonly partnerParkIds: readonly number[];
    readonly tables: readonly PartnerTestDataTable[];
    readonly folders: readonly string[];
    readonly kept: readonly PartnerTestDataTable[];
};
