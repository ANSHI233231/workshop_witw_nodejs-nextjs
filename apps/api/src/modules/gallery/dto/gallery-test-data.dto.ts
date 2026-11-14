export type GalleryTestDataRow = { readonly id: number; readonly label: string };

export type GalleryTestDataTable = { readonly table: string; readonly rows: readonly GalleryTestDataRow[] };

export type GalleryTestDataScope = {
    readonly partnerIds: readonly number[];
    readonly textPrefix: string;
    readonly removedPackageIds: readonly number[];
};

export type GalleryTestData = {
    readonly galleryIds: readonly number[];
    readonly photoIds: readonly number[];
    readonly tables: readonly GalleryTestDataTable[];
    readonly folders: readonly string[];
    readonly kept: readonly GalleryTestDataTable[];
    readonly blockers: readonly string[];
};
