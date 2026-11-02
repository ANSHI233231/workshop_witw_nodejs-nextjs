import chalk from 'chalk';

import type { Database } from '../../database/connection';

export abstract class ConsoleController {
    public id: string;
    public defaultAction: string = 'index';

    constructor(
        id: string,
        private readonly databaseFactory: () => Database,
    ) {
        this.id = id;
    }

    /**
     * The shared database, opened on first use. Pass it to a module's composition root
     * (`createXModule({ db: this.db })`) and call the module's service: a CLI command never
     * writes its own SQL.
     */
    protected get db(): Database {
        return this.databaseFactory();
    }

    /**
     * Initializes the controller.
     * This method is invoked right after the controller is created.
     * You may override this method to include code that should be executed for every action.
     */
    public init(): void { }

    /**
     * Prints a string to stdout.
     * @param message
     */
    public stdout(message: string): void {
        process.stdout.write(message);
    }

    /**
     * Prints a string to stderr.
     * @param message
     */
    public stderr(message: string): void {
        process.stderr.write(chalk.red(message));
    }

    // Helper methods for styling
    public ansiFormat(message: string, ...styles: (keyof typeof chalk)[]): string {
        let result: any = chalk;
        for (const style of styles) {
            if (typeof result[style] === 'function' || typeof result[style] === 'object') {
                result = result[style];
            }
        }
        return typeof result === 'function' ? result(message) : message;
    }
}
