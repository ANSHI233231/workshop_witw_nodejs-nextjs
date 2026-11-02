import type { ReactNode } from 'react';

import { WebsiteAuth } from '@/components/website/website-shell';

export async function AuthScreen({ children }: { readonly children: ReactNode }) {
    return <WebsiteAuth>{children}</WebsiteAuth>;
}
