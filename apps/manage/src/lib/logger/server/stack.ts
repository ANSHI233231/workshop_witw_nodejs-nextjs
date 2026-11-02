// Parses V8 (Chrome, Node, Edge) and Firefox/Safari stack lines, maps each frame to its source,
// and builds (a) the short `in src/…:line` trace for ordinary lines, (b) the full stack for errors.

import 'server-only';

import { mapPosition, normaliseSource } from './source-maps';

const V8_FRAME = /^\s*at (?:async )?(?:(.*?) \()?(.+?):(\d+):(\d+)\)?\s*$/;
const GECKO_FRAME = /^\s*(.*?)@(.+?):(\d+):(\d+)\s*$/;

type Frame = { readonly fn: string; readonly file: string; readonly line: number; readonly column: number };

const parseLine = (line: string): Frame | null => {
    const match = V8_FRAME.exec(line) ?? GECKO_FRAME.exec(line);
    if (!match) return null;
    return { fn: match[1] ?? '', file: match[2]!, line: Number(match[3]), column: Number(match[4]) };
};

/** Our own source, except the logger itself (it would be the first frame of every trace). */
const isOurCode = (file: string): boolean =>
    file.startsWith('src/') && !file.startsWith('src/lib/logger/') && !/^src\/instrumentation(-client)?\.ts$/.test(file);

const resolve = (frame: Frame): { file: string; line: number; column: number; fn: string } => {
    const mapped = mapPosition(frame.file, frame.line, frame.column);
    if (mapped) return { file: mapped.file, line: mapped.line, column: mapped.column, fn: frame.fn || mapped.name || '' };
    // Unmapped (often already mapped by Next.js itself): make the path relative / readable.
    const file = /^https?:\/\//.test(frame.file) ? new URL(frame.file).pathname : normaliseSource(frame.file);
    return { file, line: frame.line, column: frame.column, fn: frame.fn };
};

/** Up to `limit` frames of our code: `src/components/x.tsx:42`. */
export function traceOf(callStack: string | undefined, limit = 3): string[] {
    if (!callStack) return [];
    const frames: string[] = [];
    for (const line of callStack.split('\n')) {
        const frame = parseLine(line);
        if (!frame) continue;
        const resolved = resolve(frame);
        if (!isOurCode(resolved.file)) continue;
        const text = `${resolved.file}:${resolved.line}`;
        if (frames.at(-1) !== text) frames.push(text);
        if (frames.length >= limit) break;
    }
    return frames;
}

/**
 * Next.js / React / Node internals: real frames, but never where our bug is. Unmapped browser
 * chunks (/_next/static/chunks/…, production without browser source maps) stay visible: our own
 * code lives in them too.
 */
const isFrameworkFrame = (file: string): boolean =>
    file.startsWith('node:') || /^node_modules\/(next|react|react-dom|scheduler)\//.test(file) || file.includes('[turbopack]');

/**
 * An error stack with every frame mapped; message and `Caused by:` lines kept as they are.
 * Runs of framework frames collapse into one `… N framework frames` line.
 */
export function mapErrorStack(stack: string): string {
    const out: string[] = [];
    let hidden = 0;
    const flushHidden = () => {
        if (hidden > 0) out.push(`    … ${hidden} framework frame${hidden === 1 ? '' : 's'}`);
        hidden = 0;
    };
    for (const line of stack.split('\n')) {
        const frame = parseLine(line);
        if (!frame) {
            flushHidden();
            out.push(line.trim());
            continue;
        }
        const resolved = resolve(frame);
        if (isFrameworkFrame(resolved.file)) {
            hidden++;
            continue;
        }
        flushHidden();
        const where = `${resolved.file}:${resolved.line}:${resolved.column}`;
        out.push(`    at ${resolved.fn ? `${resolved.fn} (${where})` : where}`);
    }
    flushHidden();
    return out.join('\n');
}
