import type { Database } from '../../../database/connection';
import type { IAuditService } from '../../audit';
import type { IPackageService } from '../../package';
import type { IPartnerService } from '../../partner';
import type { ISharedSafariService } from '../../shared-safari';

export type WishlistModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly packageService: IPackageService;
    readonly sharedSafariService: ISharedSafariService;
    readonly partnerService: IPartnerService;
};

export type WishlistTestDataModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly isProduction: boolean;
};
