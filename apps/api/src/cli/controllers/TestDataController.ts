import { config } from '../../config';
import { createFileStorage } from '../../infrastructure/storage';
import { AuditEntity, createAuditModule } from '../../modules/audit';
import { createAuthTestDataModule } from '../../modules/auth';
import { createFlagReasonTestDataModule } from '../../modules/flag-reason';
import { createGalleryTestDataModule } from '../../modules/gallery';
import { createJobsTestDataModule } from '../../modules/jobs';
import { createLanguageTestDataModule } from '../../modules/language';
import { createNotificationTestDataModule } from '../../modules/notification';
import { createPackageTestDataModule } from '../../modules/package';
import { createParkTestDataModule } from '../../modules/park';
import { createPartnerTestDataModule } from '../../modules/partner';
import { createQuoteRequestTestDataModule } from '../../modules/quote-request';
import { createSharedSafariTestDataModule } from '../../modules/shared-safari';
import { createUsersTestDataModule, type TestAccountMarker, type TestDataTable } from '../../modules/users';
import { ConsoleController } from '../lib/ConsoleController';

const CONFIRM = 'confirm';

const CT_TEXT_PREFIX = 'ct_';

const CT_SLUG_PREFIX = 'ct-';

const CT_ACCOUNTS: TestAccountMarker = {
    emailPrefix: CT_TEXT_PREFIX,
    keptEmails: [],
    protectedEmailSuffixes: ['@example.test', '@packages-demo.test'],
};

const KEPT_LOGS = ['audit_log', 'app_log', 'mail_log'];

const compactIds = (ids: readonly number[]): string => {
    const sorted = [...ids].sort((a, b) => a - b);
    const parts: string[] = [];
    let start = sorted[0];
    let previous = sorted[0];
    for (const id of [...sorted.slice(1), Number.NaN]) {
        if (start === undefined || previous === undefined) break;
        if (id === previous + 1) {
            previous = id;
            continue;
        }
        parts.push(start === previous ? `${start}` : `${start}-${previous}`);
        start = id;
        previous = id;
    }
    return parts.join(', ');
};

type Found = Awaited<ReturnType<TestDataController['findAll']>>;

export class TestDataController extends ConsoleController {
    /**
     * Removes the local test data marked "ct_": accounts whose email starts with "ct_" with their roles, sessions and password resets; their partners with parks and logos; galleries, packages (every version, day, FAQ, photo, park, feature, inclusion) and package delete reasons named "ct_" or owned by those partners, with their files; quote requests from or to them or with notes starting "ct_"; parks named "ct_"; flag reasons named "ct_"; languages named "ct_" with their texts, data translations and column (the apps' translation files are published again), and screen texts (app translations) starting with "ct_"; background job runs titled "ct_" (and their retries); shared safaris, members, comments and flags of those accounts or titled "ct_"; notifications to or from them, about any of these rows, or with a "ct_" title or text. The audit, app and mail logs stay. Sample (@example.test) and demo (@packages-demo.test) accounts are never selected. e.g. "npm run cli test-data/remove-ct confirm". Dry run unless "confirm" is given; safe to run again; refused in production.
     */
    public async actionRemoveCt(confirm?: string): Promise<void> {
        if (config.isProduction) {
            this.stderr('Test data is never removed this way in production (NODE_ENV=production).\n');
            process.exitCode = 1;
            return;
        }
        const found = await this.findAll();
        const blockers = this.blockersOf(found);
        this.printFound(found, blockers);
        if (confirm !== CONFIRM) {
            this.stdout(this.ansiFormat('Dry run: nothing removed. Add "confirm" to remove it.\n', 'yellow'));
            return;
        }
        if (blockers.length > 0) {
            this.stderr('Nothing removed: resolve the blockers above first.\n');
            process.exitCode = 1;
            return;
        }
        const services = this.services();
        const removed = {
            notifications: await services.notificationTestDataService.remove(found.notifications),
            quoteRequests: await services.quoteRequestTestDataService.remove(found.quoteRequests),
            safaris: await services.sharedSafariTestDataService.remove(found.safaris),
            packages: await services.packageTestDataService.remove(found.packages),
            galleries: await services.galleryTestDataService.remove(found.galleries),
            partners: await services.partnerTestDataService.remove(found.partners),
            parks: await services.parkTestDataService.remove(found.parks),
            flagReasons: await services.flagReasonTestDataService.remove(found.flagReasons),
            languageRows: await services.languageTestDataService.remove(found.languages),
            jobRuns: await services.jobTestDataService.remove(found.jobs),
            sessions: await services.authTestDataService.remove(found.auth),
            users: await services.usersTestDataService.remove(found.users),
        };
        this.stdout(
            this.ansiFormat(
                `Removed: ${removed.notifications} notifications, ${removed.quoteRequests} quote requests, ${removed.safaris} shared safaris, ${removed.packages} packages, ${removed.galleries} galleries, ${removed.partners} partners, ${removed.parks} parks, ${removed.flagReasons} flag reasons, ${removed.languageRows} language rows (languages and screen texts), ${removed.jobRuns} job runs, ${removed.sessions} sessions and password resets, ${removed.users} accounts.\n`,
                'green',
            ),
        );
    }

    private async findAll() {
        const services = this.services();
        const users = await services.usersTestDataService.find(CT_ACCOUNTS);
        const userIds = users.userIds;
        const partners = await services.partnerTestDataService.find(userIds);
        const partnerIds = partners.partnerIds;
        const packages = await services.packageTestDataService.find({
            partnerIds,
            textPrefix: CT_TEXT_PREFIX,
            slugPrefix: CT_SLUG_PREFIX,
        });
        const galleries = await services.galleryTestDataService.find({
            partnerIds,
            textPrefix: CT_TEXT_PREFIX,
            removedPackageIds: packages.packageIds,
        });
        const quoteRequests = await services.quoteRequestTestDataService.find({
            userIds,
            partnerIds,
            packageIds: packages.packageIds,
            textPrefix: CT_TEXT_PREFIX,
        });
        const safaris = await services.sharedSafariTestDataService.find({
            userIds,
            textPrefix: CT_TEXT_PREFIX,
            slugPrefix: CT_SLUG_PREFIX,
        });
        const parks = await services.parkTestDataService.find({ textPrefix: CT_TEXT_PREFIX, slugPrefix: CT_SLUG_PREFIX });
        const flagReasons = await services.flagReasonTestDataService.find({ textPrefix: CT_TEXT_PREFIX });
        const languages = await services.languageTestDataService.find({ textPrefix: CT_TEXT_PREFIX });
        const jobs = await services.jobTestDataService.find({ textPrefix: CT_TEXT_PREFIX });
        const auth = await services.authTestDataService.find(userIds);
        const notifications = await services.notificationTestDataService.find({
            userIds,
            textPrefix: CT_TEXT_PREFIX,
            entities: [
                { entityType: AuditEntity.USER, entityIds: userIds },
                { entityType: AuditEntity.PARTNER, entityIds: partnerIds },
                { entityType: AuditEntity.GALLERY, entityIds: galleries.galleryIds },
                { entityType: AuditEntity.PACKAGE, entityIds: packages.packageIds },
                { entityType: AuditEntity.QUOTE_REQUEST, entityIds: quoteRequests.quoteRequestIds },
                { entityType: AuditEntity.SHARED_SAFARI, entityIds: safaris.safariIds },
                { entityType: AuditEntity.SHARED_SAFARI_COMMENT, entityIds: safaris.commentIds },
                { entityType: AuditEntity.PARK, entityIds: parks.parkIds },
            ],
        });
        return { users, partners, packages, galleries, quoteRequests, safaris, parks, flagReasons, languages, jobs, auth, notifications };
    }

    private blockersOf(found: Found): string[] {
        const removing = new Map<string, Set<number>>();
        for (const table of this.removedTables(found)) {
            removing.set(table.table, new Set(table.rows.map((row) => row.id)));
        }
        const parkBlockers = found.parks.references.flatMap((reference) =>
            reference.rows
                .filter((row) => !removing.get(reference.table)?.has(row.id))
                .map((row) => `${reference.table} ${row.id} uses test ${row.label}, and stays`),
        );
        const flagReasonBlockers = found.flagReasons.references.flatMap((reference) =>
            reference.rows
                .filter((row) => !removing.get(reference.table)?.has(row.id))
                .map((row) => `${reference.table} ${row.id} uses test ${row.label}, and stays`),
        );
        return [
            ...found.users.blockers,
            ...found.galleries.blockers,
            ...found.packages.blockers,
            ...found.jobs.blockers,
            ...parkBlockers,
            ...flagReasonBlockers,
        ];
    }

    private removedTables(found: Found): TestDataTable[] {
        return [
            ...found.notifications.tables,
            ...found.quoteRequests.tables,
            ...found.safaris.tables,
            ...found.packages.tables,
            ...found.galleries.tables,
            ...found.partners.tables,
            ...found.parks.tables,
            ...found.flagReasons.tables,
            ...found.languages.tables,
            ...found.jobs.tables,
            ...found.auth.tables,
            ...found.users.tables,
        ];
    }

    private printFound(found: Found, blockers: readonly string[]): void {
        this.stdout(this.ansiFormat('To remove (rows marked ct_ and the rows that hang off them):\n', 'bold'));
        for (const table of this.removedTables(found)) this.printTable(table);
        const folders = [
            ...found.partners.folders,
            ...found.galleries.folders,
            ...found.packages.folders,
            ...found.parks.folders,
            ...found.safaris.folders,
        ];
        this.stdout(`  storage folders (${folders.length}, removed with everything in them where they exist):\n`);
        for (const folder of folders) this.stdout(`    ${folder}\n`);
        this.stdout(this.ansiFormat('Rows that point at the test parks:\n', 'bold'));
        for (const reference of found.parks.references) this.printTable(reference);
        this.stdout(this.ansiFormat('Rows that point at the test flag reasons:\n', 'bold'));
        for (const reference of found.flagReasons.references) this.printTable(reference);
        this.stdout(this.ansiFormat('Kept:\n', 'bold'));
        for (const table of [
            ...found.users.kept,
            ...found.partners.kept,
            ...found.galleries.kept,
            ...found.packages.kept,
            ...found.quoteRequests.kept,
        ]) {
            this.printTable(table);
        }
        for (const table of found.safaris.kept) {
            this.stdout(`  ${table.table}: ${table.rows.length} (ids ${compactIds(table.rows.map((row) => row.id))})\n`);
        }
        this.stdout(`  notification: ${found.notifications.keptCount}\n`);
        this.stdout(`  ${KEPT_LOGS.join(', ')}: not touched (the history of what was done)\n`);
        if (blockers.length === 0) {
            this.stdout(this.ansiFormat('Blockers: none.\n', 'green'));
            return;
        }
        this.stdout(this.ansiFormat(`Blockers (${blockers.length}):\n`, 'red'));
        for (const blocker of blockers) this.stdout(`  ${blocker}\n`);
    }

    private printTable(table: TestDataTable): void {
        const ids = table.rows.map((row) => row.id);
        const labelled = table.rows.filter((row) => row.label.length > 0);
        if (labelled.length === 0) {
            this.stdout(`  ${table.table}: ${table.rows.length}${ids.length > 0 ? ` (ids ${compactIds(ids)})` : ''}\n`);
            return;
        }
        this.stdout(`  ${table.table}: ${table.rows.length}\n`);
        for (const row of table.rows) this.stdout(`    ${row.id} ${row.label}\n`);
    }

    private services() {
        const isProduction = config.isProduction;
        const { auditService } = createAuditModule({ db: this.db });
        const fileStorage = createFileStorage(config.storage);
        const base = { db: this.db, auditService, isProduction };
        const withFiles = { ...base, fileStorage };
        return {
            ...createUsersTestDataModule(base),
            ...createAuthTestDataModule(base),
            ...createPartnerTestDataModule(withFiles),
            ...createGalleryTestDataModule(withFiles),
            ...createPackageTestDataModule(withFiles),
            ...createQuoteRequestTestDataModule(base),
            ...createSharedSafariTestDataModule(withFiles),
            ...createParkTestDataModule(withFiles),
            ...createFlagReasonTestDataModule(base),
            ...createLanguageTestDataModule({ ...base, translationDirectories: config.translationDirs }),
            ...createJobsTestDataModule(base),
            ...createNotificationTestDataModule(base),
        };
    }
}

export default TestDataController;
