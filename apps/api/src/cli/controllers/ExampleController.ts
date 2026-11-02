import { ConsoleController } from "../lib/ConsoleController";

/**
 * Example console controller — copy this file as a template for new CLI commands.
 * Runs as: npm run cli example/index, npm run cli example/hello -- World
 */
export class ExampleController extends ConsoleController {
    public override defaultAction = "index";

    /**
     * Prints a short message (default action for this controller).
     */
    public actionIndex(): void {
        this.stdout(`${this.ansiFormat("example", "green")} controller is wired up.\n`);
    }

    /**
     * Greets the given name.
     */
    public actionHello(name = "world"): void {
        this.stdout(`Hello, ${name}!\n`);
    }
}

export default ExampleController;
