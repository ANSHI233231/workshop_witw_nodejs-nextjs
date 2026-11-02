import type { Database } from '../../../database/connection';
import type { IAuditService } from '../../audit';
import type { MailStatusCodes } from '../types/delivery.types';

export type NotificationModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly mailStatus: MailStatusCodes;
};
