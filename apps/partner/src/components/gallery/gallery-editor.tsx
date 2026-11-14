'use client';

import { useGalleryEditor } from '@/hooks/gallery/use-gallery-editor';
import { useT } from '@/hooks/i18n/use-t';
import { useRevealFirstError } from '@/hooks/ui/use-reveal-first-error';
import { formatDateTime } from '@/lib/format';
import { GALLERY_LIMITS, GalleryStatus, type GalleryDetail, PHOTO_ACCEPT } from '@/types/gallery.types';
import type { ParkOption } from '@/types/partner.types';

import { GalleryDeleteDialog } from './gallery-delete-dialog';
import { STATUS_BADGE } from './gallery-format';
import { GalleryPhotoCard } from './gallery-photo-card';

export function GalleryEditor({
    gallery,
    parks,
}: {
    readonly gallery: GalleryDetail | null;
    readonly parks: readonly ParkOption[];
}) {
    const t = useT();
    const { formRef, revealFirstError } = useRevealFirstError<HTMLDivElement>();
    const editor = useGalleryEditor(gallery, revealFirstError);
    const status = gallery?.status;
    const canEdit = !gallery || status === GalleryStatus.DRAFT;
    const badge = STATUS_BADGE[status ?? GalleryStatus.DRAFT];
    const parkOptions =
        gallery && !parks.some((park) => park.id === gallery.park.id)
            ? [...parks, { id: gallery.park.id, name: gallery.park.name ?? '' }]
            : parks;
    const { errors } = editor;

    const sideText = gallery
        ? `${
              gallery.hasApprovedSet && gallery.decidedAt
                  ? t('Approved {date}.', { date: formatDateTime(gallery.decidedAt) })
                  : t('Not approved yet.')
          } ${t('A package keeps a copy of the gallery as it was when the package was saved.')}`
        : t('Save the gallery as a draft, then send it for approval.');

    return (
        <div className="pq-ed">
            <div className="pq-ed-main">
                {gallery && status === GalleryStatus.DRAFT && gallery.rejectReason && (
                    <div className="banner banner-danger pq-banner" role="alert">
                        <b>{t('The Super Admin rejected this gallery.')}</b> {gallery.rejectReason}
                    </div>
                )}
                {status === GalleryStatus.WAITING && (
                    <div className="banner banner-warning pq-banner" role="status">
                        {t('This gallery is waiting for approval. Move it back to draft to change it.')}
                    </div>
                )}
                {gallery && gallery.hasApprovedSet && status !== GalleryStatus.APPROVED && (
                    <div className="banner banner-info pq-banner" role="status">
                        {t('The approved photos stay in use until your changes are approved.')}
                    </div>
                )}
                <div className="pq-card">
                    <div className={canEdit ? 'pq-body' : 'pq-body pq-ro'} ref={formRef}>
                        <div className="pq-2">
                            <div className={errors.title ? 'field is-invalid' : 'field'}>
                                <label className="label" htmlFor="g-title">
                                    {t('Gallery title')}
                                    <span className="req" aria-hidden="true">
                                        *
                                    </span>
                                </label>
                                <input
                                    id="g-title"
                                    className="input"
                                    maxLength={GALLERY_LIMITS.TITLE_MAX}
                                    value={editor.title}
                                    aria-invalid={errors.title ? true : undefined}
                                    onChange={(event) => editor.setTitle(event.target.value)}
                                />
                                {errors.title && (
                                    <span className="error" role="alert">
                                        {errors.title}
                                    </span>
                                )}
                            </div>
                            <div className={errors.park ? 'field is-invalid' : 'field'}>
                                <label className="label" htmlFor="g-park">
                                    {t('Park')}
                                    <span className="req" aria-hidden="true">
                                        *
                                    </span>
                                </label>
                                <select
                                    id="g-park"
                                    className="select"
                                    value={editor.parkId}
                                    aria-invalid={errors.park ? true : undefined}
                                    onChange={(event) => editor.setParkId(event.target.value)}
                                >
                                    <option value="">{t('Choose…')}</option>
                                    {parkOptions.map((park) => (
                                        <option key={park.id} value={park.id}>
                                            {park.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.park && (
                                    <span className="error" role="alert">
                                        {errors.park}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="field">
                            <label className="label" htmlFor="g-photos">
                                {t('Photos')}
                                <span className="req" aria-hidden="true">
                                    *
                                </span>
                            </label>
                            <input
                                id="g-photos"
                                className="input"
                                type="file"
                                multiple
                                accept={PHOTO_ACCEPT}
                                disabled={editor.busy}
                                onChange={(event) => {
                                    const files = Array.from(event.target.files ?? []);
                                    event.target.value = '';
                                    void editor.addPhotos(files);
                                }}
                            />
                            <span className="helper">
                                {t(
                                    'JPG, JPEG or PNG, up to 8 MB each. The first photo is the thumbnail unless you set another.',
                                )}
                            </span>
                        </div>
                        <div className="pq-photos">
                            {editor.photos.map((photo, index) => (
                                <GalleryPhotoCard
                                    key={photo.key}
                                    photo={photo}
                                    number={index + 1}
                                    isThumb={photo.key === editor.thumbKey}
                                    isFirst={index === 0}
                                    isLast={index === editor.photos.length - 1}
                                    busy={editor.busy}
                                    onTitle={(value) => editor.patchPhoto(photo.key, { title: value })}
                                    onCaption={(value) => editor.patchPhoto(photo.key, { caption: value })}
                                    onMove={(step) => editor.movePhoto(index, step)}
                                    onThumbnail={() => editor.setThumbnail(photo.key)}
                                    onReplace={(file) => void editor.replacePhoto(photo, file)}
                                    onRemove={() => editor.removePhoto(photo.key)}
                                />
                            ))}
                        </div>
                        {editor.photos.length === 0 && (
                            <p className="ss-muted" style={{ margin: 0 }}>
                                {t('No photos yet.')}
                            </p>
                        )}
                    </div>
                    {canEdit && (
                        <div className="pq-foot">
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={editor.busy}
                                onClick={() => void editor.save()}
                            >
                                {t('Save draft')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <aside className="pq-side">
                <div className="pq-card">
                    <h3>{gallery ? t('Gallery') : t('New gallery')}</h3>
                    <div className="ss-row">
                        <span className={badge.css}>{t(badge.label)}</span>
                    </div>
                    <p className="ss-cap" style={{ margin: 0 }}>
                        {sideText}
                    </p>
                    {gallery && status === GalleryStatus.DRAFT && (
                        <>
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={editor.busy}
                                onClick={() => void editor.send()}
                            >
                                {t('Send for approval')}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary ss-danger-link"
                                disabled={editor.busy}
                                onClick={editor.askDelete}
                            >
                                {gallery.hasApprovedSet ? t('Delete draft') : t('Delete')}
                            </button>
                        </>
                    )}
                    {gallery && status === GalleryStatus.WAITING && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={editor.busy}
                            onClick={() => void editor.moveBack()}
                        >
                            {t('Move back to draft')}
                        </button>
                    )}
                    {gallery && status === GalleryStatus.APPROVED && (
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={editor.busy}
                            onClick={() => void editor.startEdit()}
                        >
                            {t('Edit')}
                        </button>
                    )}
                </div>
            </aside>
            {editor.deleting && gallery && (
                <GalleryDeleteDialog
                    hasApprovedSet={gallery.hasApprovedSet}
                    busy={editor.busy}
                    onClose={editor.cancelDelete}
                    onConfirm={() => void editor.discard()}
                />
            )}
        </div>
    );
}
