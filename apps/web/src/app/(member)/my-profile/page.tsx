import type { Metadata } from 'next';

import { EditProfile } from '@/components/profile/edit-profile';
import { SiteBanner } from '@/components/website/witw-site-frame';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { requireMember } from '@/lib/member-session';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Edit Profile'),
});

export default async function MyProfileRoute() {
    const { t } = await serverTranslator();
    await requireMember('/my-profile', { partnerGoesHome: false });
    return (
        <>
            <SiteBanner title={t('Edit Profile')} />
            <EditProfile />
        </>
    );
}
