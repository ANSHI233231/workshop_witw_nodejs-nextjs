import type { Translate } from '@/lib/i18n/locale';

export const SchedulePreset = {
    EVERY_MINUTE: 'every-minute',
    EVERY_5: 'every-5',
    EVERY_10: 'every-10',
    EVERY_15: 'every-15',
    EVERY_30: 'every-30',
    HOURLY: 'hourly',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    CRON: 'cron',
} as const;

export type SchedulePresetKey = (typeof SchedulePreset)[keyof typeof SchedulePreset];

export const PRESET_OPTIONS: readonly { readonly value: SchedulePresetKey; readonly label: string }[] = [
    { value: SchedulePreset.EVERY_MINUTE, label: 'Every minute' },
    { value: SchedulePreset.EVERY_5, label: 'Every 5 minutes' },
    { value: SchedulePreset.EVERY_10, label: 'Every 10 minutes' },
    { value: SchedulePreset.EVERY_15, label: 'Every 15 minutes' },
    { value: SchedulePreset.EVERY_30, label: 'Every 30 minutes' },
    { value: SchedulePreset.HOURLY, label: 'Hourly' },
    { value: SchedulePreset.DAILY, label: 'Daily' },
    { value: SchedulePreset.WEEKLY, label: 'Weekly' },
    { value: SchedulePreset.MONTHLY, label: 'Monthly' },
    { value: SchedulePreset.CRON, label: 'Cron expression' },
];

export const WEEK_DAYS: readonly string[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

export type ScheduleDraft = {
    readonly preset: SchedulePresetKey;
    readonly minute: number;
    readonly time: string;
    readonly weekDay: number;
    readonly monthDay: number;
    readonly cron: string;
};

const STEP_PRESETS: Readonly<Record<string, SchedulePresetKey>> = {
    '5': SchedulePreset.EVERY_5,
    '10': SchedulePreset.EVERY_10,
    '15': SchedulePreset.EVERY_15,
    '30': SchedulePreset.EVERY_30,
};

const STEP_OF: Partial<Record<SchedulePresetKey, number>> = {
    [SchedulePreset.EVERY_5]: 5,
    [SchedulePreset.EVERY_10]: 10,
    [SchedulePreset.EVERY_15]: 15,
    [SchedulePreset.EVERY_30]: 30,
};

const twoDigits = (value: number): string => String(value).padStart(2, '0');

const NUMBER = /^\d{1,2}$/;

const inRange = (text: string | undefined, min: number, max: number): boolean =>
    text !== undefined && NUMBER.test(text) && Number(text) >= min && Number(text) <= max;

export const DEFAULT_DRAFT: ScheduleDraft = {
    preset: SchedulePreset.DAILY,
    minute: 0,
    time: '02:00',
    weekDay: 1,
    monthDay: 1,
    cron: '',
};

export const draftOf = (expression: string): ScheduleDraft => {
    const cron = expression.trim().replace(/\s+/g, ' ');
    const base = { ...DEFAULT_DRAFT, cron };
    const parts = cron.split(' ');
    if (parts.length !== 5) return { ...base, preset: SchedulePreset.CRON };
    const [minute, hour, monthDay, month, weekDay] = parts;
    if (cron === '* * * * *') return { ...base, preset: SchedulePreset.EVERY_MINUTE };
    const step = minute?.startsWith('*/') ? STEP_PRESETS[minute.slice(2)] : undefined;
    if (step && hour === '*' && monthDay === '*' && month === '*' && weekDay === '*') return { ...base, preset: step };
    if (!inRange(minute, 0, 59) || month !== '*') return { ...base, preset: SchedulePreset.CRON };
    const minuteNumber = Number(minute);
    if (hour === '*' && monthDay === '*' && weekDay === '*') {
        return { ...base, preset: SchedulePreset.HOURLY, minute: minuteNumber };
    }
    if (!inRange(hour, 0, 23)) return { ...base, preset: SchedulePreset.CRON };
    const time = `${twoDigits(Number(hour))}:${twoDigits(minuteNumber)}`;
    if (monthDay === '*' && weekDay === '*') return { ...base, preset: SchedulePreset.DAILY, time };
    if (monthDay === '*' && inRange(weekDay, 0, 6)) {
        return { ...base, preset: SchedulePreset.WEEKLY, time, weekDay: Number(weekDay) };
    }
    if (weekDay === '*' && inRange(monthDay, 1, 31)) {
        return { ...base, preset: SchedulePreset.MONTHLY, time, monthDay: Number(monthDay) };
    }
    return { ...base, preset: SchedulePreset.CRON };
};

const timeParts = (time: string): readonly [number, number] => {
    const [hour, minute] = time.split(':').map(Number);
    return [hour ?? 0, minute ?? 0];
};

export const expressionOf = (draft: ScheduleDraft): string => {
    const [hour, minute] = timeParts(draft.time);
    switch (draft.preset) {
        case SchedulePreset.EVERY_MINUTE:
            return '* * * * *';
        case SchedulePreset.HOURLY:
            return `${draft.minute} * * * *`;
        case SchedulePreset.DAILY:
            return `${minute} ${hour} * * *`;
        case SchedulePreset.WEEKLY:
            return `${minute} ${hour} * * ${draft.weekDay}`;
        case SchedulePreset.MONTHLY:
            return `${minute} ${hour} ${draft.monthDay} * *`;
        case SchedulePreset.CRON:
            return draft.cron.trim();
        default:
            return `*/${STEP_OF[draft.preset] ?? 5} * * * *`;
    }
};

export const scheduleWords = (t: Translate, expression: string): string => {
    const draft = draftOf(expression);
    const time = draft.time;
    switch (draft.preset) {
        case SchedulePreset.EVERY_MINUTE:
            return t('Every minute');
        case SchedulePreset.EVERY_5:
        case SchedulePreset.EVERY_10:
        case SchedulePreset.EVERY_15:
        case SchedulePreset.EVERY_30:
            return t('Every {count} minutes', { count: STEP_OF[draft.preset] ?? 0 });
        case SchedulePreset.HOURLY:
            return t('Every hour at minute {minute}', { minute: twoDigits(draft.minute) });
        case SchedulePreset.DAILY:
            return t('Every day at {time}', { time });
        case SchedulePreset.WEEKLY:
            return t('Every {day} at {time}', { day: t(WEEK_DAYS[draft.weekDay] ?? ''), time });
        case SchedulePreset.MONTHLY:
            return t('Every month on day {day} at {time}', { day: draft.monthDay, time });
        default:
            return t('Cron expression');
    }
};
