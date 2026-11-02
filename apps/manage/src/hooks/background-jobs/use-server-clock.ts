'use client';

import { useEffect, useState } from 'react';

import { getServerTime } from '@/services/job.service';

const TICK_MS = 1000;

export function useServerClock(): Date | null {
    const [offset, setOffset] = useState<number | null>(null);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        let active = true;
        getServerTime()
            .then((time) => {
                if (active) setOffset(new Date(time.now).getTime() - Date.now());
            })
            .catch(() => {
                if (active) setOffset(0);
            });
        const timer = setInterval(() => setNow(Date.now()), TICK_MS);
        return () => {
            active = false;
            clearInterval(timer);
        };
    }, []);

    return offset === null ? null : new Date(now + offset);
}
