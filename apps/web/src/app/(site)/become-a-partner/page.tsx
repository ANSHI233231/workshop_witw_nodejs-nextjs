import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { BecomeAPartner } from '@/components/partner/become-a-partner';
import { SiteBanner } from '@/components/website/witw-site-frame';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { consoleSession } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { getMyPartnerRequest } from '@/services/partner.service';
import { listActiveParks } from '@/services/shared-safari.service';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Become a Partner'),
});

export default async function BecomeAPartnerPage() {
    const { t } = await serverTranslator();
    const session = await consoleSession();
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const [request, parks] = await Promise.all([
        session ? getMyPartnerRequest(accessToken) : Promise.resolve(null),
        listActiveParks(),
    ]);
    return (
        <>
            <SiteBanner title={t('Become a Partner')} text={t('Sell your safari packages on Walk Into The Wild.')} />
            <div className="page">
                <BecomeAPartner signedIn={session !== null} request={request} parks={parks} />
            </div>
        </>
    );
}
