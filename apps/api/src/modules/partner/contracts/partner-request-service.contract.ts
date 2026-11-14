import type { SignedInSession } from '../../auth';
import type { BusinessDetails, MyPartnerRequestDto, PartnerLogo, SignedUpPartner } from '../dto/partner.dto';
import type { PartnerAccountDetails } from './partner-account.contract';

export interface IPartnerRequestService {
    mine(userId: number): Promise<MyPartnerRequestDto | null>;
    send(userId: number, details: BusinessDetails): Promise<MyPartnerRequestDto>;
    sendWithAccount(
        account: PartnerAccountDetails,
        details: BusinessDetails,
    ): Promise<SignedUpPartner<SignedInSession>>;
    sendAgain(userId: number, details: BusinessDetails): Promise<MyPartnerRequestDto>;
    myLogo(userId: number): Promise<PartnerLogo>;
    partnerLogo(partnerId: number): Promise<PartnerLogo>;
    setMyLogo(userId: number, content: Buffer): Promise<MyPartnerRequestDto>;
    removeMyLogo(userId: number): Promise<MyPartnerRequestDto>;
}
