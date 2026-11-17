import { readFileSync } from 'node:fs';
import path from 'node:path';

import { config } from '../../../config';
import { createFileStorage } from '../../../infrastructure/storage';
import { createAuditModule } from '../../../modules/audit';
import { MailLogStatus } from '../../../modules/mail';
import { createNotificationModule, createNotificationSeedModule } from '../../../modules/notification';
import { createPackageDemoModule } from '../../../modules/package';
import { createSharedSafariSeedModule } from '../../../modules/shared-safari';
import { createUsersModule, createUsersSeedModule, MetaRole } from '../../../modules/users';
import { ConsoleController } from '../../lib/ConsoleController';
import { isLocalEmail } from '../local-accounts/local-accounts.data';
import { DEMO_PARTNERS } from '../packages-demo/packages-demo.data';
import { DEMO_PACKAGES } from '../packages-demo/packages-demo.packages';

import {
    LEGACY_SEED_EMAILS,
    PROTOTYPE_SAFARIS,
    PROTOTYPE_TODAY,
    SEED_PEOPLE,
    type SeedPersonKey,
} from './shared-safari-seed.data';
import { daysAfterPrototype, type SeedCover, seedSafariOf, shiftOf } from './shared-safari-seed.plan';

const COVERS_FOLDER = path.resolve(__dirname, '../../../../seed/shared-safari/covers');

const COVER_FILES = ['cover-1.jpg', 'cover-2.jpg', 'cover-3.jpg'];

const INDIA_DATE = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

const PEOPLE = Object.entries(SEED_PEOPLE) as [SeedPersonKey, (typeof SEED_PEOPLE)[SeedPersonKey]][];

const SEED_EMAILS = PEOPLE.map(([, person]) => person.email);

const SEED_SLUGS = PROTOTYPE_SAFARIS.map((safari) => safari.slug);

const sameEmail = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

const SHARED_WITH_PACKAGES_DEMO = SEED_EMAILS.filter((email) =>
    DEMO_PARTNERS.some((partner) => sameEmail(partner.account.email, email)),
);

export class SeedController extends ConsoleController {
    /**
     * Writes the prototype's Shared Safari sample data (13 @example.test accounts and user@example.in as Ananya Iyer when missing, 14 safaris with members, comments, flags, covers, the prototype's 4 notifications and a joined / commented notification to user@example.in for each member and comment of her safaris) to a local database, e.g. "npm run cli seed/shared-safari <password> confirm". The password is the sample accounts' password (8 to 72 characters). Dry run unless "confirm" is given; safe to run again; refused in production.
     */
    public async actionSharedSafari(password?: string, confirm?: string): Promise<void> {
        if (this.refusedInProduction()) return;
        const modules = this.seedModules();
        const today = INDIA_DATE.format(new Date());
        const accounts = await modules.usersSeedService.findAccounts(SEED_EMAILS);
        const taken = new Set(await modules.sharedSafariSeedService.takenSlugs(SEED_SLUGS));
        this.stdout(`Accounts: ${SEED_EMAILS.length - accounts.length} to create, ${accounts.length} already there.\n`);
        const legacy = await modules.usersSeedService.findAccounts(LEGACY_SEED_EMAILS);
        if (legacy.length > 0) {
            this.stdout(
                this.ansiFormat(
                    `Old sample accounts still there (${legacy.map((row) => row.email).join(', ')}): run "seed/shared-safari-remove confirm" first, or their safaris are kept as they are.\n`,
                    'yellow',
                ),
            );
        }
        this.stdout(`Safaris: ${SEED_SLUGS.length - taken.size} to create, ${taken.size} already there.\n`);
        this.stdout(`Prototype day ${PROTOTYPE_TODAY}, today ${today} (${daysAfterPrototype(today)} days later).\n`);
        for (const safari of PROTOTYPE_SAFARIS) {
            const shift = shiftOf(safari, today);
            const note = shift > 0 ? ` (moved ${shift} days: it would have ended)` : '';
            const state = taken.has(safari.slug) ? 'already there' : 'to create';
            this.stdout(`  ${safari.slug}: ${state}${note}\n`);
        }
        if (confirm !== 'confirm') {
            this.stdout(
                this.ansiFormat('Dry run: nothing written. Add the accounts\' password and "confirm" to write it.\n', 'yellow'),
            );
            return;
        }
        if (!password) {
            this.stderr('Give the sample accounts\' password, e.g. "npm run cli seed/shared-safari <password> confirm".\n');
            process.exitCode = 1;
            return;
        }
        const seeded = await modules.usersSeedService.seedAccounts(
            PEOPLE.map(([, person]) => ({ name: person.name, email: person.email })),
            password,
        );
        const idOfEmail = new Map(seeded.map((row) => [row.email.toLowerCase(), row.id]));
        const userIdOf = (key: SeedPersonKey): number => {
            const id = idOfEmail.get(SEED_PEOPLE[key].email.toLowerCase());
            if (id === undefined) throw new Error(`No account for ${SEED_PEOPLE[key].email}`);
            return id;
        };
        const adminId = (await modules.usersService.activeUserIdsWithRole(MetaRole.SUPER_ADMIN))[0] ?? null;
        const covers: SeedCover[] = COVER_FILES.map((file) => ({
            content: readFileSync(path.join(COVERS_FOLDER, file)),
            contentType: 'image/jpeg',
        }));
        const outcomes = await modules.sharedSafariSeedService.seed(
            PROTOTYPE_SAFARIS.map((safari) => seedSafariOf(safari, { today, userIdOf, adminId, covers })),
        );
        const createdAccounts = seeded.filter((row) => row.created).length;
        const createdSafaris = outcomes.filter((row) => row.created).length;
        const addedCovers = outcomes.filter((row) => !row.created && row.coverAdded).length;
        this.stdout(
            this.ansiFormat(
                `Done: ${createdAccounts} accounts and ${createdSafaris} safaris created; ${seeded.length - createdAccounts} accounts and ${outcomes.length - createdSafaris} safaris were already there (${addedCovers} of them given a missing cover).\n`,
                'green',
            ),
        );
    }

    /**
     * Removes the Shared Safari sample data: the 14 sample safaris (also the ones user@example.in hosts) with their members, comments, flags, notifications and covers, and the @example.test sample accounts, e.g. "npm run cli seed/shared-safari-remove confirm". Never removes the local accounts (user@example.in and the others: local-accounts/remove does); Riya Sharma and Neha Singh are kept while the packages-demo data is there (their quote requests), so run packages-demo/remove first to remove them too. Dry run unless "confirm" is given; refused in production.
     */
    public async actionSharedSafariRemove(confirm?: string): Promise<void> {
        if (this.refusedInProduction()) return;
        const modules = this.seedModules();
        const write = confirm === 'confirm';
        const hosts = await modules.usersSeedService.findAccounts([...SEED_EMAILS, ...LEGACY_SEED_EMAILS]);
        const demoThere = (await modules.packageDemoService.existing(DEMO_PACKAGES.map((plan) => plan.slug))).length > 0;
        const kept = hosts.filter(
            (row) => isLocalEmail(row.email) || (demoThere && SHARED_WITH_PACKAGES_DEMO.some((email) => sameEmail(email, row.email))),
        );
        const owned = hosts.filter((row) => !kept.includes(row));
        const counts = await modules.sharedSafariSeedService.remove(
            { slugs: SEED_SLUGS, hostIds: hosts.map((row) => row.id), userIds: owned.map((row) => row.id) },
            write,
        );
        const verb = write ? 'Removed' : 'Would remove';
        this.stdout(
            `${verb}: ${counts.safaris} safaris, ${counts.members} members, ${counts.comments} comments, ${counts.flags} flags, ${counts.notifications} notifications, ${counts.covers} cover pictures.\n`,
        );
        if (kept.length > 0) this.stdout(`Kept accounts: ${kept.map((row) => row.email).join(', ')}.\n`);
        if (!write) {
            this.stdout(`${verb}: ${owned.length} accounts (${owned.map((row) => row.email).join(', ') || 'none'}).\n`);
            this.stdout(this.ansiFormat('Dry run: nothing removed. Add "confirm" to remove it.\n', 'yellow'));
            return;
        }
        const removed = await modules.usersSeedService.removeAccounts(owned.map((row) => row.email));
        this.stdout(this.ansiFormat(`${verb}: ${removed} accounts.\n`, 'green'));
    }

    private refusedInProduction(): boolean {
        if (!config.isProduction) return false;
        this.stderr('Sample data is never written in production (NODE_ENV=production).\n');
        process.exitCode = 1;
        return true;
    }

    private seedModules() {
        const isProduction = config.isProduction;
        const { auditService } = createAuditModule({ db: this.db });
        const { notificationService } = createNotificationModule({
            db: this.db,
            auditService,
            mailStatus: { sent: MailLogStatus.SENT, failed: MailLogStatus.FAILED },
        });
        const { notificationSeedService } = createNotificationSeedModule({ db: this.db, isProduction });
        const { usersService } = createUsersModule({ db: this.db, auditService, notificationService });
        const { usersSeedService } = createUsersSeedModule({ db: this.db, auditService, isProduction });
        const { sharedSafariSeedService } = createSharedSafariSeedModule({
            db: this.db,
            auditService,
            notificationSeedService,
            fileStorage: createFileStorage(config.storage),
            isProduction,
        });
        const { packageDemoService } = createPackageDemoModule({
            db: this.db,
            auditService,
            fileStorage: createFileStorage(config.storage),
            isProduction,
        });
        return { usersService, usersSeedService, sharedSafariSeedService, packageDemoService };
    }
}

export default SeedController;
