'use client';

import { DeleteIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { GALLERY_LIMITS, PHOTO_ACCEPT } from '@/types/gallery.types';

import { ChevronLeftIcon, ChevronRightIcon, UploadIcon } from './gallery-icons';

export type EditorPhoto = {
    readonly key: string;
    readonly id: number | null;
    readonly src: string;
    readonly title: string;
    readonly caption: string;
};

export function GalleryPhotoCard({
    photo,
    number,
    isThumb,
    isFirst,
    isLast,
    busy,
    onTitle,
    onCaption,
    onMove,
    onThumbnail,
    onReplace,
    onRemove,
}: {
    readonly photo: EditorPhoto;
    readonly number: number;
    readonly isThumb: boolean;
    readonly isFirst: boolean;
    readonly isLast: boolean;
    readonly busy: boolean;
    readonly onTitle: (value: string) => void;
    readonly onCaption: (value: string) => void;
    readonly onMove: (step: -1 | 1) => void;
    readonly onThumbnail: () => void;
    readonly onReplace: (file: File) => void;
    readonly onRemove: () => void;
}) {
    const t = useT();
    const removeTip = isThumb ? t("The thumbnail can't be removed") : t('Remove');
    return (
        <div className={isThumb ? 'pq-photo is-thumb' : 'pq-photo'}>
            <div className="pq-photo-img">
                <img src={photo.src} alt={photo.title} />
                {isThumb && <span className="badge badge-success">{t('Thumbnail')}</span>}
            </div>
            <input
                className="input"
                maxLength={GALLERY_LIMITS.PHOTO_TITLE_MAX}
                placeholder={t('Title (optional)')}
                aria-label={t('Photo {n} title', { n: number })}
                value={photo.title}
                onChange={(event) => onTitle(event.target.value)}
            />
            <textarea
                className="textarea"
                rows={2}
                maxLength={GALLERY_LIMITS.CAPTION_MAX}
                placeholder={t('Caption (optional)')}
                aria-label={t('Photo {n} caption', { n: number })}
                value={photo.caption}
                onChange={(event) => onCaption(event.target.value)}
            />
            <div className="pq-photo-acts">
                <div className="us-acts">
                    <button
                        type="button"
                        className="btn-icon"
                        aria-label={t('Move photo {n} left', { n: number })}
                        data-tooltip={t('Move left')}
                        disabled={isFirst || busy}
                        onClick={() => onMove(-1)}
                    >
                        <ChevronLeftIcon />
                    </button>
                    <button
                        type="button"
                        className="btn-icon"
                        aria-label={t('Move photo {n} right', { n: number })}
                        data-tooltip={t('Move right')}
                        disabled={isLast || busy}
                        onClick={() => onMove(1)}
                    >
                        <ChevronRightIcon />
                    </button>
                </div>
                <div className="us-acts">
                    <button type="button" className="btn btn-text" disabled={isThumb || busy} onClick={onThumbnail}>
                        {t('Set as thumbnail')}
                    </button>
                    <label
                        className="btn-icon"
                        aria-label={t('Replace photo {n}', { n: number })}
                        data-tooltip={t('Replace')}
                        style={{ cursor: 'pointer' }}
                    >
                        <UploadIcon />
                        <input
                            type="file"
                            accept={PHOTO_ACCEPT}
                            style={{ display: 'none' }}
                            disabled={busy}
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                event.target.value = '';
                                if (file) onReplace(file);
                            }}
                        />
                    </label>
                    <button
                        type="button"
                        className="btn-icon is-danger"
                        aria-label={t('Remove photo {n}', { n: number })}
                        data-tooltip={removeTip}
                        disabled={isThumb || busy}
                        onClick={onRemove}
                    >
                        <DeleteIcon />
                    </button>
                </div>
            </div>
        </div>
    );
}
