import type { PartnerStatusCode } from './partner.types';

export type PartnerListScope = {
    readonly statuses: readonly PartnerStatusCode[];
    readonly search: string | undefined;
    readonly order: 'requests' | 'partners';
};

export type DemoPartnerRow = {
    readonly userId: number;
    readonly businessName: string;
    readonly ownerName: string;
    readonly businessPhone: string;
    readonly businessEmail: string;
    readonly about: string | null;
    readonly isPhoneShown: boolean;
    readonly status: PartnerStatusCode;
    readonly rejectReason: string | null;
    readonly requestedAt: Date;
    readonly decidedAt: Date | null;
    readonly decidedBy: number | null;
    readonly approvedAt: Date | null;
};
