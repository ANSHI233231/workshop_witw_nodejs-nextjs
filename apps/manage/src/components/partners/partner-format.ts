import { PartnerStatus, type PartnerStatusCode, type PartnerPark } from '@/types/partner.types';

export const PARTNER_STATUS_BADGE: Readonly<
    Record<PartnerStatusCode, { readonly label: string; readonly className: string }>
> = {
    [PartnerStatus.PENDING]: { label: 'Pending', className: 'badge badge-warning' },
    [PartnerStatus.REJECTED]: { label: 'Rejected', className: 'badge badge-danger' },
    [PartnerStatus.ACTIVE]: { label: 'Active', className: 'badge badge-success' },
    [PartnerStatus.INACTIVE]: { label: 'Inactive', className: 'badge badge-neutral' },
};

export const parkNamesOf = (parks: readonly PartnerPark[]): string => parks.map((park) => park.name).join(', ');
