import path from 'node:path';

import type { ICommandRunner } from './command-runner.contract';
import { ChildProcessCommandRunner } from './providers/child-process.provider';

export const createCommandRunner = (options: {
    readonly apiRoot: string;
    readonly fromSource: boolean;
    readonly environment: Readonly<Record<string, string | undefined>>;
}): ICommandRunner =>
    new ChildProcessCommandRunner(
        options.environment,
        options.fromSource
            ? {
                  executable: process.execPath,
                  prefix: ['-r', 'ts-node/register/transpile-only', path.join(options.apiRoot, 'src/cli/index.ts')],
                  cwd: options.apiRoot,
              }
            : {
                  executable: process.execPath,
                  prefix: ['--enable-source-maps', path.join(options.apiRoot, 'dist/cli/index.js')],
                  cwd: options.apiRoot,
              },
    );
