import { initialsOf } from '@/components/partner/partner-rules';
import { partnerLogoUrl } from '@/services/partner.service';
import type { Partner } from '@/types/partner.types';

export function PartnerLogoBox({ partner }: { readonly partner: Partner }) {
    return (
        <span className="pk-logo-box">
            {partner.logoVersion ? (
                <img src={partnerLogoUrl(partner.id, partner.logoVersion)} alt="" />
            ) : (
                initialsOf(partner.businessName)
            )}
        </span>
    );
}
