import type { UsersModuleDependencies } from './contracts/users-module.contract';
import type { UsersSeedModuleDependencies } from './contracts/users-seed-module.contract';
import type { IUsersSeedService } from './contracts/users-seed-service.contract';
import type { IUsersService } from './contracts/users-service.contract';
import { UsersController } from './controllers/users.controller';
import { UsersSeedRepository } from './repositories/users-seed.repository';
import { UsersRepository } from './repositories/users.repository';
import { createUsersRouter, type UsersGuards } from './routes/users.routes';
import { UsersSeedService } from './services/users-seed.service';
import { UsersService } from './services/users.service';

export type { UsersModuleDependencies } from './contracts/users-module.contract';
export type { IUsersService } from './contracts/users-service.contract';
export type {
    NewSignUp,
    NewUser,
    RoleListItemDto,
    SignInIdentifier,
    SignInIdentifierField,
    SignInUser,
    UserSummary,
    UserListItemDto,
    ActiveRole,
} from './dto/users.dto';
export {
    MetaRole,
    MetaRoleStatus,
    UserRoleStatus,
    UserStatus,
    type UserStatusCode,
    type MetaRoleId,
} from './types/users.types';

export type { IUsersSeedService } from './contracts/users-seed-service.contract';
export type { SeedAccount, SeededAccount, FoundSeedAccount } from './dto/users-seed.dto';

export const createUsersSeedModule = (dependencies: UsersSeedModuleDependencies) => {
    const usersSeedService: IUsersSeedService = new UsersSeedService(
        dependencies.db,
        new UsersRepository(),
        new UsersSeedRepository(),
        dependencies.auditService,
        dependencies.isProduction,
    );
    return { usersSeedService };
};

export const createUsersModule = (dependencies: UsersModuleDependencies) => {
    const usersService: IUsersService = new UsersService(
        dependencies.db,
        new UsersRepository(),
        dependencies.auditService,
        dependencies.notificationService,
    );
    const usersController = new UsersController(usersService);

    return {
        usersService,
        createRouter: (guards: UsersGuards) => createUsersRouter(usersController, guards),
    };
};
