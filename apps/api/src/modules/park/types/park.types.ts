import type { RowDataPacket } from '../../../database/connection';

export const ParkStatus = { ACTIVE: 1, INACTIVE: 2 } as const;

export type ParkStatusCode = (typeof ParkStatus)[keyof typeof ParkStatus];

export const ParkRegion = {
    NORTH_INDIA: 1,
    CENTRAL_INDIA: 2,
    WEST_INDIA: 3,
    EAST_INDIA: 4,
    SOUTH_INDIA: 5,
    NORTH_EAST_INDIA: 6,
} as const;

export type ParkRegionCode = (typeof ParkRegion)[keyof typeof ParkRegion];

export const UpcomingSafariStatus = { ACTIVE: 1, SEAT_FULL: 3 } as const;

export const PARK_TIME_ZONE = 'Asia/Kolkata';

export const PARK_LIMITS = {
    NAME_MAX: 150,
    SEARCH: 100,
    PRICE_MAX: 1_000_000,
    SLUG_MAX: 150,
} as const;

export const PARK_SLUG_FALLBACK = 'park';

export interface ParkRow extends RowDataPacket {
    id: number;
    name: string;
    slug: string;
    region: ParkRegionCode;
    avg_safari_price_min: number | null;
    avg_safari_price_max: number | null;
    status: ParkStatusCode;
    upcoming_safari_count: number;
}

export interface ParkDetailRow extends ParkRow {
    short_description: string | null;
    feature_image: string | null;
    latitude: string | null;
    longitude: string | null;
    official_website: string | null;
}

export interface ParkOptionRow extends RowDataPacket {
    id: number;
    name: string;
}

export interface ParkStateRow extends RowDataPacket {
    id: number;
    name: string;
    status: ParkStatusCode;
}

export interface UpcomingSafariRow extends RowDataPacket {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    status: number;
    host_name: string | null;
}

export interface CountRow extends RowDataPacket {
    total: number;
}
