import { NotFoundException } from '../../../core/exceptions';
import type { IPackageService } from '../../package';
import type { IParkService } from '../../park';
import type { IPartnerService, PublicPartnerDto } from '../../partner';
import type { IPartnerProfileService } from '../contracts/partner-profile-service.contract';
import type { PartnerPackagesPage, PartnerParksPage, PartnerProfileDto } from '../dto/profile.dto';
import { PROFILE_LIMITS } from '../types/profile.types';
import { PROFILE_MESSAGES } from '../validators/profile.validators';

const partnerNotFound = (): NotFoundException =>
    new NotFoundException(PROFILE_MESSAGES.PARTNER_NOT_FOUND, 'PARTNER_PROFILE_NOT_FOUND');

const FIRST_PAGE = 1;

export class PartnerProfileService implements IPartnerProfileService {
    constructor(
        private readonly partnerService: IPartnerService,
        private readonly packageService: IPackageService,
        private readonly parkService: IParkService,
    ) {}

    async header(partnerId: number): Promise<PartnerProfileDto> {
        const partner = await this.activePartner(partnerId);
        const [packages, parks] = await Promise.all([
            this.packageService.listShownOfPartner(partnerId, FIRST_PAGE),
            this.parkService.websiteCardsOf(partner.activeParkIds),
        ]);
        return {
            id: partner.id,
            businessName: partner.businessName,
            about: partner.about,
            logoVersion: partner.logoVersion,
            packageCount: packages.total,
            parkCount: parks.length,
        };
    }

    async packages(partnerId: number, page: number): Promise<PartnerPackagesPage> {
        await this.activePartner(partnerId);
        return this.packageService.listShownOfPartner(partnerId, page);
    }

    async parks(partnerId: number, page: number): Promise<PartnerParksPage> {
        const partner = await this.activePartner(partnerId);
        const cards = await this.parkService.websiteCardsOf(partner.activeParkIds);
        const size = PROFILE_LIMITS.PAGE_SIZE;
        return {
            items: cards.slice((page - 1) * size, page * size),
            total: cards.length,
            page,
            pageSize: size,
            hasMore: page * size < cards.length,
        };
    }

    private async activePartner(partnerId: number): Promise<PublicPartnerDto> {
        const partner = await this.partnerService.activePartnerById(partnerId);
        if (!partner) throw partnerNotFound();
        return partner;
    }
}
