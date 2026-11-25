import type { Metadata } from 'next';

import { MessagesPage } from '@/components/chat/messages-page';
import { SiteBanner } from '@/components/website/witw-site-frame';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { requireMember } from '@/lib/member-session';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Messages'),
});

export default async function MessagesRoute({
    searchParams,
}: {
    readonly searchParams: Promise<{ readonly with?: string | string[] }>;
}) {
    const { t } = await serverTranslator();
    await requireMember('/messages', { partnerGoesHome: true });
    const chosen = (await searchParams).with;
    const withUser = Number(Array.isArray(chosen) ? chosen[0] : chosen);
    return (
        <>
            <SiteBanner title={t('Messages')} />
            <MessagesPage withUserId={Number.isInteger(withUser) && withUser > 0 ? withUser : null} />
        </>
    );
}
