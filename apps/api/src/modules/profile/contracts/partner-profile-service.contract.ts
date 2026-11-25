import type { PartnerPackagesPage, PartnerParksPage, PartnerProfileDto } from '../dto/profile.dto';

export interface IPartnerProfileService {
    header(partnerId: number): Promise<PartnerProfileDto>;
    packages(partnerId: number, page: number): Promise<PartnerPackagesPage>;
    parks(partnerId: number, page: number): Promise<PartnerParksPage>;
}
