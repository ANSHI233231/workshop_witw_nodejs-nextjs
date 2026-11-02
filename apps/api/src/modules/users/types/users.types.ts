import type { RowDataPacket } from '../../../database/connection';

export const UserStatus = { ACTIVE: 1, INACTIVE: 2, DELETED: -1 } as const;

export const UserRoleStatus = { ACTIVE: 1, INACTIVE: 2, DELETED: -1 } as const;

export const MetaRoleStatus = { ACTIVE: 1, INACTIVE: 2 } as const;

export const MetaRole = {
    SUPER_ADMIN: 100,
} as const;

export const SYSTEM_ROLE_IDS: readonly number[] = [MetaRole.SUPER_ADMIN];

export type UserStatusCode = (typeof UserStatus)[keyof typeof UserStatus];
export type UserRoleStatusCode = (typeof UserRoleStatus)[keyof typeof UserRoleStatus];
export type MetaRoleStatusCode = (typeof MetaRoleStatus)[keyof typeof MetaRoleStatus];
export type MetaRoleId = (typeof MetaRole)[keyof typeof MetaRole];

export interface SignInUserRow extends RowDataPacket {
    id: number;
    name: string;
    username: string | null;
    email: string | null;
    mobile: string | null;
    passwordHash: string | null;
    status: UserStatusCode;
    passwordChangedAt: Date | null;
}

export interface PasswordHashRow extends RowDataPacket {
    passwordHash: string | null;
}

export interface UserSummaryRow extends RowDataPacket {
    id: number;
    name: string;
    username: string | null;
    email: string | null;
    mobile: string | null;
    status: UserStatusCode;
    passwordChangedAt: Date | null;
}

export const USER_LIST_LIMITS = { SEARCH: 100 } as const;

export const PASSWORD_HASH_ROUNDS = 10;

export const USER_EDIT_LIMITS = {
    NAME_MIN: 2,
    NAME_MAX: 150,
    EMAIL_MAX: 254,
    USERNAME_MIN: 3,
    USERNAME_MAX: 100,
    PASSWORD_MIN: 8,
    PASSWORD_MAX: 72,
} as const;

export interface UserListRow extends RowDataPacket {
    id: number;
    name: string;
    username: string | null;
    email: string | null;
    mobile: string | null;
    status: UserStatusCode;
}

export interface UserIdRow extends RowDataPacket {
    id: number;
}

export interface ActiveRoleRow extends RowDataPacket {
    id: number;
    name: string;
}

export interface UserRoleNameRow extends RowDataPacket {
    userId: number;
    metaRoleId: number;
    name: string;
}

export interface UserDetailRow extends RowDataPacket {
    id: number;
    name: string;
    username: string | null;
    email: string | null;
    mobile: string | null;
    status: UserStatusCode;
}

export interface IdentifierClashRow extends RowDataPacket {
    id: number;
    username: string | null;
    email: string | null;
    mobile: string | null;
}

export interface SystemRoleRow extends RowDataPacket {
    metaRoleId: number;
    status: UserRoleStatusCode;
}

export interface CountRow extends RowDataPacket {
    total: number;
}

export const ROLE_LIST_LIMITS = { SEARCH: 100 } as const;

export interface RoleListRow extends RowDataPacket {
    id: number;
    name: string;
    status: MetaRoleStatusCode;
}

export interface UserIdentifierHolderRow extends RowDataPacket {
    username: string | null;
    email: string | null;
    mobile: string | null;
}

export const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/;
