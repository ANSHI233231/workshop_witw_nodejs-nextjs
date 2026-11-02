import { createHealthModule } from "../../modules/health";
import { ConsoleController } from "../lib/ConsoleController";

/**
 * Health checks from the command line. Shows how a CLI command reuses a module's service
 * through its public `index.ts` instead of writing its own SQL.
 */
export class HealthController extends ConsoleController {
    public override defaultAction = "check";

    /**
     * Checks that the API can reach the database.
     */
    public async actionCheck(): Promise<void> {
        const { healthService } = createHealthModule({ db: this.db });
        const health = await healthService.check();

        const database = health.database === "up" ? this.ansiFormat("up", "green") : this.ansiFormat("down", "red");
        this.stdout(`Database: ${database}\n`);
        if (health.database === "down") process.exitCode = 1;
    }
}

export default HealthController;
