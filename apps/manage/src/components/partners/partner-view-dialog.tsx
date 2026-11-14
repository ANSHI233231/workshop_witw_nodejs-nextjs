'use client';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { formatDate } from '@/lib/format';
import type { Partner } from '@/types/partner.types';

import { PARTNER_STATUS_BADGE, parkNamesOf } from './partner-format';

export function PartnerViewDialog({ partner, onClose }: { readonly partner: Partner; readonly onClose: () => void }) {
    const t = useT();
    const badge = PARTNER_STATUS_BADGE[partner.status];
    return (
        <div className="overlay" onClick={onClose}>
            <div
                className="modal "
                role="dialog"
                aria-modal="true"
                aria-labelledby="pt-view-t"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="pt-view-t">
                        {partner.businessName}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <dl className="ss-dl">
                        <dt>{t('Business name')}</dt>
                        <dd>{partner.businessName}</dd>
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
                            {partner.account.name} · {partner.account.email ?? '–'}
                        </dd>
                        <dt>{t('Partner since')}</dt>
                        <dd>{partner.approvedAt ? formatDate(partner.approvedAt) : '–'}</dd>
                        <dt>{t('Status')}</dt>
                        <dd>
                            <span className={badge.className}>{t(badge.label)}</span>
                        </dd>
                    </dl>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
