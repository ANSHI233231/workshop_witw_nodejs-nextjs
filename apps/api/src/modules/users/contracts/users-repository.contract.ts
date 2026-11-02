import type { DbExecutor } from '../../../database/connection';
import type { PaginationQuery } from '../../../core/validation';
import type { RoleListFilters, SignInIdentifier, UserListFilters, NewUser, UserUpdate } from '../dto/users.dto';
import type {
    RoleListRow,
    SignInUserRow,
    UserListRow,
    UserRoleNameRow,
    ActiveRoleRow,
    UserSummaryRow,
    UserIdentifierHolderRow,
    UserDetailRow,
    IdentifierClashRow,
    SystemRoleRow,
    UserRoleStatusCode,
} from '../types/users.types';

export interface IUsersRepository {
    insertUser(db: DbExecutor, user: NewUser): Promise<number>;
    updatePasswordHash(db: DbExecutor, userId: number, passwordHash: string, actorId: number): Promise<boolean>;
    findUserDetail(db: DbExecutor, id: number): Promise<UserDetailRow | undefined>;
    findIdentifierClashes(
        db: DbExecutor,
        id: number,
        username: string | null,
        email: string,
        mobile: string,
    ): Promise<IdentifierClashRow[]>;
    listSystemRoles(db: DbExecutor, userId: number): Promise<SystemRoleRow[]>;
    updateUser(db: DbExecutor, id: number, update: UserUpdate, actorId: number): Promise<void>;
    updateStatus(db: DbExecutor, id: number, status: number, actorId: number): Promise<void>;
    setUserRoleStatus(
        db: DbExecutor,
        userId: number,
        metaRoleId: number,
        status: UserRoleStatusCode,
        actorId: number | null,
    ): Promise<void>;
    findIdentifierHolders(db: DbExecutor, user: NewUser): Promise<UserIdentifierHolderRow[]>;
    findSignInUser(db: DbExecutor, identifier: SignInIdentifier): Promise<SignInUserRow | undefined>;
    findUserById(db: DbExecutor, id: number): Promise<UserSummaryRow | undefined>;
    findPasswordHash(db: DbExecutor, id: number): Promise<string | null>;
    listActiveRoles(db: DbExecutor, userId: number, metaRoleIds: readonly number[]): Promise<ActiveRoleRow[]>;
    listActiveUserIdsWithRole(db: DbExecutor, metaRoleId: number): Promise<number[]>;
    pickUsers(db: DbExecutor, search: string | undefined, pagination: PaginationQuery): Promise<UserListRow[]>;
    countPickUsers(db: DbExecutor, search: string | undefined): Promise<number>;
    listUsers(db: DbExecutor, filters: UserListFilters, pagination: PaginationQuery): Promise<UserListRow[]>;
    countUsers(db: DbExecutor, filters: UserListFilters): Promise<number>;
    listRoleNamesOfUsers(db: DbExecutor, userIds: readonly number[]): Promise<UserRoleNameRow[]>;
    listRoles(db: DbExecutor, filters: RoleListFilters, pagination: PaginationQuery): Promise<RoleListRow[]>;
    countRoles(db: DbExecutor, filters: RoleListFilters): Promise<number>;
}
