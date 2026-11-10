import type { ParkDetailDto, ParkDto, ParkOptionDto, ParkStateDto, UpcomingSafariDto } from '../dto/park.dto';
import type { ParkDetailRow, ParkOptionRow, ParkRow, ParkStateRow, UpcomingSafariRow } from '../types/park.types';

const numberOrNull = (value: number | string | null): number | null => (value === null ? null : Number(value));

export const toParkOption = (row: ParkOptionRow): ParkOptionDto => ({ id: row.id, name: row.name });

export const toParkState = (row: ParkStateRow): ParkStateDto => ({ id: row.id, name: row.name, status: row.status });

export const toPark = (row: ParkRow): ParkDto => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    region: row.region,
    avgSafariPriceMin: numberOrNull(row.avg_safari_price_min),
    avgSafariPriceMax: numberOrNull(row.avg_safari_price_max),
    upcomingSafariCount: Number(row.upcoming_safari_count),
    status: row.status,
});

export const toUpcomingSafari = (row: UpcomingSafariRow): UpcomingSafariDto => ({
    id: row.id,
    title: row.title,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    hostName: row.host_name ?? '',
});

export const toParkDetail = (row: ParkDetailRow, upcoming: readonly UpcomingSafariRow[]): ParkDetailDto => ({
    ...toPark(row),
    shortDescription: row.short_description,
    featureImage: row.feature_image,
    latitude: numberOrNull(row.latitude),
    longitude: numberOrNull(row.longitude),
    officialWebsite: row.official_website,
    upcomingSafaris: upcoming.map(toUpcomingSafari),
});
