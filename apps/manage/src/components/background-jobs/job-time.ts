const INDIA = 'Asia/Kolkata';

const INDIA_OFFSET = '+05:30';

const CLOCK = new Intl.DateTimeFormat('en-GB', {
    timeZone: INDIA,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
});

const LOCAL_INPUT = new Intl.DateTimeFormat('en-CA', {
    timeZone: INDIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});

export const formatClock = (date: Date): string =>
    CLOCK.format(date).replace(/\b(am|pm)\b/, (period) => period.toUpperCase());

export const indiaInputValue = (date: Date): string => {
    const parts = Object.fromEntries(LOCAL_INPUT.formatToParts(date).map((part) => [part.type, part.value]));
    return `${parts['year']}-${parts['month']}-${parts['day']}T${parts['hour']}:${parts['minute']}`;
};

export const isoFromIndiaInput = (value: string): string | null => {
    if (!value) return null;
    const date = new Date(`${value}:00${INDIA_OFFSET}`);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
};
