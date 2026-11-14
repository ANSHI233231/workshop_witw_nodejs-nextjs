import type { Metadata } from 'next';
import Link from 'next/link';

import { PageBreadcrumb } from '@/components/portal/page-breadcrumb';
import { PartnerGuardCard } from '@/components/portal/partner-guard-card';
import { PartnerRequestForm } from '@/components/partner-request/partner-request-form';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { formatDateTime } from '@/lib/format';
import { requireSignedIn } from '@/lib/portal-session';
import { listActiveParks } from '@/services/partner.service';
import { DEACTIVATED_MESSAGE } from '@/types/portal.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Partner request'),
});

export default async function PartnerRequestPage() {
    const { request, state } = await requireSignedIn();
    const { t } = await serverTranslator();
    const breadcrumb = (
        <PageBreadcrumb
            portalLabel={t('Partner Portal')}
            pageLabel={t('Partner request')}
            ariaLabel={t('Breadcrumb')}
        />
    );

    if (state === 'inactive') {
        return (
            <div className="page">
                <PartnerGuardCard locked title={t('Account deactivated')} text={t(DEACTIVATED_MESSAGE)} />
            </div>
        );
    }

    if (state === 'active') {
        return (
            <div className="page">
                <PartnerGuardCard
                    approved
                    title={t('Your partner request is approved')}
                    text={t('You can now add packages and galleries.')}
                    action={
                        <Link className="btn btn-primary" href="/">
                            {t('Go to Dashboard')}
                        </Link>
                    }
                />
            </div>
        );
    }

    if (state === 'pending' && request) {
        return (
            <div className="page">
                <div>
                    {breadcrumb}
                    <div className="page-head">
                        <h1 className="page-title">{t('Partner request')}</h1>
                    </div>
                </div>
                <div className="pk-status">
                    <span>
                        <span className="badge badge-warning">{t('Pending')}</span>
                    </span>
                    <h2>{t('Your request is waiting for approval')}</h2>
                    <p>{t('The portal opens once the Super Admin approves your request.')}</p>
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
                        <dt>{t('Sent on')}</dt>
                        <dd>{formatDateTime(request.requestedAt)}</dd>
                    </dl>
                </div>
            </div>
        );
    }

    const parks = await listActiveParks();

    if (state === 'rejected' && request) {
        return (
            <div className="page">
                <div>
                    {breadcrumb}
                    <div className="page-head">
                        <h1 className="page-title">{t('Partner request')}</h1>
                    </div>
                </div>
                <div className="banner banner-danger" role="alert" style={{ marginBottom: 'var(--space-lg)' }}>
                    <b>{t('Your request was not approved.')}</b> {request.rejectReason}
                </div>
                <PartnerRequestForm request={request} parks={parks} />
            </div>
        );
    }

    return (
        <div className="page">
            <div>
                {breadcrumb}
                <div className="page-head">
                    <h1 className="page-title">{t('Become a Partner')}</h1>
                </div>
            </div>
            <p className="ss-muted" style={{ margin: '0 0 var(--space-lg)' }}>
                {t('Tell us about your business. The Super Admin checks and approves every request.')}
            </p>
            <PartnerRequestForm request={null} parks={parks} />
        </div>
    );
}
