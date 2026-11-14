'use client';

import Link from 'next/link';
import { useState } from 'react';

import { DeleteIcon, EditIcon, ViewIcon } from '@/components/ui/icons';
import { SendIcon } from '@/components/portal/portal-icons';
import { useT } from '@/hooks/i18n/use-t';
import { useGalleryActions } from '@/hooks/gallery/use-gallery-actions';
import { galleryPhotoUrl } from '@/services/gallery.service';
import type { GalleryListItem, GalleryTabKey } from '@/types/gallery.types';

import { type CardAction, cardOf, GALLERY_PATH, photoCountText } from './gallery-format';
import { GalleryDeleteDialog } from './gallery-delete-dialog';
import { EmptyGalleryIcon } from './gallery-icons';

const ACTION_LABEL: Readonly<Record<CardAction, string>> = {
    view: 'View',
    edit: 'Edit',
    send: 'Send',
    delete: 'Delete',
};

function ActionIcon({ action }: { readonly action: CardAction }) {
    if (action === 'view') return <ViewIcon />;
    if (action === 'edit') return <EditIcon />;
    if (action === 'send') return <SendIcon />;
    return <DeleteIcon />;
}

export function GalleryCards({
    items,
    tab,
}: {
    readonly items: readonly GalleryListItem[];
    readonly tab: GalleryTabKey;
}) {
    const t = useT();
    const actions = useGalleryActions();
    const [deleting, setDeleting] = useState<GalleryListItem | null>(null);

    if (items.length === 0) {
        return (
            <div className="state">
                <EmptyGalleryIcon />
                <p className="state-title">{t('No galleries here.')}</p>
            </div>
        );
    }

    return (
        <>
            <div className="pq-galgrid">
                {items.map((item) => {
                    const card = cardOf(item, tab);
                    const shownTitle = tab === 'approved' ? (item.approvedTitle ?? item.title) : item.title;
                    return (
                        <div className="pq-gal" key={item.id}>
                            {item.thumbnailPhotoId !== null && item.thumbnailFileVersion !== null ? (
                                <img
                                    src={galleryPhotoUrl(item.id, item.thumbnailPhotoId, item.thumbnailFileVersion)}
                                    alt=""
                                />
                            ) : (
                                <img alt="" />
                            )}
                            <div className="pq-gal-b">
                                <b>{shownTitle}</b>
                                <span className="ss-cap">
                                    {item.park.name} · {t(photoCountText(item.photoCount))}
                                </span>
                                {card.note && (
                                    <span className="ss-cap">
                                        {card.note.startsWith('Rejected: ')
                                            ? `${t('Rejected:')} ${card.note.slice('Rejected: '.length)}`
                                            : t(card.note)}
                                    </span>
                                )}
                                <div className="pq-gal-f">
                                    <span className={card.css}>{t(card.label)}</span>
                                    <div className="us-acts">
                                        {card.actions.map((action) => {
                                            const label = t(action === 'delete' ? card.deleteLabel : ACTION_LABEL[action]);
                                            if (action === 'view' || action === 'edit') {
                                                return (
                                                    <Link
                                                        key={action}
                                                        className="btn-icon"
                                                        href={`${GALLERY_PATH}/${item.id}`}
                                                        aria-label={label}
                                                        data-tooltip={label}
                                                    >
                                                        <ActionIcon action={action} />
                                                    </Link>
                                                );
                                            }
                                            return (
                                                <button
                                                    key={action}
                                                    type="button"
                                                    className="btn-icon"
                                                    aria-label={label}
                                                    data-tooltip={label}
                                                    disabled={actions.busy !== null}
                                                    onClick={() =>
                                                        action === 'send' ? void actions.send(item.id) : setDeleting(item)
                                                    }
                                                >
                                                    <ActionIcon action={action} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {deleting && (
                <GalleryDeleteDialog
                    hasApprovedSet={deleting.hasApprovedSet}
                    busy={actions.busy !== null}
                    onClose={() => setDeleting(null)}
                    onConfirm={() => {
                        const target = deleting;
                        setDeleting(null);
                        void actions.discard(target.id);
                    }}
                />
            )}
        </>
    );
}
