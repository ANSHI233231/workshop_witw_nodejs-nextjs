import type { PaginationQuery } from '../../../core/validation';
import type { BusinessDetails, PartnerDto, PartnerFilters, PartnerLogo, PartnerPage } from '../dto/partner.dto';
import type { PartnerStatusCode } from '../types/partner.types';

export interface IPartnerConsoleService {
    listRequests(filters: PartnerFilters, pagination: PaginationQuery): Promise<PartnerPage>;
    requestDetail(id: number): Promise<PartnerDto>;
    approve(id: number, actorId: number): Promise<PartnerDto>;
    reject(id: number, reason: string, actorId: number): Promise<PartnerDto>;
    listPartners(filters: PartnerFilters, pagination: PaginationQuery): Promise<PartnerPage>;
    partnerDetail(id: number): Promise<PartnerDto>;
    edit(id: number, details: BusinessDetails, actorId: number): Promise<PartnerDto>;
    logo(id: number): Promise<PartnerLogo>;
    setLogo(id: number, content: Buffer, actorId: number): Promise<PartnerDto>;
    removeLogo(id: number, actorId: number): Promise<PartnerDto>;
    setPhoneShown(id: number, isPhoneShown: boolean, actorId: number): Promise<PartnerDto>;
    setStatus(id: number, status: PartnerStatusCode, actorId: number): Promise<PartnerDto>;
}
