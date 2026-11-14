'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { SiteToast } from '@/components/shared-safari/site-toast';
import { MailStateIcon } from '@/components/shared-safari/safari-icons';
import { SITE_PATHS } from '@/components/website/witw-site-frame';
import { useT } from '@/hooks/i18n/use-t';
import { useSiteToast } from '@/hooks/shared-safari/use-site-toast';
import { useIsPhone } from '@/hooks/ui/use-is-phone';
import { config } from '@/lib/config';
import { formatDate, formatStamp } from '@/lib/format';
import { ApiError } from '@/services/api-error';
import { listMyQuoteRequests } from '@/services/quote-request.service';
import type { MyQuoteRequest, MyQuoteRequests } from '@/types/quote-request.types';

const packagePath = (request: MyQuoteRequest): string => `${SITE_PATHS.packages}/${encodeURIComponent(request.package.slug)}`;

const startText = (request: MyQuoteRequest): string => formatDate(`${request.startDate}T00:00:00+05:30`);

export function MyQuoteRequestsScreen() {
    const t = useT();
    const isPhone = useIsPhone();
    const { toast, showError, hide } = useSiteToast();
    const [answer, setAnswer] = useState<MyQuoteRequests | null>(null);

    useEffect(() => {
        let active = true;
        listMyQuoteRequests()
            .then((result) => {
                if (active) setAnswer(result);
            })
            .catch((error: unknown) => {
                if (active) showError(error instanceof ApiError ? error.message : t('This could not be done. Please try again.'));
            });
        return () => {
            active = false;
        };
    }, [showError, t]);

    if (!answer) return <SiteToast toast={toast} onClose={hide} />;

    if (answer.isPartner) {
        return (
            <div className="pk-status">
                <h2>{t('Quote requests are in the Partner portal')}</h2>
                <p>
                    {t(
                        "As a partner you don't send quote requests. The requests for your packages are in the Partner portal.",
                    )}
                </p>
                <a className="btn btn-primary" href={config.partnerPortalUrl} style={{ alignSelf: 'flex-start' }}>
                    {t('Open Partner portal')}
                </a>
            </div>
        );
    }

    const items = answer.items;
    return (
        <>
            <div
                className="wn-head"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-lg)',
                }}
            >
                <span className="wb-count">
                    {t('You have')} <b>{items.length}</b> {t('active quote requests')}
                </span>
            </div>
            <div className="pk-wcard">
                {items.length > 0 &&
                    (isPhone ? (
                        <div>
                            {items.map((request) => (
                                <div key={request.id} className="pk-mq">
                                    <Link href={packagePath(request)}>
                                        <b>{request.package.name}</b>
                                    </Link>
                                    <span className="ss-cap">{request.partner.businessName}</span>
                                    <span className="ss-cap">
                                        {t('{n} travellers · starts {date}', {
                                            n: request.travellerCount,
                                            date: startText(request),
                                        })}
                                    </span>
                                    <span className="ss-muted">{request.notes}</span>
                                    <span className="ss-cap">{t('Sent {date}', { date: formatStamp(request.sentAt) })}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="table-scroll">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col" className="col-sno">
                                            {t('S.No')}
                                        </th>
                                        <th scope="col">{t('Package')}</th>
                                        <th scope="col">{t('Travellers')}</th>
                                        <th scope="col">{t('Start date')}</th>
                                        <th scope="col">{t('Notes')}</th>
                                        <th scope="col">{t('Sent on')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((request, index) => (
                                        <tr key={request.id}>
                                            <td className="col-sno">{index + 1}</td>
                                            <td>
                                                <Link href={packagePath(request)}>
                                                    <b>{request.package.name}</b>
                                                </Link>
                                                <span className="ssc-sub">{request.partner.businessName}</span>
                                            </td>
                                            <td>{request.travellerCount}</td>
                                            <td>{startText(request)}</td>
                                            <td style={{ maxWidth: 360 }}>{request.notes}</td>
                                            <td>{formatStamp(request.sentAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                {items.length === 0 && (
                    <div className="state">
                        <MailStateIcon className="icon state-icon" />
                        <p className="state-title">{t("You haven't sent a quote request yet.")}</p>
                        <Link className="btn btn-primary" href={SITE_PATHS.packages}>
                            {t('Browse packages')}
                        </Link>
                    </div>
                )}
            </div>
            <SiteToast toast={toast} onClose={hide} />
        </>
    );
}
