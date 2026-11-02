'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PlusIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';

import { UserFormDialog } from './user-form-dialog';

export function AddUserButton() {
    const t = useT();
    const router = useRouter();
    const [adding, setAdding] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    return (
        <>
            <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
                <PlusIcon />
                {t('Add User')}
            </button>
            {adding && (
                <UserFormDialog
                    user={null}
                    onClose={() => setAdding(false)}
                    onSaved={(saved) => {
                        setAdding(false);
                        setNotice(t('User "{name}" added.', { name: saved.name }));
                        router.refresh();
                    }}
                />
            )}
            {notice && <Toast message={notice} onClose={() => setNotice(null)} />}
        </>
    );
}
