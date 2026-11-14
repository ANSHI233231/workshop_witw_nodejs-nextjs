import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import type { IAuditService } from '../../audit';
import type { IAuthService, SessionCookies } from '../../auth';
import type { IParkService } from '../../park';
import type { IUsersDemoService, IUsersService } from '../../users';

export type PartnerAccountSignUp = Pick<IAuthService, 'signUpWith'>;

export type PartnerSessionCookies = SessionCookies;

export type PartnerModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly usersService: IUsersService;
    readonly parkService: IParkService;
    readonly fileStorage: IFileStorage;
    readonly accountSignUp: PartnerAccountSignUp;
    readonly sessionCookies: PartnerSessionCookies;
};

export type PartnerDemoModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly usersService: IUsersService;
    readonly usersDemoService: IUsersDemoService;
    readonly parkService: IParkService;
    readonly fileStorage: IFileStorage;
    readonly isProduction: boolean;
};

export type PartnerTestDataModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly fileStorage: IFileStorage;
    readonly isProduction: boolean;
};
