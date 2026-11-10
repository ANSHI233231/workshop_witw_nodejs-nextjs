import { formatCount } from './format';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
] as const;

const DAY_MS = 86_400_000;

const AGO_DAYS_LIMIT = 30;

const INDIA_DATE = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

type DateParts = { readonly y: number; readonly m: number; readonly d: number };

const partsOf = (isoDate: string): DateParts => {
    const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number);
    return { y: y ?? 0, m: (m ?? 1) - 1, d: d ?? 1 };
};

const pad = (value: number): string => String(value).padStart(2, '0');

export const todayInIndia = (): string => INDIA_DATE.format(new Date());

export const yearAheadOf = (isoDate: string): string => `${Number(isoDate.slice(0, 4)) + 1}${isoDate.slice(4)}`;

export const rupees = (value: number): string => `₹${formatCount(Math.round(value))}`;

export const priceRange = (from: number, to: number): string => `${rupees(from)} – ${rupees(to)}`;

export const monthShort = (isoDate: string): string => MONTHS[partsOf(isoDate).m] ?? '';

export const dayOfMonth = (isoDate: string): number => partsOf(isoDate).d;

export const dateRange = (start: string, end: string): string => {
    const a = partsOf(start);
    const b = partsOf(end);
    return `${a.d} ${MONTHS[a.m]}${a.y !== b.y ? ` ${a.y}` : ''} – ${b.d} ${MONTHS[b.m]} ${b.y}`;
};

export const dateRangeShort = (start: string, end: string): string => {
    const a = partsOf(start);
    const b = partsOf(end);
    if (a.m === b.m && a.y === b.y) return `${a.d}–${b.d} ${MONTHS[a.m]} ${a.y}`;
    return `${a.d} ${MONTHS[a.m]} – ${b.d} ${MONTHS[b.m]} ${b.y}`;
};

const utcDay = (parts: DateParts): number => Date.UTC(parts.y, parts.m, parts.d);

export const tripDays = (start: string, end: string): number =>
    Math.round((utcDay(partsOf(end)) - utcDay(partsOf(start))) / DAY_MS) + 1;

export const shortDate = (isoDateTime: string): string => {
    const local = partsOf(INDIA_DATE.format(new Date(isoDateTime)));
    return `${pad(local.d)} ${MONTHS[local.m]} ${local.y}`;
};

export const daysAgo = (isoDateTime: string): number =>
    Math.round(
        (utcDay(partsOf(todayInIndia())) - utcDay(partsOf(INDIA_DATE.format(new Date(isoDateTime))))) / DAY_MS,
    );

export const isWithinAgoDays = (days: number): boolean => days < AGO_DAYS_LIMIT;

export const wordCount = (text: string): number => text.split(' ').filter((word) => word.trim().length > 0).length;

export const wholeNumber = (text: string): number | null => {
    const value = text.replace(/,/g, '').trim();
    return /^\d+$/.test(value) ? Number.parseInt(value, 10) : null;
};
