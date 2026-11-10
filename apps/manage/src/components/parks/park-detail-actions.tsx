'use client';

import { EditIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { useParkActions } from '@/hooks/parks/use-park-actions';
import type { Park } from '@/types/park.types';

import { ParkDialog } from './park-dialog';
import { statusToggleLabel } from './park-format';
import { StatusToggleIcon } from './park-icons';

export function ParkDetailActions({ park }: { readonly park: Park }) {
    const t = useT();
    const actions = useParkActions();

    return (
        <div className="actions">
            <button
                type="button"
                className="btn btn-secondary"
                disabled={actions.switching !== null}
                onClick={() => void actions.toggleStatus(park)}
            >
                <StatusToggleIcon />
                {t(statusToggleLabel(park.status))}
            </button>
            <button type="button" className="btn btn-primary" onClick={() => actions.startEdit(park)}>
                <EditIcon />
                {t('Edit')}
            </button>
            {actions.editing && (
                <ParkDialog editing={actions.editing} onSaved={actions.saved} onClose={actions.stopEdit} />
            )}
            {actions.notice && (
                <Toast
                    message={actions.notice.message}
                    isError={actions.notice.isError}
                    onClose={actions.clearNotice}
                />
            )}
        </div>
    );
}
