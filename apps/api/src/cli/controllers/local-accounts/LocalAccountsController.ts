import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { config } from '../../../config';
import { createFileStorage } from '../../../infrastructure/storage';
import { createAuditModule } from '../../../modules/audit';
import { createGalleryDemoModule } from '../../../modules/gallery';
import { MailLogStatus } from '../../../modules/mail';
import { createNotificationModule, createNotificationSeedModule } from '../../../modules/notification';
import { createPackageDemoModule, type DemoPackage } from '../../../modules/package';
import { createParkModule } from '../../../modules/park';
import { createPartnerDemoModule, type DemoPartnerState } from '../../../modules/partner';
import { createQuoteRequestDemoModule, type DemoQuoteRequest } from '../../../modules/quote-request';
import { createUsersDemoModule, createUsersModule, MetaRole } from '../../../modules/users';
import { ConsoleController } from '../../lib/ConsoleController';
import { galleryLookup, packageOf, plannedGalleries, readPictures, requiredIst } from '../packages-demo/packages-demo.build';

import {
    LOCAL_EMAILS,
    LOCAL_GALLERIES,
    LOCAL_GALLERY_PICTURES,
    LOCAL_PACKAGES,
    LOCAL_PARTNER_LOGO,
    LOCAL_PARTNERS,
    LOCAL_QUOTES,
    LOCAL_SUPER_ADMIN,
} from './local-accounts.data';

const CONFIRM = 'confirm';

const LOGO_FOLDER = path.resolve(__dirname, '../../../../seed/local-accounts');

export class LocalAccountsController extends ConsoleController {
    /**
     * Adds the local test accounts, all with the password you give: anshika@example.in (Super Admin, signs in to the console), partner@example.in (an active partner "Tiger Song Safaris" with a logo, three parks, one approved gallery and two live packages; signs in to the partner portal and the website) and user@example.in (a website user with one quote request to that partner), e.g. "npm run cli local-accounts/add <password> confirm". The password (8 to 72 characters) is only taken from the command; an account already there keeps its password. Dry run unless "confirm" is given; safe to run again; refused in production.
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
            const partner = outcome.partnerId === null ? '' : `, partner ${outcome.partnerId} ${outcome.partnerCreated ? 'created' : 'kept'}`;
            const missing = outcome.missingParks.length > 0 ? ` (parks not found: ${outcome.missingParks.join(', ')})` : '';
            this.stdout(`  ${outcome.email} (user ${outcome.userId}): account ${outcome.accountCreated ? 'created' : 'kept'}${partner}${missing}\n`);
        }
        const states = await modules.partnerDemoService.states(LOCAL_PARTNERS);
        await this.addLogo(states);
        await this.addGalleries(states);
        await this.addPackages(states);
        await this.addQuoteRequests(states);
        this.stdout(this.ansiFormat('Done. Sign in with the emails above and the password you gave.\n', 'green'));
    }

    /**
     * Removes the local test accounts (anshika@example.in, partner@example.in, user@example.in) and only their own rows: the partner with its logo, gallery and packages, and the quote requests sent by or to them with their notifications, e.g. "npm run cli local-accounts/remove confirm". Touches no other account. Dry run unless "confirm" is given; refused in production.
     */
    public async actionRemove(confirm?: string): Promise<void> {
        if (this.refusedInProduction()) return;
        const modules = this.modules();
        const write = confirm === CONFIRM;
        const states = await modules.partnerDemoService.states(LOCAL_PARTNERS);
        const partnerIds = states.flatMap((state) => (state.partnerId === null ? [] : [state.partnerId]));
        const userIds = states.flatMap((state) => (state.userId === null ? [] : [state.userId]));
        const quotes = await modules.quoteRequestDemoService.remove(partnerIds, userIds, write);
        const packages = await modules.packageDemoService.remove(partnerIds, write);
        const galleries = await modules.galleryDemoService.remove(partnerIds, write);
        const counts = await modules.partnerDemoService.remove(
            LOCAL_PARTNERS.map((partner) => partner.account.email),
            write,
        );
        const admins = write
            ? await modules.usersDemoService.removeAccounts([LOCAL_SUPER_ADMIN.email], [LOCAL_SUPER_ADMIN.email])
            : (await modules.usersDemoService.findAccounts([LOCAL_SUPER_ADMIN.email])).length;
        const verb = write ? 'Removed' : 'Would remove';
        this.stdout(
            `${verb}: ${quotes} quote requests, ${packages} packages, ${galleries} galleries, ${counts.partners} partners and ${
                counts.accounts + admins
            } accounts (${LOCAL_EMAILS.join(', ')}).\n`,
        );
        if (!write) this.stdout(this.ansiFormat('Dry run: nothing removed. Add "confirm" to remove it.\n', 'yellow'));
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

    private async addLogo(states: readonly DemoPartnerState[]): Promise<void> {
        const content = await readFile(path.join(LOGO_FOLDER, LOCAL_PARTNER_LOGO));
        for (const state of states) {
            if (state.partnerId === null) continue;
            const added = await this.modules().partnerDemoService.setLogo(state.partnerId, content);
            this.stdout(`  logo of partner ${state.partnerId}: ${added ? 'added' : 'kept'}\n`);
        }
    }

    private async addGalleries(states: readonly DemoPartnerState[]): Promise<void> {
        const { galleryDemoService, usersService } = this.modules();
        const planned = plannedGalleries(LOCAL_GALLERIES, states, await this.parkIdOf());
        const adminId = (await usersService.activeUserIdsWithRole(MetaRole.SUPER_ADMIN))[0] ?? null;
        const outcomes = await galleryDemoService.add(planned.galleries, await readPictures(LOCAL_GALLERY_PICTURES), adminId);
        for (const outcome of outcomes) this.stdout(`  gallery ${outcome.galleryId} ${outcome.title}: ${outcome.created ? 'created' : 'kept'}\n`);
        for (const title of planned.skipped) this.stdout(`  gallery ${title}: skipped (partner or park not found)\n`);
    }

    private async addPackages(states: readonly DemoPartnerState[]): Promise<void> {
        const { packageDemoService, galleryDemoService, usersService } = this.modules();
        const adminId = (await usersService.activeUserIdsWithRole(MetaRole.SUPER_ADMIN))[0];
        if (adminId === undefined) {
            this.stdout('  packages: skipped (no active Super Admin to record the approvals)\n');
            return;
        }
        const partnerIds = states.flatMap((state) => (state.partnerId === null ? [] : [state.partnerId]));
        const refs = await galleryDemoService.galleryIdsOf(partnerIds);
        const lookups = { states, parkIdOf: await this.parkIdOf(), galleryOf: galleryLookup(refs, LOCAL_GALLERIES) };
        const packages: DemoPackage[] = [];
        for (const plan of LOCAL_PACKAGES) {
            const demo = packageOf(plan, lookups);
            if (demo) packages.push(demo);
            else this.stdout(`  package ${plan.slug}: skipped (partner or park not found)\n`);
        }
        const outcomes = await packageDemoService.add(packages, await readPictures(LOCAL_GALLERY_PICTURES), adminId);
        for (const outcome of outcomes) this.stdout(`  package ${outcome.packageId} ${outcome.slug}: ${outcome.created ? 'created' : 'kept'}\n`);
    }

    private async addQuoteRequests(states: readonly DemoPartnerState[]): Promise<void> {
        const quotes: DemoQuoteRequest[] = [];
        for (const plan of LOCAL_QUOTES) {
            const state = states.find((candidate) => candidate.email === plan.senderEmail);
            const account = LOCAL_PARTNERS.find((partner) => partner.account.email === plan.senderEmail)?.account;
            if (!state || state.userId === null || !account) {
                this.stdout(`  quote request ${plan.key}: skipped (sender not found)\n`);
                continue;
            }
            const { senderEmail: _senderEmail, sentAtIst, ...rest } = plan;
            quotes.push({ ...rest, sender: { userId: state.userId, ...account }, sentAt: requiredIst(sentAtIst) });
        }
        const notes = LOCAL_QUOTES.map((plan) => ({ kind: 'received' as const, quoteKey: plan.key, at: requiredIst(plan.sentAtIst), isRead: false }));
        const result = await this.modules().quoteRequestDemoService.add(quotes, notes);
        for (const outcome of result.quotes) {
            const state = outcome.skipped ?? (outcome.created ? 'created' : 'kept');
            this.stdout(`  quote request ${outcome.quoteRequestId ?? '-'} ${outcome.key}: ${state}\n`);
        }
    }

    private async parkIdOf(): Promise<ReadonlyMap<string, number>> {
        return new Map((await this.modules().parkService.listActive()).map((park) => [park.name, park.id]));
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
        return {
            usersService,
            usersDemoService,
            partnerDemoService,
            galleryDemoService,
            packageDemoService,
            quoteRequestDemoService,
            parkService,
        };
    }
}

export default LocalAccountsController;
