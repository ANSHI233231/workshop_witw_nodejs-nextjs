import type { ReactNode } from 'react';

import { WebsitePage } from '@/components/website/website-shell';

export default function MemberLayout({ children }: { readonly children: ReactNode }) {
    return <WebsitePage>{children}</WebsitePage>;
}
