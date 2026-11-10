import type { MetaRoleStatusCode, UserStatusCode } from '../types/users.types';

export type SignInIdentifierField = 'email' | 'mobile' | 'username';

export type SignInIdentifier = {
    readonly field: SignInIdentifierField;
    readonly value: string;
};

export type NewUser = {
    readonly name: string;
    readonly username: string | null;
    readonly email: string | null;
    readonly mobile: string | null;
    readonly passwordHash: string;
};

export type NewSignUp = {
    readonly name: string;
    readonly email: string;
    readonly mobile: string;
    readonly password: string;
};

export type UserSummary = {
    readonly id: number;
    readonly name: string;
    readonly username: string | null;
    readonly email: string | null;
    readonly mobile: string | null;
    readonly status: UserStatusCode;
    readonly passwordChangedAt: string | null;
};

export type SignInUser = UserSummary & {
    readonly passwordHash: string | null;
};

export type UsersSummaryDto = {
    readonly total: number;
    readonly active: number;
};

export type ActiveRole = {
    readonly id: number;
    readonly name: string;
};

export type UserPickerOptionDto = {
    readonly id: number;
    readonly name: string;
    readonly username: string | null;
    readonly email: string | null;
    readonly mobile: string | null;
};

export type UserPickerPage = { readonly items: readonly UserPickerOptionDto[]; readonly total: number };

export type UserListFilters = {
    readonly search: string | undefined;
    readonly status: UserStatusCode | undefined;
    readonly metaRoleId: number | undefined;
};

export type UserListItemDto = {
    readonly id: number;
    readonly name: string;
    readonly username: string | null;
    readonly email: string | null;
    readonly mobile: string | null;
    readonly roleNames: readonly string[];
    readonly status: UserStatusCode;
};

export type UserDetailDto = {
    readonly id: number;
    readonly name: string;
    readonly username: string | null;
    readonly email: string | null;
    readonly mobile: string | null;
    readonly status: UserStatusCode;
    readonly systemRoleIds: readonly number[];
};

export type UserUpdate = {
    readonly name: string;
    readonly username: string | null;
    readonly email: string;
    readonly mobile: string;
    readonly systemRoleIds: readonly number[];
};

export type NewAccount = {
    readonly name: string;
    readonly username: string | null;
    readonly email: string;
    readonly mobile: string;
    readonly systemRoleIds: readonly number[];
    readonly password: string;
};

export type UserListPage = {
    readonly items: readonly UserListItemDto[];
    readonly total: number;
};

export type RoleListFilters = {
    readonly search: string | undefined;
};

export type RoleListItemDto = {
    readonly id: number;
    readonly name: string;
    readonly status: MetaRoleStatusCode;
};

export type RoleListPage = {
    readonly items: readonly RoleListItemDto[];
    readonly total: number;
};
