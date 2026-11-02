import path from 'node:path';

import { ConsoleController } from '../../lib/ConsoleController';

import { commandCatalog } from './command-catalog';

export class JobController extends ConsoleController {
    public override defaultAction = 'commands';

    /**
     * Prints every CLI command with its arguments and help text as JSON (used by the console's Background Jobs).
     */
    public actionCommands(): Promise<void> {
        this.stdout(`${JSON.stringify(commandCatalog(path.join(__dirname, '..')))}\n`);
        return Promise.resolve();
    }
}

export default JobController;
