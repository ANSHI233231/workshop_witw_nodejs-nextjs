import { ClientApp } from '../../../core/context';
import { AuditEntity } from '../../audit';
import { type INotificationService, NotificationKind } from '../../notification';
import { type IUsersService, MetaRole } from '../../users';

export type FailedRun = { readonly id: number; readonly command: string; readonly title: string | null };

export class JobFailureNotifier {
    constructor(
        private readonly notificationService: INotificationService,
        private readonly usersService: IUsersService,
    ) {}

    async runFailed(run: FailedRun, reason: string): Promise<void> {
        const superAdminIds = await this.usersService.activeUserIdsWithRole(MetaRole.SUPER_ADMIN);
        await this.notificationService.notify(
            superAdminIds.map((userId) => ({
                userId,
                notificationKind: NotificationKind.JOB_FAILED,
                entityType: AuditEntity.JOB_RUN,
                entityId: run.id,
                clientApp: ClientApp.MANAGE,
                ownerType: null,
                ownerId: null,
                title: run.title ?? run.command,
                excerpt: reason,
                actorId: null,
            })),
        );
    }
}
