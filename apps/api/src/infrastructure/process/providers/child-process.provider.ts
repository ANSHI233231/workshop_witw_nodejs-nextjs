import { spawn } from 'node:child_process';

import type { CommandExit, ICommandRunner, RunningCommand } from '../command-runner.contract';

const FORCE_STOP_AFTER_MS = 10_000;

export type CliLaunch = { readonly executable: string; readonly prefix: readonly string[]; readonly cwd: string };

const isAlive = (pid: number): boolean => {
    try {
        process.kill(pid, 0);
        return true;
    } catch {
        return false;
    }
};

const stopPid = (pid: number): void => {
    if (!isAlive(pid)) return;
    process.kill(pid, 'SIGTERM');
    setTimeout(() => {
        if (isAlive(pid)) process.kill(pid, 'SIGKILL');
    }, FORCE_STOP_AFTER_MS).unref();
};

export class ChildProcessCommandRunner implements ICommandRunner {
    constructor(
        private readonly environment: Readonly<Record<string, string | undefined>>,
        private readonly launch: CliLaunch,
    ) {}

    startCli(command: string, args: readonly string[], env: Readonly<Record<string, string>>): RunningCommand {
        const child = spawn(this.launch.executable, [...this.launch.prefix, command, ...args], {
            cwd: this.launch.cwd,
            env: { ...this.environment, ...env },
            shell: false,
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        const finished = new Promise<CommandExit>((resolve) => {
            child.once('error', (error) => resolve({ exitCode: null, signal: null, startError: error.message }));
            child.once('close', (exitCode, signal) => resolve({ exitCode, signal, startError: null }));
        });
        return {
            pid: child.pid ?? null,
            finished,
            onStdout: (listener) => child.stdout.on('data', (chunk: Buffer) => listener(chunk.toString('utf8'))),
            onStderr: (listener) => child.stderr.on('data', (chunk: Buffer) => listener(chunk.toString('utf8'))),
            stop: () => {
                if (child.pid !== undefined) stopPid(child.pid);
            },
        };
    }

    stopProcess(pid: number): void {
        stopPid(pid);
    }
}
