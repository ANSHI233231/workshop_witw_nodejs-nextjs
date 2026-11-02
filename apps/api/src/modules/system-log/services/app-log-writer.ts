import { logger, type LogLevel, type LogRecord, redact } from '../../../core/logger';
import type { Database } from '../../../database/connection';
import type { IAppLogRepository } from '../contracts/app-log-repository.contract';
import type { IngestedLog, NewAppLog } from '../dto/app-log.dto';
import {
    APP_LOG_LIMITS,
    AppLogLevel,
    type AppLogLevelCode,
    AppLogSource,
    type AppLogSourceCode,
} from '../types/app-log.types';

const log = logger.category('app-log');

const LEVEL_CODE: Readonly<Record<LogLevel, AppLogLevelCode>> = {
    error: AppLogLevel.ERROR,
    warn: AppLogLevel.WARNING,
    info: AppLogLevel.INFO,
    debug: AppLogLevel.DEBUG,
};

const cut = (text: string | null | undefined, max: number): string | null =>
    text === null || text === undefined ? null : text.length > max ? text.slice(0, max) : text;

const contextJson = (context: Readonly<Record<string, unknown>> | null | undefined): string | null => {
    if (!context || Object.keys(context).length === 0) return null;
    const json = JSON.stringify(context);
    return json.length > APP_LOG_LIMITS.CONTEXT
        ? JSON.stringify({ truncated: json.slice(0, APP_LOG_LIMITS.CONTEXT) })
        : json;
};

const userIdOf = (value: string | number | null | undefined): number | null => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const fromRecord = (record: LogRecord): NewAppLog => ({
    sourceApp: AppLogSource.API,
    logLevel: LEVEL_CODE[record.level],
    category: cut(record.category, APP_LOG_LIMITS.CATEGORY) ?? '',
    message: cut(record.message, APP_LOG_LIMITS.MESSAGE) ?? '',
    errorName: cut(record.error?.name, APP_LOG_LIMITS.ERROR_NAME),
    errorMessage: cut(record.error?.message, APP_LOG_LIMITS.ERROR_MESSAGE),
    errorStack: cut(record.error?.stack, APP_LOG_LIMITS.STACK),
    logContext: contextJson(record.context),
    requestId: cut(record.request?.requestId, APP_LOG_LIMITS.REQUEST_ID),
    ipAddress: cut(record.request?.ip, APP_LOG_LIMITS.IP),
    userId: userIdOf(record.request?.userId),
    httpMethod: cut(record.request?.method, APP_LOG_LIMITS.METHOD),
    requestUrl: cut(record.request?.url, APP_LOG_LIMITS.URL),
    clientApp: record.request?.clientApp ?? null,
    userAgent: cut(record.request?.userAgent, APP_LOG_LIMITS.USER_AGENT),
    loggedAt: record.loggedAt,
});

export const fromIngested = (sourceApp: AppLogSourceCode, entry: IngestedLog): NewAppLog => ({
    sourceApp,
    logLevel: AppLogLevel.ERROR,
    category: entry.category,
    message: entry.message,
    errorName: entry.errorName ?? null,
    errorMessage: entry.errorMessage ?? null,
    errorStack: entry.errorStack ?? null,
    logContext: contextJson(entry.context ? (redact(entry.context) as Record<string, unknown>) : undefined),
    requestId: entry.requestId ?? null,
    ipAddress: entry.ipAddress ?? null,
    userId: entry.userId ?? null,
    httpMethod: entry.httpMethod ?? null,
    requestUrl: entry.requestUrl ?? null,
    clientApp: null,
    userAgent: entry.userAgent ?? null,
    loggedAt: new Date(entry.loggedAt),
});

export class AppLogWriter {
    private buffer: NewAppLog[] = [];
    private dropped = 0;
    private flushing = false;

    constructor(
        private readonly db: Database,
        private readonly repository: IAppLogRepository,
    ) {
        setInterval(() => void this.flush(), APP_LOG_LIMITS.FLUSH_EVERY_MS).unref();
    }

    readonly sink = (record: LogRecord): void => {
        this.add([fromRecord(record)]);
    };

    add(rows: readonly NewAppLog[]): void {
        this.buffer.push(...rows);
        const overflow = this.buffer.length - APP_LOG_LIMITS.BUFFER;
        if (overflow > 0) {
            this.buffer.splice(0, overflow);
            this.dropped += overflow;
        }
    }

    private async flush(): Promise<void> {
        if (this.flushing || (this.buffer.length === 0 && this.dropped === 0)) return;
        this.flushing = true;
        try {
            await this.write();
        } finally {
            this.flushing = false;
        }
    }

    private async write(): Promise<void> {
        await logger.withoutRecords(async () => {
            if (this.dropped > 0) {
                log.warn('Log rows dropped before reaching the database (buffer full)', { dropped: this.dropped });
                this.dropped = 0;
            }
            while (this.buffer.length > 0) {
                const batch = this.buffer.slice(0, APP_LOG_LIMITS.WRITE_BATCH);
                try {
                    await this.repository.insertMany(this.db, batch);
                    this.buffer.splice(0, batch.length);
                } catch (error) {
                    log.error('Log rows could not be saved in the database', { rows: batch.length, error });
                    this.buffer.splice(0, batch.length);
                    break;
                }
            }
        });
    }
}
