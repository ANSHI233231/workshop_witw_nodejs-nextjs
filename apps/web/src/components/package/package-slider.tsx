'use client';

import { useEffect, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { packageFileUrl } from '@/services/package.service';
import { type PackageGallery, PACKAGE_LIMITS } from '@/types/package.types';

import { ChevronLeftIcon, ChevronRightIcon } from './package-icons';

export function PackageSlider({ slug, gallery }: { readonly slug: string; readonly gallery: PackageGallery }) {
    const t = useT();
    const count = gallery.photos.length;
    const [index, setIndex] = useState(0);
    const [moves, setMoves] = useState(0);

    useEffect(() => {
        if (count < 2) return;
        const timer = setInterval(() => setIndex((current) => (current + 1) % count), PACKAGE_LIMITS.SLIDE_MS);
        return () => clearInterval(timer);
    }, [count, moves]);

    const photo = gallery.photos[index % count];
    if (!photo) return null;
    const title = gallery.title || t('Gallery');

    const move = (step: number) => {
        setIndex((current) => (current + step + count) % count);
        setMoves((current) => current + 1);
    };

    return (
        <>
            <p className="pk2-gt">{title}</p>
            <div className="pk2-slider" aria-roledescription="carousel" aria-label={title}>
                <img src={packageFileUrl(slug, photo.fileName)} alt={photo.title ?? ''} />
                <span className="pk2-dots">{`${(index % count) + 1} / ${count}`}</span>
                <button type="button" className="pk2-arrow is-l" aria-label={t('Previous photo')} onClick={() => move(-1)}>
                    <ChevronLeftIcon />
                </button>
                <button type="button" className="pk2-arrow is-r" aria-label={t('Next photo')} onClick={() => move(1)}>
                    <ChevronRightIcon />
                </button>
                {(photo.title || photo.caption) && (
                    <div className="pk2-cap">
                        <b>{photo.title}</b>
                        <span>{photo.caption}</span>
                    </div>
                )}
            </div>
        </>
    );
}
