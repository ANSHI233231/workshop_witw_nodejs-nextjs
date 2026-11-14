import type { UsersDemoModuleDependencies } from './contracts/users-demo-module.contract';
import type { IUsersDemoService } from './contracts/users-demo-service.contract';
import type { UsersModuleDependencies, UsersTestDataModuleDependencies } from './contracts/users-module.contract';
import type { UsersSeedModuleDependencies } from './contracts/users-seed-module.contract';
import type { IUsersTestDataService } from './contracts/users-test-data-service.contract';
import type { IUsersSeedService } from './contracts/users-seed-service.contract';
import type { IUsersService } from './contracts/users-service.contract';
import { UsersController } from './controllers/users.controller';
import { UsersDemoRepository } from './repositories/users-demo.repository';
import { UsersSeedRepository } from './repositories/users-seed.repository';
import { UsersTestDataRepository } from './repositories/users-test-data.repository';
import { UsersRepository } from './repositories/users.repository';
import { createUsersRouter, type UsersGuards } from './routes/users.routes';
import { UsersDemoService } from './services/users-demo.service';
import { UsersSeedService } from './services/users-seed.service';
import { UsersTestDataService } from './services/users-test-data.service';
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

export type { IUsersDemoService } from './contracts/users-demo-service.contract';
export type { DemoAccount, DemoAccountState } from './dto/users-demo.dto';

export const createUsersDemoModule = (dependencies: UsersDemoModuleDependencies) => {
    const usersDemoService: IUsersDemoService = new UsersDemoService(
        dependencies.db,
        new UsersRepository(),
        new UsersDemoRepository(),
        dependencies.auditService,
        dependencies.isProduction,
    );
    return { usersDemoService };
};

export type { IUsersTestDataService } from './contracts/users-test-data-service.contract';
export type { TestAccountMarker, TestDataRow, TestDataTable, UsersTestData } from './dto/users-test-data.dto';

export const createUsersTestDataModule = (dependencies: UsersTestDataModuleDependencies) => {
    const usersTestDataService: IUsersTestDataService = new UsersTestDataService(
        dependencies.db,
        new UsersTestDataRepository(),
        dependencies.auditService,
        dependencies.isProduction,
    );
    return { usersTestDataService };
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
