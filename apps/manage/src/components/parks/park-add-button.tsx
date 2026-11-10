'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PlusIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';

import { ParkDialog } from './park-dialog';
import { PARKS_PATH } from './park-url';

export function ParkAddButton() {
    const t = useT();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    return (
        <>
            <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
                <PlusIcon />
                {t('Add Park')}
            </button>
            {open && (
                <ParkDialog
                    editing={null}
                    onSaved={(park) => {
                        setOpen(false);
                        setNotice(t('Park "{name}" added.', { name: park.name }));
                        router.push(PARKS_PATH);
                        router.refresh();
                    }}
                    onClose={() => setOpen(false)}
                />
            )}
            {notice && <Toast message={notice} onClose={() => setNotice(null)} />}
        </>
    );
}
