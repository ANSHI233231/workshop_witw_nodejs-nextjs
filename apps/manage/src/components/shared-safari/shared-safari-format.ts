import {
    ADMIN_DELETE_REASON_LABEL,
    type ConsoleSafari,
    type ConsoleSafariDetail,
    SafariStatus,
    type SafariStatusCode,
} from '@/types/shared-safari.types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

const RUPEES = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

const STAMP_PARTS = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Kolkata',
});

export const NO_VALUE = '–';

export const DEFAULT_COVER = '/witw/default-cover.jpg';

type Badge = { readonly className: string; readonly label: string };

export const SAFARI_STATUS_BADGE: Readonly<Record<SafariStatusCode, Badge>> = {
    [SafariStatus.ACTIVE]: { className: 'badge badge-success', label: 'Active' },
    [SafariStatus.SEAT_FULL]: { className: 'badge badge-warning', label: 'Seat full' },
    [SafariStatus.INACTIVE]: { className: 'badge badge-neutral', label: 'Inactive' },
    [SafariStatus.DELETED_BY_ADMIN]: { className: 'badge badge-danger', label: 'Deleted by admin' },
    [SafariStatus.DELETED_BY_HOST]: { className: 'badge badge-neutral', label: 'Deleted by host' },
};

export const statusBadge = (status: SafariStatusCode): Badge =>
    SAFARI_STATUS_BADGE[status] ?? SAFARI_STATUS_BADGE[SafariStatus.INACTIVE];

const dayOf = (isoDate: string) => {
    const [year = '', month = '', day = ''] = isoDate.split('-');
    return { year: Number(year), month: MONTHS[Number(month) - 1] ?? '', day: Number(day) };
};

export const consoleDates = (startDate: string, endDate: string): string => {
    const start = dayOf(startDate);
    const end = dayOf(endDate);
    return start.month === end.month
        ? `${start.day}–${end.day} ${start.month}`
        : `${start.day} ${start.month} – ${end.day} ${end.month}`;
};

export const longDates = (startDate: string, endDate: string): string => {
    const start = dayOf(startDate);
    const end = dayOf(endDate);
    const startYear = start.year !== end.year ? ` ${start.year}` : '';
    return `${start.day} ${start.month}${startYear} – ${end.day} ${end.month} ${end.year}`;
};

export const stamp = (isoDateTime: string): string => {
    const parts = Object.fromEntries(
        STAMP_PARTS.formatToParts(new Date(isoDateTime)).map((part) => [part.type, part.value]),
    );
    return `${parts['day']} ${MONTHS[Number(parts['month']) - 1]} ${parts['year']} ${parts['hour']}:${parts['minute']}`;
};

export const rupees = (amount: number): string => `₹${RUPEES.format(amount)}`;

export const seatsShort = (safari: ConsoleSafari): string => `${safari.sharedSeats}/${safari.totalSeats}`;

export const deleteReasonLabel = (safari: ConsoleSafariDetail): string =>
    safari.deleteReason === null ? NO_VALUE : (ADMIN_DELETE_REASON_LABEL[safari.deleteReason] ?? NO_VALUE);
