import type {
    ParkDetailDto,
    ParkDto,
    ParkOptionDto,
    ParkPrice,
    ParkPriceRange,
    ParkStateDto,
    UpcomingSafariDto,
    WebsiteParkCardDto,
    WebsiteParkPageDto,
} from '../dto/park.dto';
import type {
    ParkDetailRow,
    ParkOptionRow,
    ParkRow,
    ParkStateRow,
    UpcomingSafariRow,
    WebsiteParkPageRow,
    WebsiteParkRow,
} from '../types/park.types';

const numberOrNull = (value: number | string | null): number | null => (value === null ? null : Number(value));

export const NO_PRICE: ParkPrice = { avgSafariPriceMin: null, avgSafariPriceMax: null, packageCount: 0 };

export const toParkPrice = (range: ParkPriceRange): ParkPrice => ({
    avgSafariPriceMin: range.lowestPricePerPerson,
    avgSafariPriceMax: range.highestPricePerPerson,
    packageCount: range.packageCount,
});

export const toParkOption = (row: ParkOptionRow): ParkOptionDto => ({ id: row.id, name: row.name });

export const toParkState = (row: ParkStateRow): ParkStateDto => ({ id: row.id, name: row.name, status: row.status });

export const toPark = (row: ParkRow, price: ParkPrice): ParkDto => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    region: row.region,
    featureImage: row.feature_image,
    ...price,
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

export const toParkDetail = (
    row: ParkDetailRow,
    price: ParkPrice,
    upcoming: readonly UpcomingSafariRow[],
): ParkDetailDto => ({
    ...toPark(row, price),
    shortDescription: row.short_description,
    latitude: numberOrNull(row.latitude),
    longitude: numberOrNull(row.longitude),
    officialWebsite: row.official_website,
    upcomingSafaris: upcoming.map(toUpcomingSafari),
});

export const toWebsiteParkCard = (row: WebsiteParkRow, price: ParkPrice): WebsiteParkCardDto => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    region: row.region,
    featureImage: row.feature_image,
    ...price,
});

export const toWebsiteParkPage = (row: WebsiteParkPageRow, price: ParkPrice): WebsiteParkPageDto => ({
    ...toWebsiteParkCard(row, price),
    shortDescription: row.short_description,
    latitude: numberOrNull(row.latitude),
    longitude: numberOrNull(row.longitude),
    officialWebsite: row.official_website,
});

export const editableFieldsOf = (row: ParkDetailRow): Readonly<Record<string, unknown>> => ({
    name: row.name,
    region: row.region,
    shortDescription: row.short_description,
    latitude: numberOrNull(row.latitude),
    longitude: numberOrNull(row.longitude),
    status: row.status,
});
