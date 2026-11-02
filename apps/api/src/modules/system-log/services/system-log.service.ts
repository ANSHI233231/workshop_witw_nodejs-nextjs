import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline';

import { NotFoundException } from '../../../core/exceptions';
import type { ISystemLogService } from '../contracts/system-log-service.contract';
import type { LogAppDto, LogDownload, LogFileCopyDto, LogFileDto, LogLinesDto } from '../dto/system-log.dto';
import { LOG_APPS, LOG_COPIES, LOG_FILE_NAME, LOG_FILES, LOG_LIMITS, type LogApp } from '../types/system-log.types';

type FoundFile = { readonly sizeBytes: number; readonly updatedAt: string };

const notFound = (): NotFoundException => new NotFoundException('This log file was not found.', 'LOG_FILE_NOT_FOUND');

const statOf = async (filePath: string): Promise<FoundFile | undefined> => {
    try {
        const info = await stat(filePath);
        return info.isFile() ? { sizeBytes: info.size, updatedAt: info.mtime.toISOString() } : undefined;
    } catch {
        return undefined;
    }
};

const eachLine = async (filePath: string, visit: (line: string, number: number) => boolean): Promise<number> => {
    const reader = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });
    let number = 0;
    for await (const line of reader) {
        number += 1;
        if (!visit(line, number)) {
            reader.close();
            break;
        }
    }
    return number;
};

export class SystemLogService implements ISystemLogService {
    constructor(private readonly directories: Readonly<Record<string, string>>) {}

    async apps(): Promise<LogAppDto[]> {
        return Promise.all(
            LOG_APPS.map(async (app) => {
                const directory = this.directories[app];
                if (!directory) return { app, isConfigured: false, files: [] };
                const files = await Promise.all(LOG_FILES.map((file) => this.fileOf(directory, file)));
                return { app, isConfigured: true, files: files.filter((file): file is LogFileDto => file !== null) };
            }),
        );
    }

    async lines(app: LogApp, name: string, endLine: number | undefined, limit: number): Promise<LogLinesDto> {
        const filePath = await this.existingPath(app, name);
        const totalLines = await eachLine(filePath, () => true);
        const last = endLine === undefined ? totalLines : Math.min(endLine, totalLines);
        const size = Math.min(Math.max(limit, 1), LOG_LIMITS.MAX_LINES);
        const first = Math.max(1, last - size + 1);
        const lines: string[] = [];
        if (last > 0) {
            await eachLine(filePath, (line, number) => {
                if (number >= first) lines.push(line);
                return number < last;
            });
        }
        return {
            app,
            name,
            lines,
            totalLines,
            startLine: last > 0 ? first : 0,
            endLine: last,
            hasMore: last > 0 && first > 1,
        };
    }

    async download(app: LogApp, name: string): Promise<LogDownload> {
        const filePath = await this.existingPath(app, name);
        const found = await statOf(filePath);
        if (!found) throw notFound();
        return { name: `${app}-${name}`, path: filePath, sizeBytes: found.sizeBytes };
    }

    private async fileOf(directory: string, file: string): Promise<LogFileDto | null> {
        const name = `${file}.log`;
        const [current, ...copies] = await Promise.all(
            [name, ...Array.from({ length: LOG_COPIES }, (_, index) => `${name}.${index + 1}`)].map((candidate) =>
                statOf(path.join(directory, candidate)),
            ),
        );
        const olderCopies = copies.flatMap((found, index): LogFileCopyDto[] =>
            found ? [{ name: `${name}.${index + 1}`, copy: index + 1, ...found }] : [],
        );
        if (!current && olderCopies.length === 0) return null;
        return {
            file: file as LogFileDto['file'],
            name,
            sizeBytes: current?.sizeBytes ?? 0,
            updatedAt: current?.updatedAt ?? null,
            copies: olderCopies,
        };
    }

    private async existingPath(app: LogApp, name: string): Promise<string> {
        const directory = this.directories[app];
        if (!directory || !LOG_FILE_NAME.test(name)) throw notFound();
        const filePath = path.join(directory, name);
        if (path.dirname(filePath) !== path.resolve(directory) || !(await statOf(filePath))) throw notFound();
        return filePath;
    }
}
