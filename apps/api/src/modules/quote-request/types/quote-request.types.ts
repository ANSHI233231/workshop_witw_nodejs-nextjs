import type { RowDataPacket } from '../../../database/connection';

export const QuoteRequestStatus = { ACTIVE: 1, INACTIVE: 2 } as const;

export type QuoteRequestStatusCode = (typeof QuoteRequestStatus)[keyof typeof QuoteRequestStatus];

export const QUOTE_REQUEST_STATUSES: readonly QuoteRequestStatusCode[] = [
    QuoteRequestStatus.ACTIVE,
    QuoteRequestStatus.INACTIVE,
];

export const QuoteMark = { HOT: 1, COLD: 2 } as const;

export type QuoteMarkCode = (typeof QuoteMark)[keyof typeof QuoteMark];

export const QUOTE_MARKS: readonly QuoteMarkCode[] = [QuoteMark.HOT, QuoteMark.COLD];

export const QUOTE_LIMITS = {
    TRAVELLERS_MIN: 1,
    TRAVELLERS_MAX: 100,
    NOTES_MAX: 1000,
    MESSAGE_MAX: 255,
    SEARCH: 100,
    USER_NAME_MAX: 150,
} as const;

export const INDIA_TIME_ZONE = 'Asia/Kolkata';

export interface QuoteRequestRow extends RowDataPacket {
    id: number;
    user_id: number;
    partner_id: number;
    package_id: number;
    package_version_id: number;
    traveller_count: number;
    start_date: string;
    notes: string;
    user_name: string;
    user_email: string | null;
    user_mobile: string | null;
    mark: QuoteMarkCode | null;
    marked_at: Date | null;
    status: QuoteRequestStatusCode;
    created_at: Date;
    package_slug: string;
    package_name: string;
    version_number: number;
    business_name: string;
    partner_user_id: number;
}

export interface CountRow extends RowDataPacket {
    total: number;
}

export interface IdRow extends RowDataPacket {
    id: number;
}

export interface DemoVersionRow extends RowDataPacket {
    package_id: number;
    package_version_id: number;
    partner_id: number;
    partner_user_id: number;
    slug: string;
    version_number: number;
    name: string;
}
