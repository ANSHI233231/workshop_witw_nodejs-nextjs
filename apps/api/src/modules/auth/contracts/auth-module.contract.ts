import type { Database } from '../../../database/connection';
import type { IAuditService } from '../../audit';
import type { IMailService } from '../../mail';
import type { IUsersService } from '../../users';
import type { AppUrls, AuthSettings } from '../types/auth.types';

export type AuthModuleDependencies = {
    readonly db: Database;
    readonly usersService: IUsersService;
    readonly auditService: IAuditService;
    readonly mailService: IMailService;
    readonly settings: AuthSettings;
    readonly appUrls: AppUrls;
};
