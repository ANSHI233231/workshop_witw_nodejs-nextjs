import { ClientApp, type ClientAppCode } from '../../core/context';
import { createAuditModule } from '../../modules/audit';
import { MailLogStatus } from '../../modules/mail';
import { createNotificationModule } from '../../modules/notification';
import { createUsersModule } from '../../modules/users';
import { ConsoleController } from '../lib/ConsoleController';

const APPS: Readonly<Record<string, ClientAppCode>> = { manage: ClientApp.MANAGE, web: ClientApp.WEB };

const DEFAULT_MESSAGE = 'Notifications are working.';

export class NotificationController extends ConsoleController {
    /**
     * Sends a test notification to one user in one app, e.g. "npm run cli notification/send-test 1 web confirm" (app: manage or web). Dry run unless "confirm" is given.
     */
    public async actionSendTest(userId?: string, app?: string, confirm?: string): Promise<void> {
        const id = Number(userId);
        const clientApp = app ? APPS[app.toLowerCase()] : undefined;
        if (!Number.isInteger(id) || id <= 0 || clientApp === undefined) {
            this.stderr('Give a user id and an app (manage or web), e.g. "npm run cli notification/send-test 1 web".\n');
            process.exitCode = 1;
            return;
        }
        const { auditService } = createAuditModule({ db: this.db });
        const { notificationService } = createNotificationModule({
            db: this.db,
            auditService,
            mailStatus: { sent: MailLogStatus.SENT, failed: MailLogStatus.FAILED },
        });
        const { usersService } = createUsersModule({ db: this.db, auditService, notificationService });
        const user = await usersService.findActiveById(id);
        if (!user) {
            this.stderr(`No active user with id ${id}.\n`);
            process.exitCode = 1;
            return;
        }
        if (confirm !== 'confirm') {
            this.stdout(`Would send a test notification to ${user.name} (user ${id}) in ${app}.\n`);
            this.stdout(this.ansiFormat('Dry run: nothing written. Add "confirm" to send it.\n', 'yellow'));
            return;
        }
        await notificationService.sendTest({ userId: id, clientApp, message: DEFAULT_MESSAGE, actorId: null });
        this.stdout(`Sent a test notification to ${user.name} (user ${id}) in ${app}.\n`);
    }
}

export default NotificationController;
