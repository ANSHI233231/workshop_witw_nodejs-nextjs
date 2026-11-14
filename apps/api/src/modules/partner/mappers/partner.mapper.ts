import type { MyPartnerRequestDto, PartnerDto, PartnerParkDto, PartnerRef } from '../dto/partner.dto';
import type { PartnerParkRow, PartnerRow } from '../types/partner.types';

const isoOf = (value: Date | null): string | null => (value === null ? null : value.toISOString());

const toPark = (row: PartnerParkRow): PartnerParkDto => ({ id: row.id, name: row.name, status: row.status });

export const parksByPartner = (rows: readonly PartnerParkRow[]): ReadonlyMap<number, PartnerParkDto[]> => {
    const parks = new Map<number, PartnerParkDto[]>();
    for (const row of rows) parks.set(row.partner_id, [...(parks.get(row.partner_id) ?? []), toPark(row)]);
    return parks;
};

export const toMyRequest = (row: PartnerRow, parks: readonly PartnerParkDto[]): MyPartnerRequestDto => ({
    id: row.id,
    businessName: row.business_name,
    ownerName: row.owner_name,
    businessPhone: row.business_phone,
    businessEmail: row.business_email,
    about: row.about,
    logoVersion: row.logo,
    parks,
    status: row.status,
    rejectReason: row.reject_reason,
    requestedAt: row.requested_at.toISOString(),
    decidedAt: isoOf(row.decided_at),
    approvedAt: isoOf(row.approved_at),
});

export const toPartner = (row: PartnerRow, parks: readonly PartnerParkDto[]): PartnerDto => ({
    ...toMyRequest(row, parks),
    isPhoneShown: row.is_phone_shown === 1,
    account: { id: row.user_id, name: row.user_name ?? '', email: row.user_email, mobile: row.user_mobile },
    livePackageCount: Number(row.live_package_count),
});

export const toPartnerRef = (row: PartnerRow): PartnerRef => ({
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    status: row.status,
    logoVersion: row.logo,
    isPhoneShown: row.is_phone_shown === 1,
});
