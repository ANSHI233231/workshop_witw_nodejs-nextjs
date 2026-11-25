import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PartnerProfileView } from '@/components/profile/partner-profile';
import { SiteBanner } from '@/components/website/witw-site-frame';
import { ApiError } from '@/services/api-error';
import { getPartnerProfile } from '@/services/profile.service';
import type { PartnerProfile } from '@/types/profile.types';

const HOME = '/';

const PARTNER_NOT_FOUND = 'PARTNER_PROFILE_NOT_FOUND';

const loadPartner = async (rawId: string): Promise<PartnerProfile> => {
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) redirect(HOME);
    try {
        return await getPartnerProfile(id);
    } catch (error) {
        if (error instanceof ApiError && error.code === PARTNER_NOT_FOUND) redirect(HOME);
        throw error;
    }
};

export const generateMetadata = async ({ params }: { readonly params: Promise<{ readonly id: string }> }): Promise<Metadata> => {
    const id = Number((await params).id);
    try {
        return { title: Number.isInteger(id) && id > 0 ? (await getPartnerProfile(id)).businessName : 'Walk Into The Wild' };
    } catch {
        return { title: 'Walk Into The Wild' };
    }
};

export default async function PartnerProfilePage({ params }: { readonly params: Promise<{ readonly id: string }> }) {
    const partner = await loadPartner((await params).id);
    return (
        <>
            <SiteBanner title={partner.businessName} />
            <PartnerProfileView partner={partner} />
        </>
    );
}
