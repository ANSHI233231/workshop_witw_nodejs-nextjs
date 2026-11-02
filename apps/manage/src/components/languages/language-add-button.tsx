'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PlusIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';

import { LanguageDialog } from './language-dialog';

export function LanguageAddButton() {
    const t = useT();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    return (
        <>
            <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}>
                <PlusIcon />
                {t('Add Language')}
            </button>
            {open && (
                <LanguageDialog
                    editing={null}
                    onSaved={() => {
                        setOpen(false);
                        setNotice(t('Language added.'));
                        router.refresh();
                    }}
                    onClose={() => setOpen(false)}
                />
            )}
            {notice && <Toast message={notice} onClose={() => setNotice(null)} />}
        </>
    );
}
