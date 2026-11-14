import type { AuthUser } from './auth.types';
import { type MyPartnerRequest, PartnerStatus, type PartnerStatusCode } from './partner.types';

export type PartnerState = 'none' | 'pending' | 'rejected' | 'active' | 'inactive';

const STATE_OF_STATUS: Readonly<Record<PartnerStatusCode, PartnerState>> = {
    [PartnerStatus.PENDING]: 'pending',
    [PartnerStatus.REJECTED]: 'rejected',
    [PartnerStatus.ACTIVE]: 'active',
    [PartnerStatus.INACTIVE]: 'inactive',
};

export const partnerStateOf = (request: MyPartnerRequest | null): PartnerState =>
    request ? STATE_OF_STATUS[request.status] : 'none';

export const isPartner = (state: PartnerState): boolean => state === 'active' || state === 'inactive';

export type PortalSession = {
    readonly user: AuthUser;
    readonly request: MyPartnerRequest | null;
    readonly state: PartnerState;
};

export const DEACTIVATED_MESSAGE =
    'Your account has been deactivated. Please contact the administrator for further assistance.';
