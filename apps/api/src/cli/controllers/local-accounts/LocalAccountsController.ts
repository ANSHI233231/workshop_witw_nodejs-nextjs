import { config } from '../../../config';
import { createFileStorage } from '../../../infrastructure/storage';
import { createAuditModule } from '../../../modules/audit';
import { createGalleryDemoModule } from '../../../modules/gallery';
import { MailLogStatus } from '../../../modules/mail';
import { createNotificationModule, createNotificationSeedModule } from '../../../modules/notification';
import { createPackageDemoModule } from '../../../modules/package';
import { createParkModule } from '../../../modules/park';
import { createPartnerDemoModule } from '../../../modules/partner';
import { createQuoteRequestDemoModule } from '../../../modules/quote-request';
import { createSharedSafariSeedModule } from '../../../modules/shared-safari';
import { createUsersDemoModule, createUsersModule, MetaRole } from '../../../modules/users';
import { ConsoleController } from '../../lib/ConsoleController';
import { DEMO_PACKAGES } from '../packages-demo/packages-demo.packages';
import { PROTOTYPE_SAFARIS } from '../seed/shared-safari-seed.data';

import { LOCAL_ACCOUNT_EMAILS, LOCAL_EMAILS, LOCAL_PARTNERS, LOCAL_SUPER_ADMIN } from './local-accounts.data';

const CONFIRM = 'confirm';

const SAMPLE_ORDER = 'Run "packages-demo/remove confirm" and "seed/shared-safari-remove confirm" first.';

export class LocalAccountsController extends ConsoleController {
    /**
     * Adds the local test accounts, all with the password you give: anshika@example.in (Super Admin, signs in to the console), partner@example.in (Vivek Rao: packages-demo/add makes it the partner Jungle Trails Safaris) and user@example.in (Ananya Iyer: seed/shared-safari makes her the host of her sample safaris, packages-demo/add sends her quote requests), e.g. "npm run cli local-accounts/add <password> confirm". Only the accounts: the sample commands add their data and may run before or after it. The password (8 to 72 characters) is only taken from the command; an account already there keeps its password and name. Dry run unless "confirm" is given; safe to run again; refused in production.
     */
    public async actionAdd(password?: string, confirm?: string): Promise<void> {
        if (this.refusedInProduction()) return;
        const modules = this.modules();
        const found = await modules.usersDemoService.findAccounts(LOCAL_EMAILS);
        for (const email of LOCAL_EMAILS) {
            this.stdout(`  ${email}: ${found.some((row) => row.email.toLowerCase() === email) ? 'there' : 'to create'}\n`);
        }
        if (confirm !== CONFIRM) {
            this.stdout(this.ansiFormat('Dry run: nothing written. Add the accounts\' password and "confirm" to write it.\n', 'yellow'));
            return;
        }
        if (!password) {
            this.stderr('Give the accounts\' password, e.g. "npm run cli local-accounts/add <password> confirm".\n');
            process.exitCode = 1;
            return;
        }
        await this.addSuperAdmin(password);
        const outcomes = await modules.partnerDemoService.add(LOCAL_PARTNERS, password);
        for (const outcome of outcomes) {
            this.stdout(`  ${outcome.email} (user ${outcome.userId}): account ${outcome.accountCreated ? 'created' : 'kept'}\n`);
        }
        this.stdout(this.ansiFormat('Done. Sign in with the emails above and the password you gave.\n', 'green'));
    }

    /**
     * Removes the local test accounts (anshika@example.in, partner@example.in, user@example.in) and whatever is still their own: a partner of partner@example.in with its logo, galleries and packages, and the quote requests sent by or to them with their notifications, e.g. "npm run cli local-accounts/remove confirm". Refused while the sample data that uses these accounts is there (run packages-demo/remove and seed/shared-safari-remove first). Touches no other account. Dry run unless "confirm" is given; refused in production.
     */
    public async actionRemove(confirm?: string): Promise<void> {
        if (this.refusedInProduction()) return;
        const modules = this.modules();
        const write = confirm === CONFIRM;
        const blockers = await this.sampleDataThere();
        if (blockers.length > 0) {
            this.stdout(`Blocked: ${blockers.join('; ')}. ${SAMPLE_ORDER}\n`);
            if (write) process.exitCode = 1;
            return;
        }
        const states = await modules.partnerDemoService.states(LOCAL_PARTNERS);
        const partnerIds = states.flatMap((state) => (state.partnerId === null ? [] : [state.partnerId]));
        const userIds = states.flatMap((state) => (state.userId === null ? [] : [state.userId]));
        const quotes = await modules.quoteRequestDemoService.remove(partnerIds, userIds, write);
        const packages = await modules.packageDemoService.remove(partnerIds, write);
        const galleries = await modules.galleryDemoService.remove(partnerIds, write);
        const counts = await modules.partnerDemoService.remove({ partnerIds, accountEmails: LOCAL_ACCOUNT_EMAILS }, write);
        const admins = write
            ? await modules.usersDemoService.removeAccounts([LOCAL_SUPER_ADMIN.email], [LOCAL_SUPER_ADMIN.email])
            : (await modules.usersDemoService.findAccounts([LOCAL_SUPER_ADMIN.email])).length;
        const verb = write ? 'Removed' : 'Would remove';
        const businesses = states.flatMap((state) => (state.businessName === null ? [] : [state.businessName]));
        this.stdout(
            `${verb}: ${quotes} quote requests, ${packages} packages, ${galleries} galleries, ${counts.partners} partners${
                businesses.length > 0 ? ` (${businesses.join(', ')})` : ''
            } and ${counts.accounts + admins} accounts (${LOCAL_EMAILS.join(', ')}).\n`,
        );
        if (!write) this.stdout(this.ansiFormat('Dry run: nothing removed. Add "confirm" to remove it.\n', 'yellow'));
    }

    private async sampleDataThere(): Promise<string[]> {
        const { sharedSafariSeedService, packageDemoService } = this.modules();
        const safaris = await sharedSafariSeedService.takenSlugs(PROTOTYPE_SAFARIS.map((safari) => safari.slug));
        const packages = await packageDemoService.existing(DEMO_PACKAGES.map((plan) => plan.slug));
        return [
            ...(packages.length > 0 ? [`${packages.length} packages-demo packages are there`] : []),
            ...(safaris.length > 0 ? [`${safaris.length} sample shared safaris are there`] : []),
        ];
    }

    private async addSuperAdmin(password: string): Promise<void> {
        const { usersDemoService, usersService } = this.modules();
        const [found] = await usersDemoService.findAccounts([LOCAL_SUPER_ADMIN.email]);
        if (found) {
            this.stdout(`  ${LOCAL_SUPER_ADMIN.email} (user ${found.id}): account kept\n`);
            return;
        }
        const user = await usersService.createAccount(
            { ...LOCAL_SUPER_ADMIN, username: null, systemRoleIds: [MetaRole.SUPER_ADMIN], password },
            null,
        );
        this.stdout(`  ${LOCAL_SUPER_ADMIN.email} (user ${user.id}): Super Admin created\n`);
    }

    private refusedInProduction(): boolean {
        if (!config.isProduction) return false;
        this.stderr('Local test accounts are never written in production (NODE_ENV=production).\n');
        process.exitCode = 1;
        return true;
    }

    private modules() {
        const isProduction = config.isProduction;
        const { auditService } = createAuditModule({ db: this.db });
        const { notificationService } = createNotificationModule({
            db: this.db,
            auditService,
            mailStatus: { sent: MailLogStatus.SENT, failed: MailLogStatus.FAILED },
        });
        const { usersService } = createUsersModule({ db: this.db, auditService, notificationService });
        const { usersDemoService } = createUsersDemoModule({ db: this.db, auditService, isProduction });
        const fileStorage = createFileStorage(config.storage);
        const { parkService } = createParkModule({ db: this.db, auditService, fileStorage });
        const { partnerDemoService } = createPartnerDemoModule({
            db: this.db,
            auditService,
            usersService,
            usersDemoService,
            parkService,
            fileStorage,
            isProduction,
        });
        const { galleryDemoService } = createGalleryDemoModule({ db: this.db, auditService, fileStorage, isProduction });
        const { packageDemoService } = createPackageDemoModule({ db: this.db, auditService, fileStorage, isProduction });
        const { notificationSeedService } = createNotificationSeedModule({ db: this.db, isProduction });
        const { quoteRequestDemoService } = createQuoteRequestDemoModule({ db: this.db, auditService, notificationSeedService, isProduction });
        const { sharedSafariSeedService } = createSharedSafariSeedModule({
            db: this.db,
            auditService,
            notificationSeedService,
            fileStorage,
            isProduction,
        });
        return {
            usersService,
            usersDemoService,
            partnerDemoService,
            galleryDemoService,
            packageDemoService,
            quoteRequestDemoService,
            sharedSafariSeedService,
        };
    }
}

export default LocalAccountsController;
