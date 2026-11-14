// Turns a bundled stack frame (a .next/… chunk on the server, a /_next/static/… URL in the
// browser) back into the source line: src/components/x.tsx:42:17. Source maps are read from
// disk: .next/dev/… in development, .next/… in a production build (browser maps only exist there
// if they are built; see the planning file).

import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AnyMap, originalPositionFor, type TraceMap } from '@jridgewell/trace-mapping';

const ROOT = process.cwd();
const NEXT_DIR = path.join(ROOT, '.next');
const MAX_CACHED = 100;
const cache = new Map<string, TraceMap | null>();

export type MappedPosition = { readonly file: string; readonly line: number; readonly column: number; readonly name?: string };

/** Path of the bundled file on disk, or null if it can't be (or mustn't be) read. */
function diskPathOf(file: string): string | null {
    let candidate: string | null = null;
    if (/^https?:\/\//.test(file)) {
        const pathname = new URL(file).pathname;
        const marker = '/_next/static/';
        const at = pathname.indexOf(marker);
        if (at === -1) return null;
        const relative = decodeURIComponent(pathname.slice(at + marker.length));
        candidate = [path.join(NEXT_DIR, 'dev', 'static', relative), path.join(NEXT_DIR, 'static', relative)].find((p) => fs.existsSync(p)) ?? null;
    } else if (file.startsWith('file://')) {
        candidate = fileURLToPath(file);
    } else if (path.isAbsolute(file)) {
        candidate = file;
    }
    // Only ever read our own build output (no path tricks from a browser-supplied URL).
    if (!candidate) return null;
    // turbopackIgnore: a runtime path (inside .next only), not a file the build must bundle.
    const resolved = path.resolve(/*turbopackIgnore: true*/ candidate);
    return resolved.startsWith(NEXT_DIR + path.sep) ? resolved : null;
}

function loadMap(jsPath: string): TraceMap | null {
    if (cache.has(jsPath)) return cache.get(jsPath)!;
    let map: TraceMap | null = null;
    try {
        let raw: string | null = null;
        if (fs.existsSync(`${jsPath}.map`)) {
            raw = fs.readFileSync(`${jsPath}.map`, 'utf8');
        } else if (fs.existsSync(jsPath)) {
            const source = fs.readFileSync(jsPath, 'utf8');
            const match = /\/\/# sourceMappingURL=(\S+)\s*$/.exec(source.slice(-4096));
            if (match?.[1]?.startsWith('data:')) {
                raw = Buffer.from(match[1].slice(match[1].indexOf(',') + 1), 'base64').toString('utf8');
            } else if (match?.[1]) {
                const mapPath = path.resolve(/*turbopackIgnore: true*/ path.dirname(jsPath), match[1]);
                if (mapPath.startsWith(NEXT_DIR + path.sep) && fs.existsSync(mapPath)) raw = fs.readFileSync(mapPath, 'utf8');
            }
        }
        if (raw) map = new AnyMap(raw);
    } catch {
        map = null;
    }
    if (cache.size >= MAX_CACHED) cache.delete(cache.keys().next().value!);
    cache.set(jsPath, map);
    return map;
}

/**
 * Any way a source file can be named → a path relative to this app:
 * turbopack:///[project]/src/app/page.tsx, file:///…/apps/web/src/app/page.tsx and
 * /…/apps/web/src/app/page.tsx all become src/app/page.tsx; libraries become node_modules/….
 */
export function normaliseSource(source: string): string {
    let s = source;
    try {
        s = decodeURIComponent(s);
    } catch {
        // keep as is
    }
    if (s.startsWith('file://')) {
        try {
            s = fileURLToPath(s);
        } catch {
            s = s.slice('file://'.length);
        }
    }
    s = s.replace(/^(turbopack|webpack):\/\/\/?/, '').replace(/^about:\/\/React\/[^/]+\//, '');
    const project = s.indexOf('[project]/');
    if (project !== -1) s = s.slice(project + '[project]/'.length);
    if (path.isAbsolute(s) && s.startsWith(ROOT + path.sep)) s = path.relative(ROOT, s);
    // Production maps name sources relative to the chunk: ../../../../src/app/page.tsx
    s = s.replace(/^(\.\.?\/)+(?=src\/)/, '');
    const nodeModules = s.indexOf('node_modules/');
    if (nodeModules !== -1) s = s.slice(nodeModules);
    return s.replace(/^\.\//, '').replace(/\?.*$/, '');
}

export function mapPosition(file: string, line: number, column: number): MappedPosition | null {
    const jsPath = diskPathOf(file);
    if (!jsPath) return null;
    const map = loadMap(jsPath);
    if (!map) return null;
    const original = originalPositionFor(map, { line, column: Math.max(column - 1, 0) });
    if (!original.source || original.line === null) return null;
    // A relative source is relative to the bundled file's folder.
    const source = /^[a-z]+:/i.test(original.source) || path.isAbsolute(original.source)
        ? original.source
        : path.resolve(/*turbopackIgnore: true*/ path.dirname(jsPath), original.source);
    return {
        file: normaliseSource(source),
        line: original.line,
        column: (original.column ?? 0) + 1,
        ...(original.name ? { name: original.name } : {}),
    };
}
