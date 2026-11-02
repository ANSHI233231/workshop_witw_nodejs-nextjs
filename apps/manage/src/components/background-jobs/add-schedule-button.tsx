'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PlusIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';

import { ScheduleDialog } from './schedule-dialog';

export function AddScheduleButton() {
    const t = useT();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    return (
        <>
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(true)}>
                <PlusIcon />
                {t('Add Scheduled Job')}
            </button>
            {open && (
                <ScheduleDialog
                    schedule={null}
                    onClose={() => setOpen(false)}
                    onSaved={(message) => {
                        setOpen(false);
                        setNotice(message);
                        router.refresh();
                    }}
                />
            )}
            {notice && <Toast message={notice} onClose={() => setNotice(null)} />}
        </>
    );
}
