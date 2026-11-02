import { CronExpressionParser } from 'cron-parser';

import { JOB_TIME_ZONE } from '../types/job.types';

const CRON_FIELDS = 5;

const MINUTE_MS = 60_000;

export const isCronExpression = (expression: string): boolean => {
    if (expression.trim().split(/\s+/).length !== CRON_FIELDS) return false;
    try {
        CronExpressionParser.parse(expression, { tz: JOB_TIME_ZONE });
        return true;
    } catch {
        return false;
    }
};

export const nextRunsOf = (expression: string, from: Date, count: number): Date[] => {
    const parsed = CronExpressionParser.parse(expression, { tz: JOB_TIME_ZONE, currentDate: from });
    return Array.from({ length: count }, () => parsed.next().toDate());
};

export const minuteOf = (date: Date): Date => new Date(Math.floor(date.getTime() / MINUTE_MS) * MINUTE_MS);

export const isDueAt = (expression: string, minute: Date): boolean => {
    try {
        const [next] = nextRunsOf(expression, new Date(minute.getTime() - 1), 1);
        return next?.getTime() === minute.getTime();
    } catch {
        return false;
    }
};
