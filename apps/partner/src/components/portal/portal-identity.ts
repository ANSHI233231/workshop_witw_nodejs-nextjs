import type { Translate } from '@/lib/i18n/locale';
import type { AuthUser } from '@/types/auth.types';
import type { MyPartnerRequest } from '@/types/partner.types';
import { isPartner, type PartnerState } from '@/types/portal.types';

export type PortalIdentity = {
    readonly name: string;
    readonly initials: string;
    readonly email: string | null;
    readonly roleLine: (t: Translate) => string;
};

const REQUEST_STATE_LABEL: Readonly<Record<PartnerState, string>> = {
    none: 'not sent',
    pending: 'Pending',
    rejected: 'Rejected',
    active: 'Active',
    inactive: 'Inactive',
};

export const initialsOf = (name: string): string =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('');

export const portalIdentityOf = (
    user: AuthUser,
    request: MyPartnerRequest | null,
    state: PartnerState,
): PortalIdentity => {
    const name = request && isPartner(state) ? request.businessName : user.name;
    return {
        name,
        initials: initialsOf(name),
        email: user.email,
        roleLine: (t) =>
            state === 'active'
                ? t('Partner')
                : t('Partner request: {state}', { state: t(REQUEST_STATE_LABEL[state]) }),
    };
};
