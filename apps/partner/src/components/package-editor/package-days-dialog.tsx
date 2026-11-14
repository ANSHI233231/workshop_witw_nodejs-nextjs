'use client';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';

export function PackageDaysDialog({
    from,
    to,
    busy,
    onCancel,
    onConfirm,
}: {
    readonly from: number;
    readonly to: number;
    readonly busy: boolean;
    readonly onCancel: () => void;
    readonly onConfirm: () => void;
}) {
    const t = useT();
    const single = from === to;
    return (
        <div className="overlay" onClick={onCancel}>
            <div
                className="modal is-sm"
                role="dialog"
                aria-modal="true"
                aria-labelledby="pk-days-t"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="pk-days-t">
                        {single ? t('Remove day {n}?', { n: from }) : t('Remove days {from}–{to}?', { from, to })}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onCancel}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <p className="ss-muted" style={{ margin: 0 }}>
                        {single
                            ? t('You set fewer days. The itinerary for day {n} will be removed from this version.', { n: from })
                            : t(
                                  'You set fewer days. The itinerary for days {from} to {to} will be removed from this version.',
                                  { from, to },
                              )}
                    </p>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        {t('Cancel')}
                    </button>
                    <button type="button" className="btn btn-danger" disabled={busy} onClick={onConfirm}>
                        {t('Remove days')}
                    </button>
                </div>
            </div>
        </div>
    );
}
