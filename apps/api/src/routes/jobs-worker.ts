import type { Database } from '../database/connection';
import type { ICommandRunner } from '../infrastructure/process';
import { createAuditModule } from '../modules/audit';
import { createJobsModule, type JobWorkerSettings } from '../modules/jobs';
import { MailLogStatus } from '../modules/mail';
import { createNotificationModule } from '../modules/notification';
import { createUsersModule } from '../modules/users';

export const createJobsWorker = (db: Database, commandRunner: ICommandRunner, settings: JobWorkerSettings) => {
    const { auditService } = createAuditModule({ db });
    const { notificationService } = createNotificationModule({
        db,
        auditService,
        mailStatus: { sent: MailLogStatus.SENT, failed: MailLogStatus.FAILED },
    });
    const { usersService } = createUsersModule({ db, auditService, notificationService });
    return createJobsModule({ db, auditService, commandRunner, notificationService, usersService }).createWorker(
        settings,
    );
};
