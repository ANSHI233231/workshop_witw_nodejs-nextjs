import {
    type Park,
    ParkStatus,
    type ParkStatusCode,
    type UpcomingSafari,
    UpcomingSafariStatus,
} from '@/types/park.types';

const RUPEES = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export const NO_VALUE = '–';

export const rupees = (amount: number): string => `₹${RUPEES.format(amount)}`;

export const parkPriceShort = (park: Park): string =>
    park.avgSafariPriceMin === null || park.avgSafariPriceMax === null
        ? NO_VALUE
        : `${rupees(park.avgSafariPriceMin)}–${RUPEES.format(park.avgSafariPriceMax)}`;

export const parkPriceRange = (park: Park): string | null =>
    park.avgSafariPriceMin === null || park.avgSafariPriceMax === null
        ? null
        : `${rupees(park.avgSafariPriceMin)} – ${rupees(park.avgSafariPriceMax)}`;

export const parkLocation = (latitude: number | null, longitude: number | null): string =>
    latitude === null || longitude === null ? NO_VALUE : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

const dayOf = (isoDate: string) => {
    const [year = '', month = '', day = ''] = isoDate.split('-');
    return { year: Number(year), month: MONTHS[Number(month) - 1] ?? '', day: Number(day) };
};

export const safariDates = (startDate: string, endDate: string): string => {
    const start = dayOf(startDate);
    const end = dayOf(endDate);
    const startYear = start.year !== end.year ? ` ${start.year}` : '';
    return `${start.day} ${start.month}${startYear} – ${end.day} ${end.month} ${end.year}`;
};

export const PARK_STATUS_BADGE: Readonly<Record<ParkStatusCode, { readonly className: string; readonly label: string }>> =
    {
        [ParkStatus.ACTIVE]: { className: 'badge badge-success', label: 'Active' },
        [ParkStatus.INACTIVE]: { className: 'badge badge-neutral', label: 'Inactive' },
    };

export const safariBadge = (safari: UpcomingSafari): { readonly className: string; readonly label: string } =>
    safari.status === UpcomingSafariStatus.SEAT_FULL
        ? { className: 'badge badge-warning', label: 'Seat full' }
        : { className: 'badge badge-success', label: 'Active' };

export const statusToggleLabel = (status: ParkStatusCode): string =>
    status === ParkStatus.ACTIVE ? 'Make inactive' : 'Make active';
