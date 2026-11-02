import { type Translate, translate } from '@/lib/i18n/locale';

const INDIA_DATE = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Kolkata',
});

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

const DAYS_BEFORE_TODAY = { yday: 1, dby: 2, d7: 6, d15: 14 } as const;

export type DatePresetKey = 'all' | 'today' | 'yday' | 'dby' | 'd7' | 'd15' | 'month' | 'custom';

export type DateRange = { readonly from: string | undefined; readonly to: string | undefined };

export const DATE_PRESETS: readonly { readonly key: DatePresetKey; readonly label: string }[] = [
    { key: 'all', label: 'All Dates' },
    { key: 'today', label: 'Today' },
    { key: 'yday', label: 'Yesterday' },
    { key: 'dby', label: 'Day Before Yesterday' },
    { key: 'd7', label: 'Last 7 Days' },
    { key: 'd15', label: 'Last 15 Days' },
    { key: 'month', label: 'This Month' },
    { key: 'custom', label: 'Custom Range' },
];

const isoOf = (date: Date): string => date.toISOString().slice(0, 10);

const dateOf = (iso: string): Date => new Date(`${iso}T00:00:00Z`);

export const todayInIndia = (): string => INDIA_DATE.format(new Date());

const shifted = (iso: string, change: (date: Date) => void): string => {
    const date = dateOf(iso);
    change(date);
    return isoOf(date);
};

const daysBefore = (today: string, days: number): string =>
    shifted(today, (date) => date.setUTCDate(date.getUTCDate() - days));

export const presetRange = (key: DatePresetKey, today: string): DateRange => {
    const month = today.slice(0, 7);
    switch (key) {
        case 'today':
            return { from: today, to: today };
        case 'yday':
        case 'dby': {
            const day = daysBefore(today, DAYS_BEFORE_TODAY[key]);
            return { from: day, to: day };
        }
        case 'd7':
        case 'd15':
            return { from: daysBefore(today, DAYS_BEFORE_TODAY[key]), to: today };
        case 'month':
            return {
                from: `${month}-01`,
                to: shifted(`${month}-01`, (date) => date.setUTCMonth(date.getUTCMonth() + 1, 0)),
            };
        default:
            return { from: undefined, to: undefined };
    }
};

export const presetOf = (range: DateRange, today: string): DatePresetKey => {
    if (!range.from && !range.to) return 'all';
    const match = DATE_PRESETS.find(
        (preset) =>
            preset.key !== 'all' &&
            preset.key !== 'custom' &&
            presetRange(preset.key, today).from === range.from &&
            presetRange(preset.key, today).to === range.to,
    );
    return match?.key ?? 'custom';
};

const shortDate = (iso: string): string => `${iso.slice(8, 10)} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;

export const longDate = (iso: string): string => `${shortDate(iso)} ${iso.slice(0, 4)}`;

const untranslated: Translate = (text, values) => translate({}, text, values);

export const rangeLabel = (range: DateRange, today: string, t: Translate = untranslated): string => {
    const preset = presetOf(range, today);
    if (preset !== 'custom') return t(DATE_PRESETS.find((item) => item.key === preset)?.label ?? '');
    if (range.from && range.to) return `${shortDate(range.from)} – ${shortDate(range.to)}`;
    if (range.from) return t('From {date}', { date: shortDate(range.from) });
    return t('Until {date}', { date: shortDate(range.to ?? today) });
};
