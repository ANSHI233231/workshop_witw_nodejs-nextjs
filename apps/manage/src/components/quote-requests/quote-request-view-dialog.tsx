'use client';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import type { QuoteRequest } from '@/types/quote-request.types';

import { markLabelOf, packageTextOf, QUOTE_STATUS_BADGE, receivedTextOf, startTextOf } from './quote-request-format';

export function QuoteRequestViewDialog({
    request,
    onClose,
}: {
    readonly request: QuoteRequest;
    readonly onClose: () => void;
}) {
    const t = useT();
    const badge = QUOTE_STATUS_BADGE[request.status];
    return (
        <div className="overlay" onClick={onClose}>
            <div
                className="modal "
                role="dialog"
                aria-modal="true"
                aria-labelledby="qr-view-t"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="qr-view-t">
                        {t('Quote request')}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <dl className="ss-dl">
                        <dt>{t('User')}</dt>
                        <dd>{request.user.name}</dd>
                        <dt>{t('Email')}</dt>
                        <dd>{request.user.email ?? '–'}</dd>
                        <dt>{t('Mobile')}</dt>
                        <dd>{request.user.mobile ?? '–'}</dd>
                        <dt>{t('Package')}</dt>
                        <dd>{packageTextOf(request)}</dd>
                        <dt>{t('Partner')}</dt>
                        <dd>{request.partner.businessName}</dd>
                        <dt>{t('Travellers')}</dt>
                        <dd>{request.travellerCount}</dd>
                        <dt>{t('Start date')}</dt>
                        <dd>{startTextOf(request)}</dd>
                        <dt>{t('Notes')}</dt>
                        <dd>{request.notes}</dd>
                        <dt>{t('Received')}</dt>
                        <dd>{receivedTextOf(request)}</dd>
                        <dt>{t('Mark')}</dt>
                        <dd>{t(markLabelOf(request.mark))}</dd>
                        <dt>{t('Status')}</dt>
                        <dd>{t(badge.label)}</dd>
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
