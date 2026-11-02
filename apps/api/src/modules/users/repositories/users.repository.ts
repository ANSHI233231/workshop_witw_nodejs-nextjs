import { type PaginationQuery, toOffset } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { IUsersRepository } from '../contracts/users-repository.contract';
import type {
    RoleListFilters,
    SignInIdentifier,
    SignInIdentifierField,
    UserListFilters,
    NewUser,
    UserUpdate,
} from '../dto/users.dto';
import { UsersSQL } from '../sql/users.sql';
import {
    type CountRow,
    type RoleListRow,
    type SignInUserRow,
    type UserListRow,
    type ActiveRoleRow,
    type UserIdRow,
    type UserRoleNameRow,
    UserRoleStatus,
    UserStatus,
    type UserSummaryRow,
    type PasswordHashRow,
    type UserIdentifierHolderRow,
    type UserDetailRow,
    type IdentifierClashRow,
    type SystemRoleRow,
    type UserRoleStatusCode,
    SYSTEM_ROLE_IDS,
} from '../types/users.types';

const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

const mobileDigits = (text: string): string => (/^[\d\s]+$/.test(text) ? text.replace(/\s+/g, '') : text);

const pickParams = (search: string | undefined): unknown[] =>
    search === undefined
        ? [UserStatus.ACTIVE]
        : [
              UserStatus.ACTIVE,
              likeAnywhere(search),
              likeAnywhere(search),
              likeAnywhere(search),
              likeAnywhere(mobileDigits(search)),
          ];

const userListParams = (filters: UserListFilters): unknown[] => [
    UserStatus.DELETED,
    ...(filters.status !== undefined ? [filters.status] : []),
    ...(filters.search !== undefined
        ? [
              likeAnywhere(filters.search),
              likeAnywhere(filters.search),
              likeAnywhere(filters.search),
              likeAnywhere(mobileDigits(filters.search)),
          ]
        : []),
    ...(filters.metaRoleId !== undefined ? [UserRoleStatus.ACTIVE, filters.metaRoleId] : []),
];

const userListShape = (filters: UserListFilters) => ({
    status: filters.status !== undefined,
    search: filters.search !== undefined,
    role: filters.metaRoleId !== undefined,
});

const roleListParams = (filters: RoleListFilters): unknown[] =>
    filters.search !== undefined ? [likeAnywhere(filters.search), likeAnywhere(filters.search)] : [];

const roleListShape = (filters: RoleListFilters) => ({ search: filters.search !== undefined });

const SIGN_IN_LOOKUP: Readonly<Record<SignInIdentifierField, string>> = {
    email: UsersSQL.findSignInUserByEmail,
    mobile: UsersSQL.findSignInUserByMobile,
    username: UsersSQL.findSignInUserByUsername,
};

export class UsersRepository implements IUsersRepository {
    async insertUser(db: DbExecutor, user: NewUser): Promise<number> {
        const result = await db.execute(UsersSQL.insertUser, [
            user.name,
            user.username,
            user.email,
            user.mobile,
            user.passwordHash,
            UserStatus.ACTIVE,
        ]);
        return result.insertId;
    }

    async updatePasswordHash(db: DbExecutor, userId: number, passwordHash: string, actorId: number): Promise<boolean> {
        const result = await db.execute(UsersSQL.updatePasswordHash, [
            passwordHash,
            actorId,
            userId,
            UserStatus.ACTIVE,
        ]);
        return result.affectedRows === 1;
    }

    async findIdentifierHolders(db: DbExecutor, user: NewUser): Promise<UserIdentifierHolderRow[]> {
        return db.query<UserIdentifierHolderRow>(UsersSQL.findIdentifierHolders, [
            user.username,
            user.email,
            user.mobile,
            user.mobile,
        ]);
    }

    async findSignInUser(db: DbExecutor, identifier: SignInIdentifier): Promise<SignInUserRow | undefined> {
        const rows = await db.query<SignInUserRow>(SIGN_IN_LOOKUP[identifier.field], [identifier.value]);
        return rows[0];
    }

    async listActiveRoles(db: DbExecutor, userId: number, metaRoleIds: readonly number[]): Promise<ActiveRoleRow[]> {
        const rows = await db.query<ActiveRoleRow>(UsersSQL.listActiveRoles(metaRoleIds.length), [
            userId,
            ...metaRoleIds,
            UserRoleStatus.ACTIVE,
            UserStatus.ACTIVE,
        ]);
        return rows.map((row) => ({ id: row.id, name: row.name }) as ActiveRoleRow);
    }

    async listActiveUserIdsWithRole(db: DbExecutor, metaRoleId: number): Promise<number[]> {
        const rows = await db.query<UserIdRow>(UsersSQL.listActiveUserIdsWithRole, [
            metaRoleId,
            UserRoleStatus.ACTIVE,
            UserStatus.ACTIVE,
        ]);
        return rows.map((row) => row.id);
    }

    async findPasswordHash(db: DbExecutor, id: number): Promise<string | null> {
        const rows = await db.query<PasswordHashRow>(UsersSQL.findPasswordHashById, [id, UserStatus.ACTIVE]);
        return rows[0]?.passwordHash ?? null;
    }

    async findUserDetail(db: DbExecutor, id: number): Promise<UserDetailRow | undefined> {
        const rows = await db.query<UserDetailRow>(UsersSQL.findUserDetail, [id, UserStatus.DELETED]);
        return rows[0];
    }

    findIdentifierClashes(
        db: DbExecutor,
        id: number,
        username: string | null,
        email: string,
        mobile: string,
    ): Promise<IdentifierClashRow[]> {
        return db.query<IdentifierClashRow>(UsersSQL.findIdentifierClashes, [id, username, email, mobile]);
    }

    listSystemRoles(db: DbExecutor, userId: number): Promise<SystemRoleRow[]> {
        return db.query<SystemRoleRow>(UsersSQL.listSystemRoles(SYSTEM_ROLE_IDS.length), [userId, ...SYSTEM_ROLE_IDS]);
    }

    async updateStatus(db: DbExecutor, id: number, status: number, actorId: number): Promise<void> {
        await db.execute(UsersSQL.updateStatus, [status, actorId, id, UserStatus.DELETED]);
    }

    async updateUser(db: DbExecutor, id: number, update: UserUpdate, actorId: number): Promise<void> {
        await db.execute(UsersSQL.updateUser, [
            update.name,
            update.username,
            update.email,
            update.mobile,
            actorId,
            id,
            UserStatus.DELETED,
        ]);
    }

    async setUserRoleStatus(
        db: DbExecutor,
        userId: number,
        metaRoleId: number,
        status: UserRoleStatusCode,
        actorId: number | null,
    ): Promise<void> {
        await db.execute(UsersSQL.setUserRoleStatus, [userId, metaRoleId, status, actorId, actorId]);
    }

    async findUserById(db: DbExecutor, id: number): Promise<UserSummaryRow | undefined> {
        const rows = await db.query<UserSummaryRow>(UsersSQL.findUserById, [id]);
        return rows[0];
    }

    pickUsers(db: DbExecutor, search: string | undefined, pagination: PaginationQuery): Promise<UserListRow[]> {
        return db.query<UserListRow>(UsersSQL.pickUsers(search !== undefined), [
            ...pickParams(search),
            pagination.limit,
            toOffset(pagination),
        ]);
    }

    async countPickUsers(db: DbExecutor, search: string | undefined): Promise<number> {
        const rows = await db.query<CountRow>(UsersSQL.countPickUsers(search !== undefined), pickParams(search));
        return Number(rows[0]?.total ?? 0);
    }

    async listUsers(db: DbExecutor, filters: UserListFilters, pagination: PaginationQuery): Promise<UserListRow[]> {
        return db.query<UserListRow>(UsersSQL.listUsers(userListShape(filters)), [
            ...userListParams(filters),
            pagination.limit,
            toOffset(pagination),
        ]);
    }

    async listRoleNamesOfUsers(db: DbExecutor, userIds: readonly number[]): Promise<UserRoleNameRow[]> {
        if (userIds.length === 0) return [];
        return db.query<UserRoleNameRow>(UsersSQL.listRoleNamesOfUsers(userIds.length), [
            UserRoleStatus.ACTIVE,
            ...userIds,
        ]);
    }

    async countUsers(db: DbExecutor, filters: UserListFilters): Promise<number> {
        const rows = await db.query<CountRow>(UsersSQL.countUsers(userListShape(filters)), userListParams(filters));
        return Number(rows[0]?.total ?? 0);
    }

    async listRoles(db: DbExecutor, filters: RoleListFilters, pagination: PaginationQuery): Promise<RoleListRow[]> {
        return db.query<RoleListRow>(UsersSQL.listRoles(roleListShape(filters)), [
            ...roleListParams(filters),
            pagination.limit,
            toOffset(pagination),
        ]);
    }

    async countRoles(db: DbExecutor, filters: RoleListFilters): Promise<number> {
        const rows = await db.query<CountRow>(UsersSQL.countRoles(roleListShape(filters)), roleListParams(filters));
        return Number(rows[0]?.total ?? 0);
    }
}
