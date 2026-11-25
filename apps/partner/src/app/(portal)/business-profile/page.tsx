import type { Metadata } from 'next';

import { PageBreadcrumb } from '@/components/portal/page-breadcrumb';
import { config } from '@/lib/config';
import { formatDate } from '@/lib/format';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { requireActivePartner } from '@/lib/portal-session';
import { partnerLogoUrl } from '@/services/partner.service';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Business Profile'),
});

export default async function BusinessProfilePage() {
    const { request } = await requireActivePartner();
    const { t } = await serverTranslator();
    if (!request) return null;
    return (
        <div className="page">
            <div>
                <PageBreadcrumb
                    portalLabel={t('Partner Portal')}
                    pageLabel={t('Business Profile')}
                    ariaLabel={t('Breadcrumb')}
                />
                <div className="page-head">
                    <h1 className="page-title">{t('Business Profile')}</h1>
                    <div className="actions">
                        <a className="btn btn-secondary" href={`${config.websiteUrl}/partners/${request.id}`}>
                            {t('View public page')}
                        </a>
                    </div>
                </div>
            </div>
            <div className="banner banner-info" role="status" style={{ marginBottom: 'var(--space-lg)' }}>
                {t('Only the Super Admin can change these details.')}
            </div>
            <div className="pq-card">
                <div className="pq-prof">
                    <span className="pk-logo-box">
                        {request.logoVersion ? (
                            <img src={partnerLogoUrl(request.logoVersion)} alt={t('Logo')} />
                        ) : (
                            <img className="pk-logo-default" src="/witw/logo.png" alt={t('No logo yet')} />
                        )}
                    </span>
                    <dl className="ss-dl">
                        <dt>{t('Business name')}</dt>
                        <dd>{request.businessName}</dd>
                        <dt>{t('Owner name')}</dt>
                        <dd>{request.ownerName}</dd>
                        <dt>{t('Business phone')}</dt>
                        <dd>{request.businessPhone}</dd>
                        <dt>{t('Business email')}</dt>
                        <dd>{request.businessEmail}</dd>
                        <dt>{t('Parks')}</dt>
                        <dd>{request.parks.map((park) => park.name).join(', ')}</dd>
                        <dt>{t('About')}</dt>
                        <dd>{request.about || '–'}</dd>
                        <dt>{t('Partner since')}</dt>
                        <dd>{request.approvedAt ? formatDate(request.approvedAt) : '–'}</dd>
                    </dl>
                </div>
            </div>
        </div>
    );
}
