export type CommandExit = {
    readonly exitCode: number | null;
    readonly signal: string | null;
    readonly startError: string | null;
};

export type RunningCommand = {
    readonly pid: number | null;
    readonly finished: Promise<CommandExit>;
    onStdout(listener: (text: string) => void): void;
    onStderr(listener: (text: string) => void): void;
    stop(): void;
};

export interface ICommandRunner {
    startCli(command: string, args: readonly string[], env: Readonly<Record<string, string>>): RunningCommand;
    stopProcess(pid: number): void;
}
