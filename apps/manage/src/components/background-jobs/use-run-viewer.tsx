'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Toast } from '@/components/ui/toast';

import { RunViewDialog } from './run-view-dialog';

type Notice = { readonly message: string; readonly isError: boolean };

export function useRunViewer() {
    const router = useRouter();
    const [viewing, setViewing] = useState<number | null>(null);
    const [notice, setNotice] = useState<Notice | null>(null);
    const say = (message: string, isError = false) => setNotice({ message, isError });
    const overlays = (
        <>
            {viewing !== null && (
                <RunViewDialog
                    runId={viewing}
                    onClose={() => setViewing(null)}
                    onEnded={() => router.refresh()}
                    onNotice={say}
                />
            )}
            {notice && <Toast message={notice.message} isError={notice.isError} onClose={() => setNotice(null)} />}
        </>
    );
    return { view: setViewing, say, overlays, refresh: () => router.refresh() };
}
