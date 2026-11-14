import type { PartnerParkDto, PartnerRef } from '../dto/partner.dto';

export interface IPartnerService {
    activePartnerOf(userId: number): Promise<PartnerRef | null>;
    partnerOf(userId: number): Promise<PartnerRef | null>;
    partnersOf(userIds: readonly number[]): Promise<ReadonlyMap<number, PartnerRef>>;
    parksOf(partnerId: number): Promise<PartnerParkDto[]>;
}
