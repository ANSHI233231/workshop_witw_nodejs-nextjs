'use client';

import { useRouter } from 'next/navigation';

import { CloseIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';
import { GALLERY_LIMITS, type GalleryFilters } from '@/types/gallery.types';

import { galleryListUrl } from './gallery-url';

export function GalleryFilterBar({ path, filters }: { readonly path: string; readonly filters: GalleryFilters }) {
    const t = useT();
    const router = useRouter();
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(galleryListUrl(path, { search, page: 1 })),
    );
    const filtered = text.trim() !== '' || filters.search !== '';

    return (
        <div className="filter-bar">
            <div className="ssc-tools" style={{ flexWrap: 'wrap' }}>
                <div className="input-group fw-md">
                    <SearchIcon />
                    <input
                        className="input"
                        placeholder={t('Gallery or partner')}
                        aria-label={t('Search')}
                        maxLength={GALLERY_LIMITS.SEARCH}
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                    />
                </div>
            </div>
            {filtered && (
                <button
                    type="button"
                    className="btn btn-text ssc-clear"
                    onClick={() => {
                        clearText();
                        router.push(path);
                    }}
                >
                    <CloseIcon />
                    {t('Clear filters')}
                </button>
            )}
        </div>
    );
}
