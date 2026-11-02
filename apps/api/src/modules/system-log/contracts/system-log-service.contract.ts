import type { LogAppDto, LogDownload, LogLinesDto } from '../dto/system-log.dto';
import type { LogApp } from '../types/system-log.types';

export interface ISystemLogService {
    apps(): Promise<LogAppDto[]>;
    lines(app: LogApp, name: string, endLine: number | undefined, limit: number): Promise<LogLinesDto>;
    download(app: LogApp, name: string): Promise<LogDownload>;
}
