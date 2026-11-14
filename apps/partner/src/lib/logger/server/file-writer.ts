// Writes this app's log lines, in the same format as the API:
//   2026-10-01 05:12:03.120Z [ip][userId][id][level][category] message {context}
//       in src/components/x.tsx:42                  ← trace of our code (ordinary lines)
//       TypeError: …  at Fn (src/…:42:17)            ← mapped stack (errors)
// Files in this app's logs/: error.log, warning.log, info.log, debug.log (one per level) and
// app.log (every saved level, in order). Each rotates at 10 MB, keeping 5 old copies.

import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import { serverConfig } from '../../server-config';
import { redact } from '../redact';
import { LEVEL_NAME, type LogLevel } from '../types';

import { forwardError } from './db-forwarder';
import { mapErrorStack, traceOf } from './stack';

const LOG_DIR = path.join(process.cwd(), 'logs');
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 5;
const levels = new Set(serverConfig.log.levels);

export type LogRecord = {
    readonly level: LogLevel;
    readonly category: string;
    readonly message: string;
    readonly context?: Record<string, unknown>;
    readonly errorStack?: string;
    readonly callStack?: string;
    /** When it happened (ISO); defaults to now. Browser entries carry their own time. */
    readonly time?: string;
    readonly ip?: string;
    readonly userId?: string | number | null;
    /** Request id (server) or tab session id (browser). */
    readonly id?: string;
    readonly request?: { readonly method?: string; readonly url?: string; readonly userAgent?: string };
};

export const isLevelSaved = (level: LogLevel): boolean => serverConfig.log.enabled && levels.has(level);

export function formatRecord(record: LogRecord): string {
    const time = (record.time ?? new Date().toISOString()).replace('T', ' ');
    const prefix = `[${record.ip ?? '-'}][${record.userId ?? '-'}][${record.id ?? '-'}][${LEVEL_NAME[record.level]}][${record.category}]`;
    const context =
        record.context && Object.keys(record.context).length > 0 ? ` ${JSON.stringify(redact(record.context))}` : '';
    const body = record.errorStack
        ? `\n${mapErrorStack(record.errorStack).replace(/^/gm, '    ')}`
        : traceOf(record.callStack)
              .map((frame) => `\n    in ${frame}`)
              .join('');
    return `${time} ${prefix} ${record.message}${context}${body}\n`;
}

export function writeRecord(record: LogRecord): string | null {
    if (record.level === 'error') forwardError(record);
    if (!isLevelSaved(record.level)) return null;
    const line = formatRecord(record);
    writeFile(`${LEVEL_NAME[record.level]}.log`, line);
    writeFile('app.log', line);
    return line;
}

function writeFile(name: string, content: string): void {
    const file = path.join(LOG_DIR, name);
    try {
        if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
        if (fs.existsSync(file) && fs.statSync(file).size >= MAX_FILE_BYTES) {
            for (let i = MAX_FILES; i >= 1; i--) {
                const previous = i === 1 ? file : `${file}.${i - 1}`;
                if (fs.existsSync(previous)) fs.renameSync(previous, `${file}.${i}`);
            }
        }
        fs.appendFileSync(file, content);
    } catch (error) {
        process.stderr.write(`Failed to write log: ${String(error)}\n`);
    }
}
