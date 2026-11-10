import type { UserStatusCode } from '../types/users.types';
import type { PaginationQuery } from '../../../core/validation';
import type {
    RoleListFilters,
    RoleListPage,
    SignInIdentifier,
    SignInUser,
    UserListFilters,
    UserListPage,
    UserPickerPage,
    ActiveRole,
    UsersSummaryDto,
    UserSummary,
    NewUser,
    UserDetailDto,
    UserUpdate,
    NewAccount,
    NewSignUp,
} from '../dto/users.dto';

export interface IUsersService {
    createUser(user: NewUser): Promise<UserSummary>;
    changePassword(userId: number, passwordHash: string, actorId: number): Promise<void>;
    userDetail(id: number): Promise<UserDetailDto>;
    setPassword(userId: number, password: string, actorId: number): Promise<void>;
    updateUser(id: number, update: UserUpdate, actorId: number): Promise<UserDetailDto>;
    setStatus(id: number, status: UserStatusCode, actorId: number): Promise<UserDetailDto>;
    createAccount(account: NewAccount, actorId: number | null): Promise<UserDetailDto>;
    signUp(account: NewSignUp): Promise<UserSummary>;
    passwordHashOf(userId: number): Promise<string | null>;
    findForSignIn(identifier: SignInIdentifier): Promise<SignInUser | undefined>;
    findActiveById(id: number): Promise<UserSummary | undefined>;
    activeRoles(userId: number, metaRoleIds: readonly number[]): Promise<ActiveRole[]>;
    activeUserIdsWithRole(metaRoleId: number): Promise<number[]>;
    summary(): Promise<UsersSummaryDto>;
    pickUsers(search: string | undefined, pagination: PaginationQuery): Promise<UserPickerPage>;
    listUsers(filters: UserListFilters, pagination: PaginationQuery): Promise<UserListPage>;
    listRoles(filters: RoleListFilters, pagination: PaginationQuery): Promise<RoleListPage>;
}
