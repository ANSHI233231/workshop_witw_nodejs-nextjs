'use client';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { type Partner, PartnerStatus } from '@/types/partner.types';

export function PartnerStatusDialog({
    partner,
    busy,
    onConfirm,
    onClose,
}: {
    readonly partner: Partner;
    readonly busy: boolean;
    readonly onConfirm: () => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    const activating = partner.status === PartnerStatus.INACTIVE;
    return (
        <div className="overlay" onClick={onClose}>
            <div
                className="modal is-sm"
                role="dialog"
                aria-modal="true"
                aria-labelledby="pt-status-t"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="pt-status-t">
                        {activating
                            ? t('Activate {name}?', { name: partner.businessName })
                            : t('Deactivate {name}?', { name: partner.businessName })}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <p className="ss-muted" style={{ margin: 0 }}>
                        {activating
                            ? t('Their Active packages show on the website again and the Partner portal opens.')
                            : t(
                                  'All their packages are hidden from the website, and the Partner portal shows only: "Your account has been deactivated. Please contact the administrator for further assistance."',
                              )}
                    </p>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <button
                        type="button"
                        className={activating ? 'btn btn-primary' : 'btn btn-danger'}
                        disabled={busy}
                        onClick={onConfirm}
                    >
                        {activating ? t('Activate') : t('Deactivate')}
                    </button>
                </div>
            </div>
        </div>
    );
}
