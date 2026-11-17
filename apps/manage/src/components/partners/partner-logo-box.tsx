import { useT } from '@/hooks/i18n/use-t';
import { partnerLogoUrl } from '@/services/partner.service';
import type { Partner } from '@/types/partner.types';

export function PartnerLogoBox({ partner }: { readonly partner: Partner }) {
    const t = useT();
    return (
        <span className="pk-logo-box">
            {partner.logoVersion ? (
                <img src={partnerLogoUrl(partner.id, partner.logoVersion)} alt="" />
            ) : (
                <img className="pk-logo-default" src="/witw/logo.png" alt={t('No logo yet')} />
            )}
        </span>
    );
}
