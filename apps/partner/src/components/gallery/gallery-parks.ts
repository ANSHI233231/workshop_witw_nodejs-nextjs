import type { MyPartnerRequest, ParkOption } from '@/types/partner.types';

const ACTIVE_PARK = 1;

export const activeParksOf = (request: MyPartnerRequest | null): readonly ParkOption[] =>
    (request?.parks ?? [])
        .filter((park) => park.status === ACTIVE_PARK)
        .map((park) => ({ id: park.id, name: park.name }))
        .sort((a, b) => a.name.localeCompare(b.name));
