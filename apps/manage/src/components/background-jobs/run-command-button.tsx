'use client';

import { useState } from 'react';

import { PlayIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { JobRunTrigger } from '@/types/job.types';

import { RunCommandDialog } from './run-command-dialog';
import { useRunViewer } from './use-run-viewer';

export function RunCommandButton() {
    const t = useT();
    const [open, setOpen] = useState(false);
    const { view, say, overlays, refresh } = useRunViewer();
    return (
        <>
            <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
                <PlayIcon />
                {t('Run Command')}
            </button>
            {open && (
                <RunCommandDialog
                    onClose={() => setOpen(false)}
                    onQueued={(run, message) => {
                        setOpen(false);
                        say(message);
                        refresh();
                        if (run.trigger !== JobRunTrigger.PLANNED) view(run.id);
                    }}
                />
            )}
            {overlays}
        </>
    );
}
