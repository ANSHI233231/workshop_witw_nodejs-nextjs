import { readFile } from 'node:fs/promises';

import { config } from '../../../config';
import { createFileStorage } from '../../../infrastructure/storage';
import { createAuditModule } from '../../../modules/audit';
import { MailLogStatus } from '../../../modules/mail';
import { createNotificationModule } from '../../../modules/notification';
import { createParkDemoModule, type DemoParkImage } from '../../../modules/park';
import { createUsersModule, MetaRole } from '../../../modules/users';
import { ConsoleController } from '../../lib/ConsoleController';

import { PARK_PICTURES, SAMPLE_PICTURES } from './park-images.data';

const CONFIRM = 'confirm';

export class ParkImagesController extends ConsoleController {
    /**
     * Gives each park with no feature image the prototype's photo for it: Kanha, Corbett, Gir, Jhalana, Kuno, Bhitarkanika, Bandhavgarh and Satpura their named photo, every other park one of the three Shared Safari sample covers in turn, all from the repo's seed folders, e.g. "npm run cli park-images/add confirm". A park that already has an image is never changed. Dry run unless "confirm" is given; safe to run again; refused in production.
     */
    public async actionAdd(confirm?: string): Promise<void> {
        if (this.refusedInProduction()) return;
        const { parkDemoService, usersService } = this.modules();
        const parks = await parkDemoService.images();
        const idOf = new Map(parks.map((park) => [park.name, park]));
        const planned = PARK_PICTURES.flatMap((plan) => {
            const park = idOf.get(plan.parkName);
            return park && park.featureImage === null ? [{ park, picture: plan.picture }] : [];
        });
        const unknown = PARK_PICTURES.filter((plan) => !idOf.has(plan.parkName)).map((plan) => plan.parkName);
        const withImage = parks.filter((park) => park.featureImage !== null).length;
        const unplanned = parks.filter((park) => park.featureImage === null && !PARK_PICTURES.some((plan) => plan.parkName === park.name));
        this.stdout(`Parks: ${parks.length}; ${withImage} have an image (kept), ${planned.length} to get one.\n`);
        if (unknown.length > 0) this.stdout(`  Not in Parks (skipped): ${unknown.join(', ')}\n`);
        if (unplanned.length > 0) this.stdout(`  No photo planned (left without one): ${unplanned.map((park) => park.name).join(', ')}\n`);
        if (confirm !== CONFIRM) {
            this.stdout(this.ansiFormat('Dry run: nothing written. Add "confirm" to write it.\n', 'yellow'));
            return;
        }
        const images: DemoParkImage[] = [];
        for (const item of planned) images.push({ parkId: item.park.id, content: await readFile(item.picture) });
        const adminId = (await usersService.activeUserIdsWithRole(MetaRole.SUPER_ADMIN))[0] ?? null;
        const added = await parkDemoService.addImages(images, adminId);
        for (const outcome of added) this.stdout(`  ${outcome.name}: image ${outcome.fileName} added\n`);
        this.stdout(this.ansiFormat(`Done: ${added.length} park images added.\n`, 'green'));
    }

    /**
     * Removes the park images that park-images/add gave: only a park whose stored image is byte for byte one of the sample photos, so an image a Super Admin uploaded is never touched, e.g. "npm run cli park-images/remove confirm". Dry run unless "confirm" is given; refused in production.
     */
    public async actionRemove(confirm?: string): Promise<void> {
        if (this.refusedInProduction()) return;
        const { parkDemoService, usersService } = this.modules();
        const samples = await Promise.all(SAMPLE_PICTURES.map((file) => readFile(file)));
        const found = await parkDemoService.sampleImages(samples);
        if (confirm !== CONFIRM) {
            this.stdout(`Would remove: ${found.length} park images (${found.map((image) => image.name).join(', ') || 'none'}).\n`);
            this.stdout(this.ansiFormat('Dry run: nothing removed. Add "confirm" to remove it.\n', 'yellow'));
            return;
        }
        const adminId = (await usersService.activeUserIdsWithRole(MetaRole.SUPER_ADMIN))[0] ?? null;
        const removed = await parkDemoService.removeImages(found, adminId);
        this.stdout(this.ansiFormat(`Removed: ${removed} park images.\n`, 'green'));
    }

    private refusedInProduction(): boolean {
        if (!config.isProduction) return false;
        this.stderr('Demo data is never written in production (NODE_ENV=production).\n');
        process.exitCode = 1;
        return true;
    }

    private modules() {
        const { auditService } = createAuditModule({ db: this.db });
        const { notificationService } = createNotificationModule({
            db: this.db,
            auditService,
            mailStatus: { sent: MailLogStatus.SENT, failed: MailLogStatus.FAILED },
        });
        const { usersService } = createUsersModule({ db: this.db, auditService, notificationService });
        const { parkDemoService } = createParkDemoModule({
            db: this.db,
            auditService,
            fileStorage: createFileStorage(config.storage),
            isProduction: config.isProduction,
        });
        return { parkDemoService, usersService };
    }
}

export default ParkImagesController;
