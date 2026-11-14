import type { RowDataPacket } from '../../../database/connection';

export const PartnerStatus = { PENDING: 1, REJECTED: 2, ACTIVE: 3, INACTIVE: 4 } as const;

export type PartnerStatusCode = (typeof PartnerStatus)[keyof typeof PartnerStatus];

export const PartnerParkStatus = { ACTIVE: 1, REMOVED: -1 } as const;

export const REQUEST_STATUSES: readonly PartnerStatusCode[] = [PartnerStatus.PENDING, PartnerStatus.REJECTED];

export const PARTNER_STATUSES: readonly PartnerStatusCode[] = [PartnerStatus.ACTIVE, PartnerStatus.INACTIVE];

export const SHOWN_PACKAGE_WEBSITE_STATUS = 2;

export const PARTNER_LIMITS = {
    BUSINESS_NAME_MAX: 255,
    OWNER_NAME_MAX: 255,
    BUSINESS_EMAIL_MAX: 254,
    ABOUT_MAX: 2000,
    REJECT_REASON_MAX: 512,
    PARKS_MAX: 100,
    SEARCH: 100,
    LOGO_MAX_BYTES: 1024 * 1024,
} as const;

export const BUSINESS_PHONE_PATTERN = /^[6-9]\d{9}$/;

export const BUSINESS_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LOGO_FOLDER = { PARENT: 'partner', FEATURE: 'logo' } as const;

export const LOGO_CONTENT_TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/webp'];

export interface PartnerRow extends RowDataPacket {
    id: number;
    user_id: number;
    business_name: string;
    owner_name: string;
    business_phone: string;
    business_email: string;
    about: string | null;
    logo: string | null;
    is_phone_shown: number;
    reject_reason: string | null;
    requested_at: Date;
    decided_at: Date | null;
    approved_at: Date | null;
    status: PartnerStatusCode;
    user_name: string | null;
    user_email: string | null;
    user_mobile: string | null;
    live_package_count: number;
}

export interface PartnerParkRow extends RowDataPacket {
    partner_id: number;
    id: number;
    name: string;
    status: number;
}

export interface CountRow extends RowDataPacket {
    total: number;
}
