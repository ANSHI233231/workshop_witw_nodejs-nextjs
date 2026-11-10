'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PlusIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';

import { FlagReasonDialog } from './flag-reason-dialog';
import { FLAG_REASONS_PATH } from './flag-reason-url';

export function FlagReasonAddButton() {
    const t = useT();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    return (
        <>
            <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
                <PlusIcon />
                {t('Add Reason')}
            </button>
            {open && (
                <FlagReasonDialog
                    editing={null}
                    onSaved={(record) => {
                        setOpen(false);
                        setNotice(t('Reason "{name}" added.', { name: record.name }));
                        router.push(FLAG_REASONS_PATH);
                        router.refresh();
                    }}
                    onClose={() => setOpen(false)}
                />
            )}
            {notice && <Toast message={notice} onClose={() => setNotice(null)} />}
        </>
    );
}
