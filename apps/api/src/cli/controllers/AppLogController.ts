import { createAuditModule } from '../../modules/audit';
import { createSystemLogModule } from '../../modules/system-log';
import { ConsoleController } from '../lib/ConsoleController';

const DAYS_MIN = 1;
const DAYS_MAX = 3650;

export class AppLogController extends ConsoleController {
    public override defaultAction = 'prune';

    /**
     * Deletes the database log rows (app_log, the Error Logs page) older than the given number of days, e.g. "npm run cli app-log/prune 90 confirm". Dry run (only counts) unless "confirm" is given.
     */
    public async actionPrune(days?: string, confirm?: string): Promise<void> {
        const count = Number(days);
        if (!Number.isInteger(count) || count < DAYS_MIN || count > DAYS_MAX) {
            this.stderr(`Give the age in days (${DAYS_MIN}–${DAYS_MAX}), e.g. "npm run cli app-log/prune 90".\n`);
            process.exitCode = 1;
            return;
        }
        const { auditService } = createAuditModule({ db: this.db });
        const { appLogService } = createSystemLogModule({
            db: this.db,
            auditService,
            logDirectories: {},
            ingestKey: null,
        });
        const isConfirmed = confirm === 'confirm';
        const result = await appLogService.prune(count, isConfirmed);
        this.stdout(`Log rows older than ${count} days (before ${result.before}): ${result.matching}\n`);
        if (!isConfirmed) {
            this.stdout(
                `\nDry run: nothing deleted. Run "npm run cli app-log/prune ${count} confirm" to delete them.\n`,
            );
            return;
        }
        this.stdout(`Deleted: ${result.deleted}\n`);
    }
}

export default AppLogController;
