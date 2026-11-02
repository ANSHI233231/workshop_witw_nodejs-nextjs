'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { formatCount } from '@/lib/format';
import { logger } from '@/lib/logger';
import { getLogLines } from '@/services/system-log.service';
import type { LogApp } from '@/types/system-log.types';

const log = logger.category('system-log');

const NEAR_TOP_PX = 40;

type Loaded = {
    readonly lines: readonly string[];
    readonly startLine: number;
    readonly endLine: number;
    readonly totalLines: number;
    readonly hasMore: boolean;
};

const EMPTY: Loaded = { lines: [], startLine: 0, endLine: 0, totalLines: 0, hasMore: false };

export function LogViewer({
    app,
    name,
    reload,
    isTall = false,
}: {
    readonly app: LogApp;
    readonly name: string;
    readonly reload: number;
    readonly isTall?: boolean;
}) {
    const t = useT();
    const panel = useRef<HTMLDivElement>(null);
    const keepFromBottom = useRef<number | null>(null);
    const key = `${app}|${name}|${reload}`;
    const [result, setResult] = useState<{ readonly key: string; readonly loaded: Loaded; readonly failed: boolean }>({
        key: '',
        loaded: EMPTY,
        failed: false,
    });
    const [loadingOlder, setLoadingOlder] = useState(false);
    const loaded = result.loaded;
    const failed = result.failed;
    const loading = result.key !== key || loadingOlder;

    useEffect(() => {
        let current = true;
        getLogLines(app, name)
            .then((found) => {
                if (!current) return;
                keepFromBottom.current = 0;
                setResult({ key, loaded: found, failed: false });
            })
            .catch((error: unknown) => {
                log.warn('Log lines could not be loaded', { error, app, name });
                if (current) setResult({ key, loaded: EMPTY, failed: true });
            });
        return () => {
            current = false;
        };
    }, [app, name, key]);

    useLayoutEffect(() => {
        const element = panel.current;
        if (!element || keepFromBottom.current === null) return;
        element.scrollTop = element.scrollHeight - element.clientHeight - keepFromBottom.current;
        keepFromBottom.current = null;
    }, [result]);

    const loadOlder = useCallback(async () => {
        const element = panel.current;
        if (!element || loading || !loaded.hasMore) return;
        setLoadingOlder(true);
        try {
            const older = await getLogLines(app, name, loaded.startLine - 1);
            keepFromBottom.current = element.scrollHeight - element.clientHeight - element.scrollTop;
            setResult((current) => ({
                ...current,
                loaded: {
                    ...current.loaded,
                    lines: [...older.lines, ...current.loaded.lines],
                    startLine: older.startLine,
                    hasMore: older.hasMore,
                },
            }));
        } catch (error) {
            log.warn('Older log lines could not be loaded', { error, app, name });
        } finally {
            setLoadingOlder(false);
        }
    }, [app, name, loading, loaded.hasMore, loaded.startLine]);

    return (
        <>
            <div
                ref={panel}
                className={`sl-panel${isTall ? ' is-tall' : ''}`}
                role="log"
                aria-label={`${app} ${name}`}
                onScroll={(event) => {
                    if (event.currentTarget.scrollTop < NEAR_TOP_PX) void loadOlder();
                }}
            >
                {loaded.lines.length === 0 && !loading ? (
                    <p className="sl-note">
                        {failed ? t('The log could not be read. Please try again.') : t('No lines yet.')}
                    </p>
                ) : (
                    loaded.lines.map((line, index) => (
                        <div className="sl-line" key={loaded.startLine + index}>
                            {line || ' '}
                        </div>
                    ))
                )}
            </div>
            <div className="sl-foot">
                <span>
                    {loaded.totalLines > 0
                        ? t('Showing lines {start}–{end} of {total}', {
                              start: formatCount(loaded.startLine),
                              end: formatCount(loaded.endLine),
                              total: formatCount(loaded.totalLines),
                          })
                        : loading
                          ? t('Loading…')
                          : t('Showing 0 lines')}
                </span>
                {loaded.hasMore && (
                    <span className="sl-hint">{loading ? t('Loading…') : t('Scroll up to load older lines')}</span>
                )}
                {!loaded.hasMore && loaded.totalLines > 0 && <span className="sl-hint is-done">{t('Start of file')}</span>}
            </div>
        </>
    );
}
