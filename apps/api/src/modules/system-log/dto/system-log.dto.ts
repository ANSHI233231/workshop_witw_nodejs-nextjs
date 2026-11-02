import type { LogApp, LogFile } from '../types/system-log.types';

export type LogFileCopyDto = {
    readonly name: string;
    readonly copy: number;
    readonly sizeBytes: number;
    readonly updatedAt: string;
};

export type LogFileDto = {
    readonly file: LogFile;
    readonly name: string;
    readonly sizeBytes: number;
    readonly updatedAt: string | null;
    readonly copies: readonly LogFileCopyDto[];
};

export type LogAppDto = {
    readonly app: LogApp;
    readonly isConfigured: boolean;
    readonly files: readonly LogFileDto[];
};

export type LogLinesDto = {
    readonly app: LogApp;
    readonly name: string;
    readonly lines: readonly string[];
    readonly totalLines: number;
    readonly startLine: number;
    readonly endLine: number;
    readonly hasMore: boolean;
};

export type LogDownload = {
    readonly name: string;
    readonly path: string;
    readonly sizeBytes: number;
};
