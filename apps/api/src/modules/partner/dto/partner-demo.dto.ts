import type { PartnerStatusCode } from '../types/partner.types';

export type DemoAccountDetails = {
    readonly name: string;
    readonly email: string;
    readonly mobile: string;
};

export type DemoPartner = {
    readonly account: DemoAccountDetails;
    readonly business: {
        readonly businessName: string;
        readonly ownerName: string;
        readonly businessPhone: string;
        readonly businessEmail: string;
        readonly about: string | null;
        readonly parkNames: readonly string[];
        readonly status: PartnerStatusCode;
        readonly rejectReason: string | null;
        readonly isPhoneShown: boolean;
        readonly requestedDaysAgo: number;
        readonly decidedDaysAgo: number | null;
    } | null;
};

export type DemoPartnerState = {
    readonly email: string;
    readonly hasAccount: boolean;
    readonly hasPartner: boolean;
    readonly userId: number | null;
    readonly partnerId: number | null;
};

export type DemoPartnerOutcome = {
    readonly email: string;
    readonly userId: number;
    readonly accountCreated: boolean;
    readonly partnerId: number | null;
    readonly partnerCreated: boolean;
    readonly missingParks: readonly string[];
};
