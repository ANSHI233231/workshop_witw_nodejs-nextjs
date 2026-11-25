import type { PartnerStatusCode } from '../types/partner.types';

export type BusinessDetails = {
    readonly businessName: string;
    readonly ownerName: string;
    readonly businessPhone: string;
    readonly businessEmail: string;
    readonly about: string | null;
    readonly masterParkIds: readonly number[];
};

export type PartnerParkDto = {
    readonly id: number;
    readonly name: string;
    readonly status: number;
};

export type PartnerAccountDto = {
    readonly id: number;
    readonly name: string;
    readonly email: string | null;
    readonly mobile: string | null;
};

export type PartnerDto = {
    readonly id: number;
    readonly businessName: string;
    readonly ownerName: string;
    readonly businessPhone: string;
    readonly businessEmail: string;
    readonly about: string | null;
    readonly logoVersion: string | null;
    readonly parks: readonly PartnerParkDto[];
    readonly status: PartnerStatusCode;
    readonly rejectReason: string | null;
    readonly isPhoneShown: boolean;
    readonly requestedAt: string;
    readonly decidedAt: string | null;
    readonly approvedAt: string | null;
    readonly account: PartnerAccountDto;
    readonly livePackageCount: number;
};

export type MyPartnerRequestDto = Omit<PartnerDto, 'account' | 'isPhoneShown' | 'livePackageCount'>;

export type PartnerRef = {
    readonly id: number;
    readonly userId: number;
    readonly businessName: string;
    readonly status: PartnerStatusCode;
    readonly logoVersion: string | null;
    readonly isPhoneShown: boolean;
};

export type PublicPartnerDto = {
    readonly id: number;
    readonly userId: number;
    readonly businessName: string;
    readonly about: string | null;
    readonly logoVersion: string | null;
    readonly activeParkIds: readonly number[];
};

export type PartnerFilters = {
    readonly search: string | undefined;
    readonly status: PartnerStatusCode | undefined;
};

export type PartnerPage = {
    readonly items: readonly PartnerDto[];
    readonly total: number;
};

export type PartnerLogo = {
    readonly content: Buffer;
    readonly contentType: string;
};

export type SignedUpPartner<S> = {
    readonly session: S;
    readonly request: MyPartnerRequestDto;
};
