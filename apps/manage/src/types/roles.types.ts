export const MetaRoleStatus = { ACTIVE: 1, INACTIVE: 2 } as const;

export type MetaRoleStatusCode = (typeof MetaRoleStatus)[keyof typeof MetaRoleStatus];

export const ROLE_LIST_LIMITS = { SEARCH: 100 } as const;

export type RoleListItem = {
    readonly id: number;
    readonly name: string;
    readonly status: MetaRoleStatusCode;
};

export type RoleListFilters = {
    readonly search: string;
    readonly page: number;
};
