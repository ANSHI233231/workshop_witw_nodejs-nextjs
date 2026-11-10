'use client';

import { Toast } from '@/components/ui/toast';
import type { SiteToast as SiteToastValue } from '@/hooks/shared-safari/use-site-toast';

export function SiteToast({ toast, onClose }: { readonly toast: SiteToastValue | null; readonly onClose: () => void }) {
    if (!toast) return null;
    return <Toast key={toast.id} message={toast.message} isError={toast.isError} onClose={onClose} />;
}
