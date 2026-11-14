'use client';

import { ApproveIcon, EmptyListIcon, RejectIcon } from '@/components/partners/partner-icons';
import { DeleteIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { useGalleryActions } from '@/hooks/galleries/use-gallery-actions';
import { formatCount, formatDateTime } from '@/lib/format';
import { galleryPhotoUrl } from '@/services/gallery.service';
import type { GalleryItem, GalleryListKind } from '@/types/gallery.types';

import { PhotosIcon } from './gallery-icons';
import { GalleryPhotosDialog } from './gallery-photos-dialog';
import { GalleryReasonDialog } from './gallery-reason-dialog';

type Actions = ReturnType<typeof useGalleryActions>;

function RowActions({
    item,
    kind,
    actions,
}: {
    readonly item: GalleryItem;
    readonly kind: GalleryListKind;
    readonly actions: Actions;
}) {
    const t = useT();
    const busy = actions.busy === item.id || actions.refreshing;
    return (
        <div className="us-acts">
            <button
                type="button"
                className="btn-icon "
                aria-label={t('View photos')}
                data-tooltip={t('View photos')}
                onClick={() => actions.view(item)}
            >
                <PhotosIcon />
            </button>
            {kind === 'waiting' ? (
                <>
                    <button
                        type="button"
                        className="btn-icon "
                        aria-label={t('Approve')}
                        data-tooltip={t('Approve')}
                        disabled={busy}
                        onClick={() => void actions.approve(item)}
                    >
                        <ApproveIcon />
                    </button>
                    <button
                        type="button"
                        className="btn-icon "
                        aria-label={t('Reject')}
                        data-tooltip={t('Reject')}
                        onClick={() => actions.startReason(item, 'reject')}
                    >
                        <RejectIcon />
                    </button>
                </>
            ) : (
                <button
                    type="button"
                    className="btn-icon "
                    aria-label={t('Delete')}
                    data-tooltip={t('Delete')}
                    onClick={() => actions.startReason(item, 'delete')}
                >
                    <DeleteIcon />
                </button>
            )}
        </div>
    );
}

function Thumb({ item }: { readonly item: GalleryItem }) {
    return item.thumbnailPhotoId !== null && item.thumbnailFileVersion !== null ? (
        <img
            className="pq-thumb"
            src={galleryPhotoUrl(item.id, item.thumbnailPhotoId, item.thumbnailFileVersion)}
            alt=""
        />
    ) : (
        <img className="pq-thumb" alt="" />
    );
}

function Title({ item, kind }: { readonly item: GalleryItem; readonly kind: GalleryListKind }) {
    return (
        <div className="ss-row" style={{ flexWrap: 'nowrap' }}>
            <Thumb item={item} />
            <div className="pq-cell">
                <b>{kind === 'approved' ? (item.approvedTitle ?? item.title) : item.title}</b>
                <span className="ss-cap">{item.park.name}</span>
            </div>
        </div>
    );
}

export function GalleryRows({
    rows,
    firstSerial,
    kind,
}: {
    readonly rows: readonly GalleryItem[];
    readonly firstSerial: number;
    readonly kind: GalleryListKind;
}) {
    const t = useT();
    const actions = useGalleryActions();
    const waiting = kind === 'waiting';
    const changeOf = (item: GalleryItem) => (item.hasApprovedSet ? t('Edit of an approved gallery') : t('New gallery'));
    const dateOf = (item: GalleryItem) => {
        const value = waiting ? item.sentAt : item.decidedAt;
        return value ? formatDateTime(value) : '–';
    };
    const empty = (
        <div className="state">
            <EmptyListIcon />
            <p className="state-title">{waiting ? t('Nothing is waiting for approval.') : t('No approved galleries.')}</p>
        </div>
    );
    const columns = waiting ? 7 : 6;

    return (
        <>
            <div className="table-scroll ssc-only-desktop">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col" className="col-sno">
                                {t('S.No')}
                            </th>
                            <th scope="col">{t('Gallery')}</th>
                            <th scope="col">{t('Partner')}</th>
                            <th scope="col" className="col-center">
                                {t('Photos')}
                            </th>
                            {waiting && <th scope="col">{t('Change')}</th>}
                            <th scope="col">{waiting ? t('Sent on') : t('Approved on')}</th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((item, index) => (
                            <tr key={item.id}>
                                <td className="col-sno">{formatCount(firstSerial + index)}</td>
                                <td>
                                    <Title item={item} kind={kind} />
                                </td>
                                <td>{item.partner.businessName}</td>
                                <td className="col-center">{item.photoCount}</td>
                                {waiting && <td>{changeOf(item)}</td>}
                                <td>{dateOf(item)}</td>
                                <td className="col-actions">
                                    <RowActions item={item} kind={kind} actions={actions} />
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={columns}>{empty}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="ssc-list ssc-only-mobile">
                {rows.map((item, index) => (
                    <div key={item.id} className="ssc-card">
                        <div className="pq-mrow">{formatCount(firstSerial + index)}</div>
                        <div className="pq-kv">
                            <span>{t('Gallery')}</span>
                            <span>
                                <Title item={item} kind={kind} />
                            </span>
                        </div>
                        <div className="pq-kv">
                            <span>{t('Partner')}</span>
                            <span>{item.partner.businessName}</span>
                        </div>
                        <div className="pq-kv">
                            <span>{t('Photos')}</span>
                            <span>{item.photoCount}</span>
                        </div>
                        {waiting && (
                            <div className="pq-kv">
                                <span>{t('Change')}</span>
                                <span>{changeOf(item)}</span>
                            </div>
                        )}
                        <div className="pq-kv">
                            <span>{waiting ? t('Sent on') : t('Approved on')}</span>
                            <span>{dateOf(item)}</span>
                        </div>
                        <RowActions item={item} kind={kind} actions={actions} />
                    </div>
                ))}
                {rows.length === 0 && empty}
            </div>
            {actions.viewing && <GalleryPhotosDialog item={actions.viewing} kind={kind} onClose={actions.closeView} />}
            {actions.reasoning && (
                <GalleryReasonDialog
                    item={actions.reasoning.item}
                    mode={actions.reasoning.mode}
                    onDone={actions.reasonDone}
                    onClose={actions.closeReason}
                />
            )}
            {actions.notice && (
                <Toast message={actions.notice.message} isError={actions.notice.isError} onClose={actions.clearNotice} />
            )}
        </>
    );
}
