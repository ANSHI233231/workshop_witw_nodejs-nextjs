'use client';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { formatDateTime } from '@/lib/format';
import { type Partner, PartnerStatus } from '@/types/partner.types';

import { PARTNER_STATUS_BADGE, parkNamesOf } from './partner-format';
import { PartnerLogoBox } from './partner-logo-box';

export function PartnerRequestViewDialog({
    partner,
    busy,
    onApprove,
    onReject,
    onClose,
}: {
    readonly partner: Partner;
    readonly busy: boolean;
    readonly onApprove: () => void;
    readonly onReject: () => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    const badge = PARTNER_STATUS_BADGE[partner.status];
    const pending = partner.status === PartnerStatus.PENDING;
    return (
        <div className="overlay" onClick={onClose}>
            <div
                className="modal "
                role="dialog"
                aria-modal="true"
                aria-labelledby="pr-view-t"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="pr-view-t">
                        {t('Partner request')}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="ss-stack-lg">
                        <div className="pk-logo">
                            <PartnerLogoBox partner={partner} />
                            <div>
                                <b>{partner.businessName}</b>
                                <br />
                                <span className={badge.className}>{t(badge.label)}</span>
                            </div>
                        </div>
                        <dl className="ss-dl">
                            <dt>{t('Owner name')}</dt>
                            <dd>{partner.ownerName}</dd>
                            <dt>{t('Business phone')}</dt>
                            <dd>{partner.businessPhone}</dd>
                            <dt>{t('Business email')}</dt>
                            <dd>{partner.businessEmail}</dd>
                            <dt>{t('Parks')}</dt>
                            <dd>{parkNamesOf(partner.parks)}</dd>
                            <dt>{t('About')}</dt>
                            <dd>{partner.about || '–'}</dd>
                            <dt>{t('Account')}</dt>
                            <dd>
                                {partner.account.name} · {partner.account.email ?? '–'} · {partner.account.mobile || '–'}
                            </dd>
                            <dt>{t('Sent on')}</dt>
                            <dd>{formatDateTime(partner.requestedAt)}</dd>
                            {partner.status === PartnerStatus.REJECTED && (
                                <>
                                    <dt>{t('Reject reason')}</dt>
                                    <dd>{partner.rejectReason}</dd>
                                </>
                            )}
                        </dl>
                    </div>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Close')}
                    </button>
                    {pending && (
                        <>
                            <button type="button" className="btn btn-secondary ss-danger-link" onClick={onReject}>
                                {t('Reject')}
                            </button>
                            <button type="button" className="btn btn-primary" disabled={busy} onClick={onApprove}>
                                {t('Approve')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
