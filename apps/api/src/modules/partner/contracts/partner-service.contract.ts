import type { PartnerParkDto, PartnerRef, PublicPartnerDto } from '../dto/partner.dto';

export interface IPartnerService {
    activePartnerOf(userId: number): Promise<PartnerRef | null>;
    partnerOf(userId: number): Promise<PartnerRef | null>;
    partnersOf(userIds: readonly number[]): Promise<ReadonlyMap<number, PartnerRef>>;
    parksOf(partnerId: number): Promise<PartnerParkDto[]>;
    activePartnerById(partnerId: number): Promise<PublicPartnerDto | null>;
}
