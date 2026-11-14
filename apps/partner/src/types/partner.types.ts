export const PartnerStatus = { PENDING: 1, REJECTED: 2, ACTIVE: 3, INACTIVE: 4 } as const;

export type PartnerStatusCode = (typeof PartnerStatus)[keyof typeof PartnerStatus];

export const PARTNER_LIMITS = {
    BUSINESS_NAME_MAX: 255,
    OWNER_NAME_MAX: 255,
    BUSINESS_EMAIL_MAX: 254,
    ABOUT_MAX: 2000,
    REJECT_REASON_MAX: 512,
    SEARCH: 100,
    LOGO_MAX_BYTES: 1024 * 1024,
} as const;

export const BUSINESS_PHONE_PATTERN = /^[6-9]\d{9}$/;

export const BUSINESS_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LOGO_CONTENT_TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/webp'];

export const LOGO_ACCEPT = '.jpg,.jpeg,.png,.webp';

export type PartnerPark = {
    readonly id: number;
    readonly name: string;
    readonly status: number;
};

export type ParkOption = { readonly id: number; readonly name: string };

export type PartnerBusinessInput = {
    readonly businessName: string;
    readonly ownerName: string;
    readonly businessPhone: string;
    readonly businessEmail: string;
    readonly about: string | null;
    readonly masterParkIds: readonly number[];
};

export type PartnerAccount = {
    readonly id: number;
    readonly name: string;
    readonly email: string | null;
    readonly mobile: string | null;
};

export type MyPartnerRequest = {
    readonly id: number;
    readonly businessName: string;
    readonly ownerName: string;
    readonly businessPhone: string;
    readonly businessEmail: string;
    readonly about: string | null;
    readonly logoVersion: string | null;
    readonly parks: readonly PartnerPark[];
    readonly status: PartnerStatusCode;
    readonly rejectReason: string | null;
    readonly requestedAt: string;
    readonly decidedAt: string | null;
    readonly approvedAt: string | null;
};
