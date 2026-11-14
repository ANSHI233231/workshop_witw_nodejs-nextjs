import type { Database } from '../../../database/connection';
import type { IPartnerRepository } from '../contracts/partner-repository.contract';
import type { IPartnerService } from '../contracts/partner-service.contract';
import type { PartnerParkDto, PartnerRef } from '../dto/partner.dto';
import { parksByPartner, toPartnerRef } from '../mappers/partner.mapper';
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
}
