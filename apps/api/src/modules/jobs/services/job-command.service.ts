import { logger } from '../../../core/logger';
import type { ICommandRunner } from '../../../infrastructure/process';
import type { JobCommandDto } from '../dto/job.dto';
import { JOB_CATALOG_COMMAND } from '../types/job.types';

const log = logger.category('jobs');

const CACHE_MS = 5 * 60_000;

export class JobCommandService {
    private cache: { readonly at: number; readonly commands: readonly JobCommandDto[] } | null = null;

    constructor(private readonly runner: ICommandRunner) {}

    async commands(): Promise<readonly JobCommandDto[]> {
        if (this.cache && Date.now() - this.cache.at < CACHE_MS) return this.cache.commands;
        const commands = await this.readCatalog();
        this.cache = { at: Date.now(), commands };
        return commands;
    }

    async isKnown(command: string): Promise<boolean> {
        return (await this.commands()).some((known) => known.command === command);
    }

    private async readCatalog(): Promise<readonly JobCommandDto[]> {
        const running = this.runner.startCli(JOB_CATALOG_COMMAND, [], {});
        let output = '';
        running.onStdout((text) => {
            output += text;
        });
        const exit = await running.finished;
        const line = output.trim().split('\n').pop() ?? '';
        try {
            const parsed: unknown = JSON.parse(line);
            return Array.isArray(parsed) ? (parsed as JobCommandDto[]) : [];
        } catch (error) {
            log.error('Could not read the CLI command list', { exit, error });
            return [];
        }
    }
}
