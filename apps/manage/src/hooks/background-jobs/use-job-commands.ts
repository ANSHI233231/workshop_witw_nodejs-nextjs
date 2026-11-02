'use client';

import { useEffect, useState } from 'react';

import { listJobCommands } from '@/services/job.service';
import type { JobCommand } from '@/types/job.types';

export function useJobCommands(): readonly JobCommand[] {
    const [commands, setCommands] = useState<readonly JobCommand[]>([]);
    useEffect(() => {
        let active = true;
        listJobCommands()
            .then((found) => {
                if (active) setCommands(found);
            })
            .catch(() => undefined);
        return () => {
            active = false;
        };
    }, []);
    return commands;
}
