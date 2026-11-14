'use client';

import { useEffect, useState } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { galleryPhotoUrl, getGallery } from '@/services/gallery.service';
import type { GalleryDetail, GalleryItem, GalleryListKind } from '@/types/gallery.types';

export function GalleryPhotosDialog({
    item,
    kind,
    onClose,
}: {
    readonly item: GalleryItem;
    readonly kind: GalleryListKind;
    readonly onClose: () => void;
}) {
    const t = useT();
    const [detail, setDetail] = useState<GalleryDetail | null>(null);
    const [failed, setFailed] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        getGallery(item.id).then(
            (loaded) => {
                if (!cancelled) setDetail(loaded);
            },
            (error: unknown) => {
                if (!cancelled)
                    setFailed(
                        error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
                            ? error.message
                            : 'This could not be done. Please try again.',
                    );
            },
        );
        return () => {
            cancelled = true;
        };
    }, [item.id]);

    const photos = detail ? (kind === 'waiting' ? detail.draftPhotos : detail.approvedPhotos) : [];

    return (
        <div className="overlay" onClick={onClose}>
            <div
                className="modal is-lg"
                role="dialog"
                aria-modal="true"
                aria-labelledby="gal-photos-t"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="gal-photos-t">
                        {kind === 'waiting' ? item.title : (item.approvedTitle ?? item.title)}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <p className="ss-muted" style={{ margin: '0 0 var(--space-md)' }}>
                        {item.partner.businessName} · {item.park.name}
                    </p>
                    {failed && (
                        <div className="banner banner-danger" role="alert">
                            {t(failed)}
                        </div>
                    )}
                    <div className="pq-photos-dlg">
                        {photos.map((photo) => (
                            <figure key={photo.id}>
                                <img src={galleryPhotoUrl(item.id, photo.id, photo.fileVersion)} alt="" />
                                <b>{photo.title}</b>
                                <span>{photo.caption}</span>
                            </figure>
                        ))}
                    </div>
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
