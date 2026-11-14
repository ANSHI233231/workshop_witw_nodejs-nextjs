import type { ReactNode } from 'react';

import { PartnerRequestNotice } from '@/components/partner-request/partner-request-notice';

export default function PartnerRequestLayout({ children }: { readonly children: ReactNode }) {
    return (
        <>
            {children}
            <PartnerRequestNotice />
        </>
    );
}
