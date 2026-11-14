import type { Metadata } from 'next';

import { QuoteRequestList } from '@/components/quote/quote-request-list';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { readAccessToken, requireActivePartner } from '@/lib/portal-session';
import { listPortalQuoteRequests } from '@/services/quote-request.service';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Quote Requests'),
});

export default async function QuoteRequestsPage() {
    await requireActivePartner();
    return <QuoteRequestList list={await listPortalQuoteRequests(await readAccessToken())} />;
}
