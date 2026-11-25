import type { Database } from '../../../database/connection';
import type { IPartnerRepository } from '../contracts/partner-repository.contract';
import type { IPartnerService } from '../contracts/partner-service.contract';
import type { PartnerParkDto, PartnerRef, PublicPartnerDto } from '../dto/partner.dto';
import { parksByPartner, toPartnerRef } from '../mappers/partner.mapper';
import { ParkStatus } from '../../park';
import { PARTNER_STATUSES, PartnerStatus } from '../types/partner.types';

export class PartnerService implements IPartnerService {
    constructor(
        private readonly db: Database,
        private readonly repository: IPartnerRepository,
    ) {}

    async activePartnerOf(userId: number): Promise<PartnerRef | null> {
        const row = await this.repository.findByUserId(this.db, userId);
        return row?.status === PartnerStatus.ACTIVE ? toPartnerRef(row) : null;
    }

    async partnerOf(userId: number): Promise<PartnerRef | null> {
        const row = await this.repository.findByUserId(this.db, userId);
        return row && PARTNER_STATUSES.includes(row.status) ? toPartnerRef(row) : null;
    }

    async partnersOf(userIds: readonly number[]): Promise<ReadonlyMap<number, PartnerRef>> {
        const rows = await this.repository.findByUserIds(this.db, [...new Set(userIds)]);
        return new Map(
            rows.filter((row) => PARTNER_STATUSES.includes(row.status)).map((row) => [row.user_id, toPartnerRef(row)]),
        );
    }

    async parksOf(partnerId: number): Promise<PartnerParkDto[]> {
        return parksByPartner(await this.repository.parksOf(this.db, [partnerId])).get(partnerId) ?? [];
    }

    async activePartnerById(partnerId: number): Promise<PublicPartnerDto | null> {
        const row = await this.repository.findById(this.db, partnerId);
        if (row?.status !== PartnerStatus.ACTIVE) return null;
        const parks = await this.parksOf(partnerId);
        return {
            id: row.id,
            userId: row.user_id,
            businessName: row.business_name,
            about: row.about,
            logoVersion: row.logo,
            activeParkIds: parks.filter((park) => park.status === ParkStatus.ACTIVE).map((park) => park.id),
        };
    }
}
