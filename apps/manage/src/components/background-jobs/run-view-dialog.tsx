'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

import { CloseIcon, CopyIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { copyText } from '@/lib/clipboard';
import { formatDateTime } from '@/lib/format';
import { getJobRun } from '@/services/job.service';
import { JobRunStatus, type JobRunDetail } from '@/types/job.types';

import { commandLine, formatDuration, isActiveRun, RUN_STATUS_BADGES, runTriggerText } from './job-labels';

const REFRESH_MS = 3000;

const NONE = '—';

function Item({
    label,
    mono = false,
    children,
}: {
    readonly label: string;
    readonly mono?: boolean;
    readonly children: ReactNode;
}) {
    return (
        <div className="el-item">
            <dt>{label}</dt>
            <dd className={mono ? 'el-mono' : undefined}>{children}</dd>
        </div>
    );
}

function TextBox({
    label,
    text,
    tone,
    onCopied,
}: {
    readonly label: string;
    readonly text: string | null;
    readonly tone: 'output' | 'error';
    readonly onCopied: (message: string) => void;
}) {
    const t = useT();
    return (
        <div className="el-box">
            <div className="el-box-h">
                <span>{label}</span>
                <button
                    type="button"
                    className="btn btn-text el-copy"
                    disabled={!text}
                    onClick={() =>
                        void copyText(text ?? '').then((copied) =>
                            onCopied(copied ? t('{label} copied.', { label }) : t('It could not be copied.')),
                        )
                    }
                >
                    <CopyIcon />
                    {t('Copy')}
                </button>
            </div>
            <pre className={tone === 'error' ? 'bj-pre is-error' : 'bj-pre'}>{text || NONE}</pre>
        </div>
    );
}

export function RunViewDialog({
    runId,
    onClose,
    onEnded,
    onNotice,
}: {
    readonly runId: number;
    readonly onClose: () => void;
    readonly onEnded: () => void;
    readonly onNotice: (message: string, isError: boolean) => void;
}) {
    const t = useT();
    const [run, setRun] = useState<JobRunDetail | null>(null);
    const [failed, setFailed] = useState(false);
    const wasActive = useRef(false);
    const ended = useRef(onEnded);
    useEffect(() => {
        ended.current = onEnded;
    });

    useEffect(() => {
        let active = true;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const load = async () => {
            try {
                const found = await getJobRun(runId);
                if (!active) return;
                setRun(found);
                const running = isActiveRun(found.status);
                if (wasActive.current && !running) ended.current();
                wasActive.current = running;
                if (running) timer = setTimeout(() => void load(), REFRESH_MS);
            } catch {
                if (active) setFailed(true);
            }
        };
        void load();
        return () => {
            active = false;
            if (timer) clearTimeout(timer);
        };
    }, [runId]);

    useEffect(() => {
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [onClose]);

    const badge = run ? RUN_STATUS_BADGES[run.status] : null;
    return (
        <div className="overlay">
            <div
                className="modal el-modal"
                role="dialog"
                aria-modal="true"
                aria-label={t('Job Run #{id}', { id: runId })}
            >
                <div className="modal-head">
                    <h2 className="modal-title el-mt">
                        {t('Job Run #{id}', { id: runId })}
                        {badge && <span className={badge.className}>{t(badge.label)}</span>}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    {failed && !run && (
                        <p className="error" role="alert">
                            {t('This run could not be loaded.')}
                        </p>
                    )}
                    {!run && !failed && <p className="helper">{t('Loading…')}</p>}
                    {run && (
                        <>
                            {run.title && <div className="el-headline">{run.title}</div>}
                            <dl className="el-grid">
                                <Item label={t('Command')} mono>
                                    {commandLine(run.command, run.arguments)}
                                </Item>
                                <Item label={t('Trigger')}>{runTriggerText(t, run)}</Item>
                                <Item label={t('Run at')}>{formatDateTime(run.runAt)}</Item>
                                <Item label={t('Started')}>{run.startedAt ? formatDateTime(run.startedAt) : NONE}</Item>
                                <Item label={t('Finished')}>
                                    {run.finishedAt ? formatDateTime(run.finishedAt) : NONE}
                                </Item>
                                <Item label={t('Duration')}>{formatDuration(run.durationSeconds)}</Item>
                                <Item label={t('Exit code')}>{run.exitCode ?? NONE}</Item>
                                <Item label={t('Progress')}>
                                    {run.progressPercent === null ? NONE : `${run.progressPercent}%`}
                                </Item>
                                <Item label={t('Time limit')}>{t('{count} min', { count: run.timeoutMinutes })}</Item>
                            </dl>
                            {isActiveRun(run.status) && (
                                <p className="helper">
                                    {run.status === JobRunStatus.WAITING
                                        ? t('Waiting to start. This refreshes every few seconds.')
                                        : t('Running. This refreshes every few seconds.')}
                                </p>
                            )}
                            <TextBox
                                label={t('Output')}
                                text={run.output}
                                tone="output"
                                onCopied={(message) => onNotice(message, false)}
                            />
                            <TextBox
                                label={t('Error')}
                                text={run.error}
                                tone="error"
                                onCopied={(message) => onNotice(message, false)}
                            />
                        </>
                    )}
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
