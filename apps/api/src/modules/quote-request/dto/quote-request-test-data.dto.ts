export type QuoteRequestTestDataRow = { readonly id: number; readonly label: string };

export type QuoteRequestTestDataTable = { readonly table: string; readonly rows: readonly QuoteRequestTestDataRow[] };

export type QuoteRequestTestDataScope = {
    readonly userIds: readonly number[];
    readonly partnerIds: readonly number[];
    readonly packageIds: readonly number[];
    readonly textPrefix: string;
};

export type QuoteRequestTestData = {
    readonly quoteRequestIds: readonly number[];
    readonly tables: readonly QuoteRequestTestDataTable[];
    readonly kept: readonly QuoteRequestTestDataTable[];
};
