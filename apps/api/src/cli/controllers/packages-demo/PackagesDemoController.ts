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
import { createPartnerDemoModule, type DemoPartner, type DemoPartnerState } from '../../../modules/partner';
import { createQuoteRequestDemoModule, type DemoPartnerNote, type DemoQuoteRequest } from '../../../modules/quote-request';
import { createUsersDemoModule, createUsersModule, MetaRole } from '../../../modules/users';
import { ConsoleController } from '../../lib/ConsoleController';

import {
    galleryLookup,
    type PackageLookups,
    packageOf,
    type PlannedGalleries,
    plannedGalleries,
    readPictures,
    requiredIst,
} from './packages-demo.build';
import {
    DEMO_GALLERIES,
    DEMO_GALLERY_PICTURES,
    DEMO_OWNED_EMAILS,
    DEMO_PARTNER_LOGOS,
    DEMO_PARTNERS,
    LEGACY_DEMO_PARTNERS,
} from './packages-demo.data';
import { DEMO_PACKAGES } from './packages-demo.packages';
import { DEMO_QUOTE_NOTES, DEMO_QUOTES } from './packages-demo.quotes';

const CONFIRM = 'confirm';

const LOGO_FOLDER = path.resolve(__dirname, '../../../../seed/packages-demo');

const ownedPartnerIds = (plans: readonly DemoPartner[], states: readonly DemoPartnerState[]): number[] =>
    states.flatMap((state) => {
        const plan = plans.find((candidate) => candidate.account.email === state.email);
        return state.partnerId !== null && plan?.business && plan.business.businessName === state.businessName ? [state.partnerId] : [];
    });

const takenByOthers = (states: readonly DemoPartnerState[]): string[] =>
    states.flatMap((state) => {
        const plan = DEMO_PARTNERS.find((candidate) => candidate.account.email === state.email);
        if (state.businessName === null || !plan) return [];
        return plan.business?.businessName === state.businessName ? [] : [`${state.email} has the partner "${state.businessName}"`];
    });

export class PackagesDemoController extends ConsoleController {
    /**
     * Adds the Safari Packages demo data for local screens: the prototype's sample partners (Active, Pending, Rejected, Inactive): Jungle Trails Safaris on the local account partner@example.in (Vivek Rao), with a "JT" logo when it has none, the others on @packages-demo.test accounts, and three website users with no request: Ananya Iyer (the local account user@example.in), Riya Sharma and Neha Singh (the Shared Safari sample accounts), each account created when missing, and the prototype's sample galleries of the two active partners (approved, in draft with a reject reason, waiting, and an approved one with changes waiting) with their photos, and the prototype's sample packages (live with a replaced version, live with a draft or a version waiting, inactive, rejected, draft, deleted with a reason, and the deactivated partner's live package) with their images and gallery copies, and the prototype's sample quote requests from the three website users (marked Hot, Cold or not marked, one made inactive) with the partners' notifications about them, e.g. "npm run cli packages-demo/add <password> confirm". The password is the demo accounts' password (8 to 72 characters). Dry run unless "confirm" is given; safe to run again; refused in production.
     */
    public async actionAdd(password?: string, confirm?: string): Promise<void> {
        if (this.refusedInProduction()) return;
        const { partnerDemoService } = this.demoModules();
        const states = await partnerDemoService.states(DEMO_PARTNERS);
        for (const state of states) {
            const account = state.hasAccount ? 'account there' : 'account to create';
            const plan = DEMO_PARTNERS.find((candidate) => candidate.account.email === state.email);
            const partner = !plan?.business ? 'website user' : state.hasPartner ? 'partner there' : 'partner to create';
            this.stdout(`  ${state.email}: ${account}, ${partner}\n`);
        }
        const conflicts = takenByOthers(states);
        for (const conflict of conflicts) this.stdout(this.ansiFormat(`  Blocked: ${conflict}; run "local-accounts/remove confirm" first.\n`, 'red'));
        const legacy = (await partnerDemoService.states(LEGACY_DEMO_PARTNERS)).filter((state) => state.hasAccount);
        if (legacy.length > 0) {
            this.stdout(
                this.ansiFormat(
                    `  Old demo accounts still there (${legacy.map((state) => state.email).join(', ')}): run "packages-demo/remove confirm" first.\n`,
                    'yellow',
                ),
            );
        }
        const planned = await this.plannedGalleries(states);
        const existing = await this.demoModules().galleryDemoService.existing(planned.galleries);
        this.stdout(
            `  galleries: ${DEMO_GALLERIES.length} in the plan, ${existing.length} there, ${planned.skipped.length} waiting for their partner or park\n`,
        );
        const packagesThere = await this.demoModules().packageDemoService.existing(DEMO_PACKAGES.map((plan) => plan.slug));
        this.stdout(`  packages: ${DEMO_PACKAGES.length} in the plan, ${packagesThere.length} there\n`);
        this.stdout(`  quote requests: ${DEMO_QUOTES.length} in the plan, with ${DEMO_QUOTE_NOTES.length} partner notifications\n`);
        if (confirm !== CONFIRM) {
            this.stdout(this.ansiFormat('Dry run: nothing written. Add the accounts\' password and "confirm" to write it.\n', 'yellow'));
            return;
        }
        if (!password) {
            this.stderr('Give the demo accounts\' password, e.g. "npm run cli packages-demo/add <password> confirm".\n');
            process.exitCode = 1;
            return;
        }
        if (conflicts.length > 0) {
            this.stderr('Nothing written: an account of the plan already has another partner (see above).\n');
            process.exitCode = 1;
            return;
        }
        const outcomes = await partnerDemoService.add(DEMO_PARTNERS, password);
        for (const outcome of outcomes) {
            const missing = outcome.missingParks.length > 0 ? ` (parks not found: ${outcome.missingParks.join(', ')})` : '';
            this.stdout(
                `  ${outcome.email} (user ${outcome.userId}): account ${outcome.accountCreated ? 'created' : 'kept'}, partner ${
                    outcome.partnerId === null ? 'none' : `${outcome.partnerId} ${outcome.partnerCreated ? 'created' : 'kept'}`
                }${missing}\n`,
            );
        }
        const accounts = outcomes.filter((outcome) => outcome.accountCreated).length;
        const partners = outcomes.filter((outcome) => outcome.partnerCreated).length;
        await this.addLogos(await partnerDemoService.states(DEMO_PARTNERS));
        const galleries = await this.addGalleries(await partnerDemoService.states(DEMO_PARTNERS));
        const packages = await this.addPackages(await partnerDemoService.states(DEMO_PARTNERS));
        const quotes = await this.addQuoteRequests(await partnerDemoService.states(DEMO_PARTNERS));
        this.stdout(
            this.ansiFormat(
                `Done: ${accounts} accounts, ${partners} partners, ${galleries} galleries, ${packages} packages and ${quotes} quote requests created.\n`,
                'green',
            ),
        );
        this.stdout('Sign in with any of the emails above and the password you gave.\n');
    }

    /**
     * Removes the Safari Packages demo data: the demo partners (also Jungle Trails Safaris of partner@example.in, whose Partner role is taken back) with their parks, logos, galleries and photos, packages with every version and the quote requests sent to them with their notifications, and the @packages-demo.test accounts, e.g. "npm run cli packages-demo/remove confirm". Keeps the local accounts and the Shared Safari sample accounts it uses; a partner of another name on partner@example.in is never touched. Dry run unless "confirm" is given; refused in production.
     */
    public async actionRemove(confirm?: string): Promise<void> {
        if (this.refusedInProduction()) return;
        const { partnerDemoService, galleryDemoService, usersDemoService } = this.demoModules();
        const write = confirm === CONFIRM;
        const states = await partnerDemoService.states(DEMO_PARTNERS);
        const legacy = await partnerDemoService.states(LEGACY_DEMO_PARTNERS);
        const partnerIds = [...ownedPartnerIds(DEMO_PARTNERS, states), ...ownedPartnerIds(LEGACY_DEMO_PARTNERS, legacy)];
        const owned = await usersDemoService.findAccounts(DEMO_OWNED_EMAILS);
        const quotes = await this.demoModules().quoteRequestDemoService.remove(
            partnerIds,
            owned.map((row) => row.id),
            write,
        );
        const packages = await this.demoModules().packageDemoService.remove(partnerIds, write);
        const galleries = await galleryDemoService.remove(partnerIds, write);
        const counts = await partnerDemoService.remove({ partnerIds, accountEmails: DEMO_OWNED_EMAILS }, write);
        const verb = write ? 'Removed' : 'Would remove';
        this.stdout(
            `${verb}: ${quotes} quote requests, ${packages} packages, ${galleries} galleries, ${counts.partners} partners and ${counts.accounts} accounts (${
                owned.map((row) => row.email).join(', ') || 'none'
            }).\n`,
        );
        this.stdout('Kept: the local accounts (partner@example.in, user@example.in) and the Shared Safari sample accounts it uses.\n');
        if (!write) this.stdout(this.ansiFormat('Dry run: nothing removed. Add "confirm" to remove it.\n', 'yellow'));
    }

    private async addLogos(states: readonly DemoPartnerState[]): Promise<void> {
        const { partnerDemoService } = this.demoModules();
        for (const logo of DEMO_PARTNER_LOGOS) {
            const state = states.find((candidate) => candidate.email === logo.ownerEmail);
            if (!state || state.partnerId === null) continue;
            const added = await partnerDemoService.setLogo(state.partnerId, await readFile(path.join(LOGO_FOLDER, logo.file)));
            this.stdout(`  logo of ${state.businessName ?? state.email}: ${added ? 'added' : 'kept'}\n`);
        }
    }

    private async addGalleries(states: readonly DemoPartnerState[]): Promise<number> {
        const { galleryDemoService, usersService } = this.demoModules();
        const planned = await this.plannedGalleries(states);
        const pictures = await readPictures(DEMO_GALLERY_PICTURES);
        const adminId = (await usersService.activeUserIdsWithRole(MetaRole.SUPER_ADMIN))[0] ?? null;
        const outcomes = await galleryDemoService.add(planned.galleries, pictures, adminId);
        for (const outcome of outcomes) {
            this.stdout(`  gallery ${outcome.galleryId} ${outcome.title}: ${outcome.created ? 'created' : 'kept'}\n`);
        }
        for (const title of planned.skipped) this.stdout(`  gallery ${title}: skipped (partner or park not found)\n`);
        return outcomes.filter((outcome) => outcome.created).length;
    }

    private async addPackages(states: readonly DemoPartnerState[]): Promise<number> {
        const { packageDemoService, galleryDemoService, usersService, parkService } = this.demoModules();
        const adminId = (await usersService.activeUserIdsWithRole(MetaRole.SUPER_ADMIN))[0];
        if (adminId === undefined) {
            this.stdout('  packages: skipped (no active Super Admin to record the approvals)\n');
            return 0;
        }
        const partnerIds = states.flatMap((state) => (state.partnerId === null ? [] : [state.partnerId]));
        const refs = await galleryDemoService.galleryIdsOf(partnerIds);
        const lookups: PackageLookups = {
            states,
            parkIdOf: new Map((await parkService.listActive()).map((park) => [park.name, park.id])),
            galleryOf: galleryLookup(refs, DEMO_GALLERIES),
        };
        const packages: DemoPackage[] = [];
        for (const plan of DEMO_PACKAGES) {
            const demo = packageOf(plan, lookups);
            if (demo) packages.push(demo);
            else this.stdout(`  package ${plan.slug}: skipped (partner or park not found)\n`);
        }
        const pictures = await readPictures(DEMO_GALLERY_PICTURES);
        const outcomes = await packageDemoService.add(packages, pictures, adminId);
        for (const outcome of outcomes) {
            this.stdout(`  package ${outcome.packageId} ${outcome.slug}: ${outcome.created ? 'created' : 'kept'}\n`);
        }
        return outcomes.filter((outcome) => outcome.created).length;
    }

    private async addQuoteRequests(states: readonly DemoPartnerState[]): Promise<number> {
        const { quoteRequestDemoService, usersService } = this.demoModules();
        const adminId = (await usersService.activeUserIdsWithRole(MetaRole.SUPER_ADMIN))[0];
        const quotes: DemoQuoteRequest[] = [];
        for (const plan of DEMO_QUOTES) {
            const state = states.find((candidate) => candidate.email === plan.senderEmail);
            const account = DEMO_PARTNERS.find((partner) => partner.account.email === plan.senderEmail)?.account;
            if (!state || state.userId === null || !account) {
                this.stdout(`  quote request ${plan.key}: skipped (sender not found)\n`);
                continue;
            }
            const { senderEmail: _senderEmail, sentAtIst, ...rest } = plan;
            quotes.push({ ...rest, sender: { userId: state.userId, ...account }, sentAt: requiredIst(sentAtIst) });
        }
        const notes: DemoPartnerNote[] = DEMO_QUOTE_NOTES.flatMap((note): DemoPartnerNote[] => {
            const at = requiredIst(note.atIst);
            if (note.kind === 'received') return [{ kind: 'received', quoteKey: note.quoteKey, at, isRead: note.isRead }];
            if (adminId === undefined) return [];
            return [{ kind: 'adminMessage', quoteKey: note.quoteKey, message: note.message, adminId, at, isRead: note.isRead }];
        });
        const result = await quoteRequestDemoService.add(quotes, notes);
        for (const outcome of result.quotes) {
            const state = outcome.skipped ?? (outcome.created ? 'created' : 'kept');
            this.stdout(`  quote request ${outcome.quoteRequestId ?? '-'} ${outcome.key}: ${state}\n`);
        }
        this.stdout(`  partner notifications: ${result.notes} written\n`);
        return result.quotes.filter((outcome) => outcome.created).length;
    }

    private async plannedGalleries(states: readonly DemoPartnerState[]): Promise<PlannedGalleries> {
        const parkIdOf = new Map((await this.demoModules().parkService.listActive()).map((park) => [park.name, park.id]));
        return plannedGalleries(DEMO_GALLERIES, states, parkIdOf);
    }

    private refusedInProduction(): boolean {
        if (!config.isProduction) return false;
        this.stderr('Demo data is never written in production (NODE_ENV=production).\n');
        process.exitCode = 1;
        return true;
    }

    private demoModules() {
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
        const { quoteRequestDemoService } = createQuoteRequestDemoModule({
            db: this.db,
            auditService,
            notificationSeedService,
            isProduction,
        });
        return {
            partnerDemoService,
            galleryDemoService,
            packageDemoService,
            quoteRequestDemoService,
            parkService,
            usersService,
            usersDemoService,
        };
    }
}

export default PackagesDemoController;
