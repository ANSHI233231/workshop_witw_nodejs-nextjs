import type { Metadata } from 'next';

import { SafariList } from '@/components/shared-safari/safari-list';
import { SignedUpWelcome } from '@/components/sign-in/signed-up-welcome';
import { SiteBanner } from '@/components/website/witw-site-frame';
import { consoleSession } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Shared Safaris'),
});

export default async function SharedSafarisPage() {
    const { t } = await serverTranslator();
    const session = await consoleSession();
    return (
        <>
            <SiteBanner
                title={t('Join or Organize a Shared Safari')}
                text={t('Plan a safari, share your seats, find people to go with.')}
            />
            <div className="page">
                <SafariList signedIn={session !== null} />
            </div>
            <SignedUpWelcome />
        </>
    );
}
