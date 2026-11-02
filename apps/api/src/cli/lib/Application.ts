import { Command, Help } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { ConsoleController } from './ConsoleController';
import { logger } from '../../core/logger';
import type { Database } from '../../database/connection';

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;


export class Application {
    private program: Command;
    private controllersPath: string;
    private database: Database | null = null;

    constructor(private readonly createConnectionPool: () => Database) {
        this.program = new Command();
        this.controllersPath = path.join(__dirname, '../controllers');
        this.init();
    }

    private init() {
        this.program
            .name('npm run cli')
            .description('Node.js Console Application\n')
            .version('1.0.0');

        this.program.configureHelp({
            formatHelp: (cmd, helper) => {
                const helpInformation = [
                    helper.commandUsage(cmd),
                    '',
                    helper.commandDescription(cmd),
                    '',
                    this.formatCommands(cmd, helper),
                    '',
                    chalk.bold('To see the help of each command, enter:'),
                    '',
                    `  npm run cli ${chalk.yellow('help')} ${chalk.cyan('<command-name>')}`,
                    '\n ',
                ].join('\n');
                return helpInformation;
            }
        });

        this.registerCommands();
    }

    private formatCommands(cmd: Command, helper: Help): string {
        const commands = helper.visibleCommands(cmd);
        if (commands.length === 0) return '';

        const groups: { [key: string]: Command[] } = {};

        commands.forEach(subCmd => {
            const name = subCmd.name();
            if (name === 'help') return; // Skip default help command in grouping

            const parts = name.split('/');
            const controllerId = parts[0] || 'other';
            if (!groups[controllerId]) {
                groups[controllerId] = [];
            }
            groups[controllerId].push(subCmd);
        });

        let output = chalk.bold('The following commands are available:\n');

        Object.keys(groups).sort().forEach(controllerId => {
            output += `\n- ${chalk.yellow(controllerId)}\n`;
            groups[controllerId]!.forEach(subCmd => {
                const name = subCmd.name();
                const description = subCmd.description();
                const usage = subCmd.usage().replace('[options] ', '').replace('[options]', '').trim();

                let descOutput = description;
                if (description.includes('(default)')) {
                    descOutput = description.replace('(default)', '').trim() + ' ' + chalk.yellow('(default)');
                }

                output += `    ${chalk.green(name.padEnd(25))} ${chalk.gray(usage.padEnd(20))} ${descOutput}\n`;
            });
        });

        return output;
    }

    private registerCommands() {
        if (!fs.existsSync(this.controllersPath)) {
            logger.warn(`Controllers directory not found: ${this.controllersPath}`);
            return;
        }

        const files = (fs.readdirSync(this.controllersPath, { recursive: true }) as string[])
            .filter((file) => /Controller\.(ts|js)$/.test(file) && !file.endsWith('.d.ts'))
            .sort();

        files.forEach((file) => {
            const filePath = path.join(this.controllersPath, file);
            const controllerName = path.basename(file).replace(/Controller\.(ts|js)$/, '');
            const controllerId = this.camelToKebab(controllerName);

            const module = require(filePath);
            const ControllerClass = module.default || module[`${controllerName}Controller`] || Object.values(module)[0];

            if (ControllerClass && ControllerClass.prototype instanceof ConsoleController) {
                const controller: ConsoleController = new ControllerClass(controllerId, () => this.getDatabase());
                controller.init();

                const descriptions = this.parseActionDescriptions(filePath);
                this.registerControllerActions(controller, controllerId, descriptions);
            }
        });

        // Default command to list help
        // this.program.action(() => {
        //   this.program.help();
        // });
    }

    private parseActionDescriptions(filePath: string): { [action: string]: string } {
        const content = fs.readFileSync(filePath, 'utf8');
        const descriptions: { [action: string]: string } = {};

        // Match JSDoc blocks followed by an action method
        // Using a more robust regex to capture the first line of JSDoc above action methods
        // The body must not contain `*/`: otherwise a match starting at the CLASS doc comment runs
        // on through the first action's comment and the action is described by the class's text
        // (e.g. `example/index` would show the class description).
        const jsDocRegex = /\/\*\*((?:(?!\*\/)[\s\S])*)\*\/[\r\n\s]+(?:public\s+)?(?:async\s+)?action([A-Z][a-zA-Z0-9]*)/g;

        let match;
        while ((match = jsDocRegex.exec(content)) !== null) {
            const comment = match[1] || '';
            const actionName = this.camelToKebab(match[2] || '');

            // Extract first line of description (excluding * and whitespace)
            const lines = comment.split('\n');
            for (const line of lines) {
                const trimmed = line.trim().replace(/^\*\s*/, '').trim();
                if (trimmed && !trimmed.startsWith('@')) {
                    descriptions[actionName] = trimmed;
                    break;
                }
            }
        }

        return descriptions;
    }

    private registerControllerActions(controller: ConsoleController, controllerId: string, descriptions: { [action: string]: string } = {}) {
        const proto = Object.getPrototypeOf(controller);
        const methodNames = Object.getOwnPropertyNames(proto);

        methodNames.forEach((methodName) => {
            if (methodName.startsWith('action') && methodName !== 'action') {
                const actionId = this.camelToKebab(methodName.substring(6));
                const params = this.getParamNames((controller as any)[methodName]);
                const argsDef = params.map(p => `[${p}]`).join(' ');

                const isDefault = actionId === controller.defaultAction;
                const explicitCommand = `${controllerId}/${actionId}`;
                const commandString = argsDef ? `${explicitCommand} ${argsDef}` : explicitCommand;

                const description = descriptions[actionId] || `Run ${controllerId} ${actionId}`;

                this.program
                    .command(commandString)
                    .description(`${description}${isDefault ? ' (default)' : ''}`)
                    .action(async (...args) => {
                        // Commander passes (...args, options, command)
                        // We want just the args passed to the CLI
                        const methodArgs = args.slice(0, -2);
                        await (controller as any)[methodName](...methodArgs);
                    });

                // Register the base controller command as a hidden alias to the default action
                if (isDefault) {
                    const baseCommandString = argsDef ? `${controllerId} ${argsDef}` : controllerId;
                    this.program
                        .command(baseCommandString, { hidden: true })
                        .description(`Alias for ${explicitCommand}`)
                        .action(async (...args) => {
                                const methodArgs = args.slice(0, -2);
                            await (controller as any)[methodName](...methodArgs);
                        });
                }
            }
        });
    }

    private getParamNames(func: Function): string[] {
        const fnStr = func.toString().replace(STRIP_COMMENTS, '');
        const OPENING_PAREN = fnStr.indexOf('(');
        const CLOSING_PAREN = fnStr.indexOf(')');

        if (OPENING_PAREN === -1 || CLOSING_PAREN === -1) return [];

        const argsStr = fnStr.slice(OPENING_PAREN + 1, CLOSING_PAREN);
        if (!argsStr.trim()) return [];

        return argsStr.split(',').map(arg => {
            // Remove comments and whitespace
            let cleanArg = arg.trim();
            // Handle default values: "days = '30'" -> "days"
            if (cleanArg.includes('=')) {
                cleanArg = (cleanArg.split('=')[0] || '').trim();
            }
            return cleanArg;
        }).filter(Boolean);
    }

    private camelToKebab(str: string): string {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    private getDatabase(): Database {
        this.database ??= this.createConnectionPool();
        return this.database;
    }

    /** Closes the pool if a command opened one, so the process can exit cleanly. */
    public async close(): Promise<void> {
        await this.database?.close();
    }

    public run(): Promise<Command> {
        return this.program.parseAsync(process.argv);
    }
}
