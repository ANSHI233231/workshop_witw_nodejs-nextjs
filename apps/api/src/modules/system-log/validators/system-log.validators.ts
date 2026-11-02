import { z } from 'zod';

import { LOG_APPS, LOG_FILE_NAME, LOG_LIMITS } from '../types/system-log.types';

const fileParams = z.object({
    app: z.enum(LOG_APPS, { errorMap: () => ({ message: 'This log file was not found.' }) }),
    name: z.string().regex(LOG_FILE_NAME, 'This log file was not found.'),
});

export const logLinesSchema = z.object({
    params: fileParams,
    query: z.object({
        endLine: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().min(1).max(LOG_LIMITS.MAX_LINES).default(LOG_LIMITS.DEFAULT_LINES),
    }),
});

export const logFileSchema = z.object({ params: fileParams });

export type LogFileParams = z.infer<typeof fileParams>;

export type LogLinesQuery = z.infer<typeof logLinesSchema>['query'];
