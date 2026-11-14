export type NotificationTestDataRow = { readonly id: number; readonly label: string };

export type NotificationTestDataTable = { readonly table: string; readonly rows: readonly NotificationTestDataRow[] };

export type NotificationEntityRefs = { readonly entityType: number; readonly entityIds: readonly number[] };

export type NotificationTestDataScope = {
    readonly userIds: readonly number[];
    readonly textPrefix: string;
    readonly entities: readonly NotificationEntityRefs[];
};

export type NotificationTestData = {
    readonly notificationIds: readonly number[];
    readonly tables: readonly NotificationTestDataTable[];
    readonly keptCount: number;
};
