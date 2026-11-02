const COUNT_FORMAT = new Intl.NumberFormat('en-IN');

const DATE_PARTS = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
});

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

const TEN_DIGIT_MOBILE = /^\d{10}$/;

export const formatCount = (value: number): string => COUNT_FORMAT.format(value);

export const formatDate = (isoDateTime: string): string => {
    const parts = Object.fromEntries(
        DATE_PARTS.formatToParts(new Date(isoDateTime)).map((part) => [part.type, part.value]),
    );
    return `${parts['day']} ${MONTHS[Number(parts['month']) - 1]} ${parts['year']}`;
};

export const formatMobile = (mobile: string): string =>
    TEN_DIGIT_MOBILE.test(mobile) ? `${mobile.slice(0, 5)} ${mobile.slice(5)}` : mobile;

const DATE_TIME_PARTS = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
});

export const formatDateTime = (isoDateTime: string): string => {
    const parts = Object.fromEntries(
        DATE_TIME_PARTS.formatToParts(new Date(isoDateTime)).map((part) => [part.type, part.value]),
    );
    const dayPeriod = String(parts['dayPeriod'] ?? '').toUpperCase();
    return `${parts['day']} ${MONTHS[Number(parts['month']) - 1]} ${parts['year']}, ${parts['hour']}:${parts['minute']} ${dayPeriod}`;
};

const SIZE_UNITS = ['B', 'KiB', 'MiB', 'GiB'] as const;

export const formatFileSize = (bytes: number): string => {
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
        value /= 1024;
        unit += 1;
    }
    return unit === 0 ? `${value} B` : `${value.toFixed(1)} ${SIZE_UNITS[unit]}`;
};
