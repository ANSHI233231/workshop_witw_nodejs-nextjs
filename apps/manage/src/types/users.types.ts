export const UserStatus = { ACTIVE: 1, INACTIVE: 2 } as const;

export type UserStatusCode = (typeof UserStatus)[keyof typeof UserStatus];

export const SystemRole = {
    SUPER_ADMIN: 100,
} as const;

export const USER_LIST_LIMITS = { SEARCH: 100 } as const;

export const USER_EDIT_LIMITS = {
    NAME_MIN: 2,
    NAME_MAX: 150,
    EMAIL_MAX: 254,
    USERNAME_MIN: 3,
    USERNAME_MAX: 100,
    PASSWORD_MIN: 8,
    PASSWORD_MAX: 72,
} as const;

export type UserPickerOption = {
    readonly id: number;
    readonly name: string;
    readonly username: string | null;
    readonly email: string | null;
    readonly mobile: string | null;
};

export type UserListItem = {
    readonly id: number;
    readonly name: string;
    readonly username: string | null;
    readonly email: string | null;
    readonly mobile: string | null;
    readonly roleNames: readonly string[];
    readonly status: UserStatusCode;
};

export type UserListFilters = {
    readonly search: string;
    readonly status: UserStatusCode | undefined;
    readonly metaRoleId: number | undefined;
    readonly page: number;
};

export type UserDetail = {
    readonly id: number;
    readonly name: string;
    readonly username: string | null;
    readonly email: string | null;
    readonly mobile: string | null;
    readonly status: UserStatusCode;
    readonly systemRoleIds: readonly number[];
};

export type UserUpdateInput = {
    readonly name: string;
    readonly username: string | null;
    readonly mobile: string;
    readonly email: string;
    readonly systemRoleIds: readonly number[];
};

export type UserPasswordInput = {
    readonly password: string;
    readonly confirmPassword: string;
};
