import { PageBreadcrumb } from '@/components/portal/page-breadcrumb';
import { formatCount } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { PortalQuoteRequestList } from '@/types/quote-request.types';

import { QuoteRequestRows } from './quote-request-rows';

export async function QuoteRequestList({ list }: { readonly list: PortalQuoteRequestList }) {
    const { t } = await serverTranslator();
    return (
        <div className="page">
            <div>
                <PageBreadcrumb
                    portalLabel={t('Partner Portal')}
                    pageLabel={t('Quote Requests')}
                    ariaLabel={t('Breadcrumb')}
                />
                <div className="page-head">
                    <h1 className="page-title">{t('Quote Requests')}</h1>
                </div>
            </div>
            <div className="table-card">
                <div className="table-top">
                    <span className="table-total">
                        {t('Active requests')}: <b>{formatCount(list.total)}</b>
                    </span>
                    {!list.isPhoneShown && <span className="ss-cap">{t('Phone numbers are hidden for your account.')}</span>}
                </div>
                <QuoteRequestRows items={list.items} isPhoneShown={list.isPhoneShown} />
            </div>
        </div>
    );
}
