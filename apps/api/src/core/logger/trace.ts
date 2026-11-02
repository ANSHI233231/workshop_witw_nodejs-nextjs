// The trace: the last N stack frames of OUR code at the point a line is logged.
// Skipped: node_modules, Node internals, and our own framework
// folders core/ and database/ (so a SQL line points at the repository that ran it, not the pool).
// Paths are .ts thanks to source maps (ts-node in dev, `node --enable-source-maps` for dist/).

import path from 'node:path';

const ROOT = process.cwd();
const SKIPPED = /[\\/]node_modules[\\/]|[\\/](src|dist)[\\/](core|database)[\\/]/;
// `    at fn (file:line:col)`, `    at file:line:col`, `    at async fn (file:line:col)`
const FRAME = /^\s*at (?:async )?(?:.*? \()?(.+?):(\d+):\d+\)?$/;

export function captureTrace(limit: number): string[] {
    if (limit <= 0) return [];

    const previousLimit = Error.stackTraceLimit;
    Error.stackTraceLimit = 60;
    const stack = new Error().stack ?? '';
    Error.stackTraceLimit = previousLimit;

    const frames: string[] = [];
    for (const line of stack.split('\n').slice(1)) {
        const match = FRAME.exec(line);
        if (!match) continue;

        const file = match[1]!.replace(/^file:\/\//, '');
        if (file.startsWith('node:') || !path.isAbsolute(file) || !file.startsWith(ROOT) || SKIPPED.test(file)) continue;

        const frame = `${path.relative(ROOT, file)}:${match[2]}`;
        if (frames.at(-1) !== frame) frames.push(frame);
        if (frames.length >= limit) break;
    }
    return frames;
}
