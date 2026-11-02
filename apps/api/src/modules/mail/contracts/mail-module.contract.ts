import type { Database } from '../../../database/connection';
import type { IEmailSender } from '../../../infrastructure/email';
import type { IAuditService } from '../../audit';

export type MailModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly emailSender: IEmailSender;
    readonly mailFrom: string;
};
