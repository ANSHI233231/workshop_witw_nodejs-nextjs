import type { ReactNode } from 'react';

import { GalleryNotice } from '@/components/gallery/gallery-notice';

export default function GalleryLayout({ children }: { readonly children: ReactNode }) {
    return (
        <>
            {children}
            <GalleryNotice />
        </>
    );
}
