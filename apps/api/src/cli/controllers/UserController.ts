import { randomBytes } from 'node:crypto';

import { createAuditModule } from '../../modules/audit';
import { MailLogStatus } from '../../modules/mail';
import { createNotificationModule } from '../../modules/notification';
import { createUsersModule, MetaRole } from '../../modules/users';
import { ConsoleController } from '../lib/ConsoleController';

const PASSWORD_BYTES = 12;

export class UserController extends ConsoleController {
    /**
     * Creates a Super Admin with a random password, printed once, e.g. "npm run cli user/create-super-admin "Asha Rao" asha@example.com 9876543210 confirm". Dry run unless "confirm" is given. Change the password after the first sign-in.
     */
    public async actionCreateSuperAdmin(name?: string, email?: string, mobile?: string, confirm?: string): Promise<void> {
        if (!name || !email || !mobile) {
            this.stderr('Give a name, an email and a 10-digit mobile number, e.g. "npm run cli user/create-super-admin "Asha Rao" asha@example.com 9876543210".\n');
            process.exitCode = 1;
            return;
        }
        if (confirm !== 'confirm') {
            this.stdout(`Would create Super Admin "${name}" (${email}, ${mobile}).\n`);
            this.stdout(this.ansiFormat('Dry run: nothing written. Add "confirm" to create it.\n', 'yellow'));
            return;
        }
        const { auditService } = createAuditModule({ db: this.db });
        const { notificationService } = createNotificationModule({
            db: this.db,
            auditService,
            mailStatus: { sent: MailLogStatus.SENT, failed: MailLogStatus.FAILED },
        });
        const { usersService } = createUsersModule({ db: this.db, auditService, notificationService });
        const password = randomBytes(PASSWORD_BYTES).toString('base64url');
        const user = await usersService.createAccount(
            { name, username: null, email, mobile, systemRoleIds: [MetaRole.SUPER_ADMIN], password },
            null,
        );
        this.stdout(`Created Super Admin "${user.name}" (user ${user.id}).\n`);
        this.stdout(this.ansiFormat(`Password (shown once): ${password}\n`, 'green'));
    }
}

export default UserController;
