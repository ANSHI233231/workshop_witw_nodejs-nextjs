import bcrypt from 'bcryptjs';

import { ClientApp, type ClientAppCode, getRequestContext } from '../../../core/context';
import { ConflictException, NotFoundException, ValidationException } from '../../../core/exceptions';
import type { PaginationQuery } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import { AuditAction, type IAuditService, AuditEntity } from '../../audit';
import { type INotificationService, NotificationKind } from '../../notification';
import type { IUsersRepository } from '../contracts/users-repository.contract';
import type { IUsersService } from '../contracts/users-service.contract';
import type {
    ActiveRole,
    UsersSummaryDto,
    RoleListFilters,
    RoleListPage,
    SignInIdentifier,
    SignInUser,
    UserListFilters,
    UserListPage,
    UserPickerPage,
    UserSummary,
    NewUser,
    UserDetailDto,
    UserUpdate,
    NewAccount,
    NewSignUp,
} from '../dto/users.dto';
import { toRoleListItem, toUserListItem } from '../mappers/users.mapper';
import {
    UserStatus,
    MetaRole,
    type SystemRoleRow,
    UserRoleStatus,
    PASSWORD_HASH_ROUNDS,
    type UserStatusCode,
} from '../types/users.types';

const userNotFound = (): NotFoundException => new NotFoundException('This user was not found.', 'USER_NOT_FOUND');

const activeRoleIds = (roles: readonly SystemRoleRow[]): number[] =>
    roles
        .filter((role) => role.status === UserRoleStatus.ACTIVE)
        .map((role) => role.metaRoleId)
        .sort((a, b) => a - b);

const EDITED_FIELDS = ['name', 'username', 'email', 'mobile'] as const;

const ACCOUNT_APPS: readonly ClientAppCode[] = [ClientApp.MANAGE, ClientApp.WEB];

const appOfOwnChange = (): ClientAppCode => {
    const app = getRequestContext()?.clientApp;
    return app !== undefined && ACCOUNT_APPS.includes(app) ? app : ClientApp.WEB;
};

const actAs = (userId: number): void => {
    const context = getRequestContext();
    if (context) context.userId = userId;
};

const changesBetween = (before: UserDetailDto, update: UserUpdate): Record<string, { from: unknown; to: unknown }> =>
    Object.fromEntries(
        EDITED_FIELDS.filter((field) => before[field] !== update[field]).map((field) => [
            field,
            { from: before[field], to: update[field] },
        ]),
    );

export class UsersService implements IUsersService {
    constructor(
        private readonly db: Database,
        private readonly usersRepository: IUsersRepository,
        private readonly auditService: IAuditService,
        private readonly notificationService: INotificationService,
    ) {}

    async createUser(user: NewUser): Promise<UserSummary> {
        const created = await this.insertNewUser(user);
        await this.auditService.record({
            action: AuditAction.USER_CREATED,
            entityType: AuditEntity.USER,
            entityId: created.id,
            details: { username: user.username, email: user.email, mobile: user.mobile },
        });
        return created;
    }

    async signUp(account: NewSignUp): Promise<UserSummary> {
        const passwordHash = await bcrypt.hash(account.password, PASSWORD_HASH_ROUNDS);
        try {
            return await this.db.transaction(async () => {
                const created = await this.insertNewUser({
                    name: account.name,
                    username: null,
                    email: account.email,
                    mobile: account.mobile,
                    passwordHash,
                });
                actAs(created.id);
                await this.auditService.record({
                    action: AuditAction.USER_SIGNED_UP,
                    entityType: AuditEntity.USER,
                    entityId: created.id,
                    details: { email: account.email, mobile: account.mobile },
                });
                return created;
            });
        } catch (error) {
            await this.auditService.recordFailure(
                {
                    action: AuditAction.USER_SIGN_UP_FAILED,
                    entityType: AuditEntity.USER,
                    actorLabel: account.email,
                    details: { email: account.email, mobile: account.mobile },
                },
                error,
            );
            throw error;
        }
    }

    private async insertNewUser(user: NewUser): Promise<UserSummary> {
        const holders = await this.usersRepository.findIdentifierHolders(this.db, user);
        const same = (held: string | null, wanted: string | null): boolean =>
            held !== null && wanted !== null && held.toLowerCase() === wanted.toLowerCase();
        if (holders.some((row) => same(row.username, user.username))) {
            throw new ConflictException('This username is already taken.', 'USERNAME_TAKEN');
        }
        if (holders.some((row) => same(row.email, user.email))) {
            throw new ConflictException('An account with this email already exists.', 'EMAIL_TAKEN');
        }
        if (holders.some((row) => same(row.mobile, user.mobile))) {
            throw new ConflictException('An account with this mobile number already exists.', 'MOBILE_TAKEN');
        }
        const id = await this.usersRepository.insertUser(this.db, user);
        return {
            id,
            name: user.name,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            status: UserStatus.ACTIVE,
            passwordChangedAt: null,
        };
    }

    passwordHashOf(userId: number): Promise<string | null> {
        return this.usersRepository.findPasswordHash(this.db, userId);
    }

    async changePassword(userId: number, passwordHash: string, actorId: number): Promise<void> {
        const event = {
            action: AuditAction.USER_PASSWORD_CHANGED,
            entityType: AuditEntity.USER,
            entityId: userId,
        } as const;
        try {
            await this.db.transaction(async () => {
                if (!(await this.usersRepository.updatePasswordHash(this.db, userId, passwordHash, actorId))) {
                    throw new NotFoundException('This account was not found.', 'USER_NOT_FOUND');
                }
                await this.auditService.record(event);
                await this.notificationService.notify([
                    {
                        userId,
                        notificationKind: NotificationKind.PASSWORD_CHANGED,
                        entityType: AuditEntity.USER,
                        entityId: userId,
                        clientApp: actorId === userId ? appOfOwnChange() : ClientApp.WEB,
                        ownerType: null,
                        ownerId: null,
                        title: 'Password changed',
                        excerpt: null,
                        actorId,
                    },
                ]);
            });
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.USER_PASSWORD_CHANGE_FAILED }, error);
            throw error;
        }
    }

    async userDetail(id: number): Promise<UserDetailDto> {
        const row = await this.usersRepository.findUserDetail(this.db, id);
        if (!row) throw userNotFound();
        const roles = await this.usersRepository.listSystemRoles(this.db, id);
        return {
            id: row.id,
            name: row.name,
            username: row.username,
            email: row.email,
            mobile: row.mobile,
            status: row.status,
            systemRoleIds: activeRoleIds(roles),
        };
    }

    async setPassword(userId: number, password: string, actorId: number): Promise<void> {
        await this.changePassword(userId, await bcrypt.hash(password, PASSWORD_HASH_ROUNDS), actorId);
    }

    async updateUser(id: number, update: UserUpdate, actorId: number): Promise<UserDetailDto> {
        try {
            await this.db.transaction(async () => {
                const before = await this.userDetail(id);
                const clashes = await this.usersRepository.findIdentifierClashes(
                    this.db,
                    id,
                    update.username,
                    update.email,
                    update.mobile,
                );
                if (
                    update.username &&
                    clashes.some((row) => row.username?.toLowerCase() === update.username?.toLowerCase())
                ) {
                    throw new ConflictException('This username is already taken.', 'USERNAME_TAKEN');
                }
                if (clashes.some((row) => row.email?.toLowerCase() === update.email.toLowerCase())) {
                    throw new ConflictException('This email is already in use.', 'EMAIL_TAKEN');
                }
                if (clashes.some((row) => row.mobile === update.mobile)) {
                    throw new ConflictException('This mobile number is already in use.', 'MOBILE_TAKEN');
                }
                const losesOwnAccess =
                    id === actorId &&
                    before.systemRoleIds.includes(MetaRole.SUPER_ADMIN) &&
                    !update.systemRoleIds.includes(MetaRole.SUPER_ADMIN);
                if (losesOwnAccess) {
                    throw new ValidationException(
                        'You cannot remove your own Super Admin role.',
                        [],
                        'OWN_ACCESS_CHANGE',
                    );
                }
                await this.usersRepository.updateUser(this.db, id, update, actorId);
                const added = update.systemRoleIds.filter((roleId) => !before.systemRoleIds.includes(roleId));
                const removed = before.systemRoleIds.filter((roleId) => !update.systemRoleIds.includes(roleId));
                for (const roleId of added) {
                    await this.usersRepository.setUserRoleStatus(this.db, id, roleId, UserRoleStatus.ACTIVE, actorId);
                }
                for (const roleId of removed) {
                    await this.usersRepository.setUserRoleStatus(this.db, id, roleId, UserRoleStatus.INACTIVE, actorId);
                }
                await this.auditService.record({
                    action: AuditAction.USER_UPDATED,
                    entityType: AuditEntity.USER,
                    entityId: id,
                    changes: changesBetween(before, update),
                    details: { systemRolesAdded: added, systemRolesRemoved: removed },
                });
            });
        } catch (error) {
            await this.auditService.recordFailure(
                { action: AuditAction.USER_UPDATE_FAILED, entityType: AuditEntity.USER, entityId: id },
                error,
            );
            throw error;
        }
        return this.userDetail(id);
    }

    async setStatus(id: number, status: UserStatusCode, actorId: number): Promise<UserDetailDto> {
        try {
            await this.db.transaction(async () => {
                const before = await this.userDetail(id);
                if (id === actorId && status !== UserStatus.ACTIVE) {
                    throw new ValidationException('You cannot deactivate yourself.', [], 'OWN_ACCESS_CHANGE');
                }
                if (before.status === status) return;
                await this.usersRepository.updateStatus(this.db, id, status, actorId);
                await this.auditService.record({
                    action: AuditAction.USER_UPDATED,
                    entityType: AuditEntity.USER,
                    entityId: id,
                    changes: { status: { from: before.status, to: status } },
                });
            });
        } catch (error) {
            await this.auditService.recordFailure(
                {
                    action: AuditAction.USER_UPDATE_FAILED,
                    entityType: AuditEntity.USER,
                    entityId: id,
                    details: { status },
                },
                error,
            );
            throw error;
        }
        return this.userDetail(id);
    }

    async createAccount(account: NewAccount, actorId: number | null): Promise<UserDetailDto> {
        const passwordHash = await bcrypt.hash(account.password, PASSWORD_HASH_ROUNDS);
        try {
            const id = await this.db.transaction(async () => {
                const created = await this.createUser({
                    name: account.name,
                    username: account.username,
                    email: account.email,
                    mobile: account.mobile,
                    passwordHash,
                });
                for (const roleId of [...new Set(account.systemRoleIds)]) {
                    await this.usersRepository.setUserRoleStatus(
                        this.db,
                        created.id,
                        roleId,
                        UserRoleStatus.ACTIVE,
                        actorId,
                    );
                }
                await this.notificationService.notify([
                    {
                        userId: created.id,
                        notificationKind: NotificationKind.ACCOUNT_CREATED,
                        entityType: AuditEntity.USER,
                        entityId: created.id,
                        clientApp: ClientApp.WEB,
                        ownerType: null,
                        ownerId: null,
                        title: 'Account created',
                        excerpt: null,
                        actorId,
                    },
                ]);
                return created.id;
            });
            return await this.userDetail(id);
        } catch (error) {
            await this.auditService.recordFailure(
                {
                    action: AuditAction.USER_CREATE_FAILED,
                    entityType: AuditEntity.USER,
                    details: { email: account.email, mobile: account.mobile },
                },
                error,
            );
            throw error;
        }
    }

    activeUserIdsWithRole(metaRoleId: number): Promise<number[]> {
        return this.usersRepository.listActiveUserIdsWithRole(this.db, metaRoleId);
    }

    async findForSignIn(identifier: SignInIdentifier): Promise<SignInUser | undefined> {
        const row = await this.usersRepository.findSignInUser(this.db, identifier);
        if (!row) return undefined;
        return {
            id: row.id,
            name: row.name,
            username: row.username,
            email: row.email,
            mobile: row.mobile,
            status: row.status,
            passwordChangedAt: row.passwordChangedAt?.toISOString() ?? null,
            passwordHash: row.passwordHash,
        };
    }

    async summary(): Promise<UsersSummaryDto> {
        const all = { search: undefined, status: undefined, metaRoleId: undefined };
        const [total, active] = await Promise.all([
            this.usersRepository.countUsers(this.db, all),
            this.usersRepository.countUsers(this.db, { ...all, status: UserStatus.ACTIVE }),
        ]);
        return { total, active };
    }

    async activeRoles(userId: number, metaRoleIds: readonly number[]): Promise<ActiveRole[]> {
        if (metaRoleIds.length === 0) return [];
        const rows = await this.usersRepository.listActiveRoles(this.db, userId, metaRoleIds);
        return rows.map((row) => ({ id: row.id, name: row.name }));
    }

    async findActiveById(id: number): Promise<UserSummary | undefined> {
        const row = await this.usersRepository.findUserById(this.db, id);
        if (!row || row.status !== UserStatus.ACTIVE) return undefined;
        return {
            id: row.id,
            name: row.name,
            username: row.username,
            email: row.email,
            mobile: row.mobile,
            status: row.status,
            passwordChangedAt: row.passwordChangedAt?.toISOString() ?? null,
        };
    }

    async pickUsers(search: string | undefined, pagination: PaginationQuery): Promise<UserPickerPage> {
        const [rows, total] = await Promise.all([
            this.usersRepository.pickUsers(this.db, search, pagination),
            this.usersRepository.countPickUsers(this.db, search),
        ]);
        return {
            items: rows.map((row) => ({
                id: row.id,
                name: row.name,
                username: row.username,
                email: row.email,
                mobile: row.mobile,
            })),
            total,
        };
    }

    async listUsers(filters: UserListFilters, pagination: PaginationQuery): Promise<UserListPage> {
        const [rows, total] = await Promise.all([
            this.usersRepository.listUsers(this.db, filters, pagination),
            this.usersRepository.countUsers(this.db, filters),
        ]);
        const roleNames = await this.usersRepository.listRoleNamesOfUsers(
            this.db,
            rows.map((row) => row.id),
        );
        const namesOf = new Map<number, string[]>();
        for (const role of roleNames) {
            namesOf.set(role.userId, [...(namesOf.get(role.userId) ?? []), role.name]);
        }
        return {
            items: rows.map((row) => toUserListItem(row, namesOf.get(row.id) ?? [])),
            total,
        };
    }

    async listRoles(filters: RoleListFilters, pagination: PaginationQuery): Promise<RoleListPage> {
        const [rows, total] = await Promise.all([
            this.usersRepository.listRoles(this.db, filters, pagination),
            this.usersRepository.countRoles(this.db, filters),
        ]);
        return { items: rows.map(toRoleListItem), total };
    }
}
