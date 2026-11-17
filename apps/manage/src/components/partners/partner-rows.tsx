'use client';

import { EditIcon, ViewIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { usePartnerActions } from '@/hooks/partners/use-partner-actions';
import { formatCount } from '@/lib/format';
import { partnerLogoUrl } from '@/services/partner.service';
import { type ParkOption, type Partner, PartnerStatus } from '@/types/partner.types';

import { PARTNER_STATUS_BADGE, parkNamesOf } from './partner-format';
import { EmptyListIcon, ToggleStatusIcon } from './partner-icons';
import { PartnerEditDialog } from './partner-edit-dialog';
import { PartnerStatusDialog } from './partner-status-dialog';
import { PartnerViewDialog } from './partner-view-dialog';

type Actions = ReturnType<typeof usePartnerActions>;

function RowActions({ partner, actions }: { readonly partner: Partner; readonly actions: Actions }) {
    const t = useT();
    const toggleLabel = partner.status === PartnerStatus.ACTIVE ? t('Deactivate') : t('Activate');
    return (
        <div className="us-acts">
            <button
                type="button"
                className="btn-icon "
                aria-label={t('View')}
                data-tooltip={t('View')}
                onClick={() => actions.view(partner)}
            >
                <ViewIcon />
            </button>
            <button
                type="button"
                className="btn-icon "
                aria-label={t('Edit')}
                data-tooltip={t('Edit')}
                onClick={() => actions.edit(partner)}
            >
                <EditIcon />
            </button>
            <button
                type="button"
                className="btn-icon "
                aria-label={toggleLabel}
                data-tooltip={toggleLabel}
                onClick={() => actions.confirm(partner)}
            >
                <ToggleStatusIcon />
            </button>
        </div>
    );
}

function Business({ partner }: { readonly partner: Partner }) {
    const t = useT();
    return (
        <div className="ss-row" style={{ flexWrap: 'nowrap' }}>
            <span className="avatar">
                {partner.logoVersion ? (
                    <img className="avatar-photo" src={partnerLogoUrl(partner.id, partner.logoVersion)} alt="" />
                ) : (
                    <img className="avatar-photo avatar-photo-default" src="/witw/logo.png" alt={t('No logo yet')} />
                )}
            </span>
            <div className="pq-cell">
                <b>{partner.businessName}</b>
                <span className="ss-cap">{partner.ownerName}</span>
            </div>
        </div>
    );
}

function PhoneSwitch({ partner, actions }: { readonly partner: Partner; readonly actions: Actions }) {
    const t = useT();
    return (
        <div className="ssc-sw">
            <button
                type="button"
                className={partner.isPhoneShown ? 'mt-switch is-on' : 'mt-switch'}
                role="switch"
                aria-checked={partner.isPhoneShown}
                aria-label={t('Show phone numbers to {name}', { name: partner.businessName })}
                disabled={actions.busy === partner.id || actions.refreshing}
                onClick={() => void actions.togglePhone(partner)}
            >
                <span className="mt-knob"></span>
            </button>
        </div>
    );
}

export function PartnerRows({
    rows,
    parks,
    firstSerial,
}: {
    readonly rows: readonly Partner[];
    readonly parks: readonly ParkOption[];
    readonly firstSerial: number;
}) {
    const t = useT();
    const actions = usePartnerActions();
    const { viewing, editing, confirming } = actions;
    const empty = (
        <div className="state">
            <EmptyListIcon />
            <p className="state-title">{t('No partners.')}</p>
        </div>
    );

    return (
        <>
            <div className="table-scroll ssc-only-desktop">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col" className="col-sno">
                                {t('S.No')}
                            </th>
                            <th scope="col">{t('Business')}</th>
                            <th scope="col">{t('Parks')}</th>
                            <th scope="col" className="col-center">
                                {t('Live packages')}
                            </th>
                            <th scope="col">{t('Show phone numbers')}</th>
                            <th scope="col" className="col-status">
                                {t('Status')}
                            </th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((partner, index) => {
                            const badge = PARTNER_STATUS_BADGE[partner.status];
                            return (
                                <tr key={partner.id}>
                                    <td className="col-sno">{formatCount(firstSerial + index)}</td>
                                    <td>
                                        <Business partner={partner} />
                                    </td>
                                    <td>{parkNamesOf(partner.parks)}</td>
                                    <td className="col-center">{formatCount(partner.livePackageCount)}</td>
                                    <td>
                                        <PhoneSwitch partner={partner} actions={actions} />
                                    </td>
                                    <td className="col-status">
                                        <span className={badge.className}>{t(badge.label)}</span>
                                    </td>
                                    <td className="col-actions">
                                        <RowActions partner={partner} actions={actions} />
                                    </td>
                                </tr>
                            );
                        })}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={7}>{empty}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="ssc-list ssc-only-mobile">
                {rows.map((partner, index) => {
                    const badge = PARTNER_STATUS_BADGE[partner.status];
                    return (
                        <div key={partner.id} className="ssc-card">
                            <div className="pq-mrow">{formatCount(firstSerial + index)}</div>
                            <div className="pq-kv">
                                <span>{t('Business')}</span>
                                <span>
                                    <Business partner={partner} />
                                </span>
                            </div>
                            <div className="pq-kv">
                                <span>{t('Parks')}</span>
                                <span>{parkNamesOf(partner.parks)}</span>
                            </div>
                            <div className="pq-kv">
                                <span>{t('Live packages')}</span>
                                <span>{formatCount(partner.livePackageCount)}</span>
                            </div>
                            <div className="pq-kv">
                                <span>{t('Show phone numbers')}</span>
                                <span>
                                    <PhoneSwitch partner={partner} actions={actions} />
                                </span>
                            </div>
                            <div className="pq-kv">
                                <span>{t('Status')}</span>
                                <span>
                                    <span className={badge.className}>{t(badge.label)}</span>
                                </span>
                            </div>
                            <RowActions partner={partner} actions={actions} />
                        </div>
                    );
                })}
                {rows.length === 0 && empty}
            </div>
            {viewing && <PartnerViewDialog partner={viewing} onClose={actions.closeView} />}
            {editing && (
                <PartnerEditDialog
                    key={editing.id}
                    partner={editing}
                    parks={parks}
                    onSaved={actions.saved}
                    onClose={actions.closeEdit}
                />
            )}
            {confirming && (
                <PartnerStatusDialog
                    partner={confirming}
                    busy={actions.busy === confirming.id}
                    onConfirm={() => void actions.changeStatus(confirming)}
                    onClose={actions.closeConfirm}
                />
            )}
            {actions.notice && (
                <Toast
                    message={actions.notice.message}
                    isError={actions.notice.isError}
                    onClose={actions.clearNotice}
                />
            )}
        </>
    );
}
