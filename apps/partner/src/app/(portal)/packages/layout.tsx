import type { ReactNode } from 'react';

import { PackageNotice } from '@/components/package-editor/package-notice';

export default function PackagesLayout({ children }: { readonly children: ReactNode }) {
    return (
        <>
            {children}
            <PackageNotice />
        </>
    );
}
