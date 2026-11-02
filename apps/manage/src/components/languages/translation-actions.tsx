'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { CloseIcon, DownloadIcon, ImportIcon, PlusIcon, RefreshIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { downloadCsv, localDay } from '@/lib/csv';
import { formatCount, formatDateTime } from '@/lib/format';
import { ApiError } from '@/services/api-error';
import { exportAppTranslations, publishAppTranslations, uploadAppTranslations } from '@/services/language.service';
import {
    APP_TRANSLATION_CSV_HEADERS,
    APP_TRANSLATION_UPLOAD_LIMITS,
    type AppTranslationLanguage,
    type AppTranslationUploadResult,
} from '@/types/language.types';

import { TranslationDialog } from './translation-dialog';

type Notice = { readonly message: string; readonly isError: boolean };

const messageOf = (error: unknown, t: (text: string) => string): string =>
    error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
        ? t(error.fieldError('file') ?? error.message)
        : t('This could not be done. Please try again.');

function UploadResultDialog({
    result,
    onClose,
}: {
    readonly result: AppTranslationUploadResult;
    readonly onClose: () => void;
}) {
    const t = useT();
    return (
        <div className="overlay">
            <div className="modal is-sm mm-modal" role="dialog" aria-modal="true" aria-labelledby="tr-up-title">
                <div className="modal-head">
                    <h2 className="modal-title" id="tr-up-title">
                        {t('Upload Result')}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <p>
                        {t('Added')}: <b>{formatCount(result.added)}</b> · {t('Updated')}:{' '}
                        <b>{formatCount(result.updated)}</b> · {t('Unchanged')}: <b>{formatCount(result.unchanged)}</b>{' '}
                        · {t('Refused')}: <b>{formatCount(result.refused.length)}</b>
                    </p>
                    {result.refused.length > 0 && (
                        <ul>
                            {result.refused.map((refusal) => (
                                <li key={refusal.row}>
                                    {t('Row')} {refusal.row}: {t(refusal.message)}
                                </li>
                            ))}
                        </ul>
                    )}
                    <p className="helper">{t('Press Publish translations to show the changes in the apps.')}</p>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-primary" onClick={onClose}>
                        {t('Close')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function TranslationActions({
    languages,
    lastPublishedAt,
}: {
    readonly languages: readonly AppTranslationLanguage[];
    readonly lastPublishedAt: string | null;
}) {
    const t = useT();
    const router = useRouter();
    const fileInput = useRef<HTMLInputElement>(null);
    const [adding, setAdding] = useState(false);
    const [busy, setBusy] = useState<'download' | 'upload' | 'publish' | null>(null);
    const [uploadResult, setUploadResult] = useState<AppTranslationUploadResult | null>(null);
    const [notice, setNotice] = useState<Notice | null>(null);

    const download = async () => {
        setBusy('download');
        try {
            const rows = await exportAppTranslations();
            downloadCsv(
                `language-translations-${localDay()}.csv`,
                [
                    APP_TRANSLATION_CSV_HEADERS.ENGLISH,
                    ...languages.map((language) => `${language.name}${APP_TRANSLATION_CSV_HEADERS.LANGUAGE_SUFFIX}`),
                ],
                rows.map((row) => [row.enText, ...languages.map((language) => row.texts[language.code] ?? '')]),
                { quoteEveryCell: true },
            );
        } catch (error) {
            setNotice({ message: messageOf(error, t), isError: true });
        } finally {
            setBusy(null);
        }
    };

    const upload = async (file: File | undefined) => {
        if (fileInput.current) fileInput.current.value = '';
        if (!file) return;
        if (file.size > APP_TRANSLATION_UPLOAD_LIMITS.MAX_BYTES) {
            setNotice({ message: t('The file can be at most 2 MB.'), isError: true });
            return;
        }
        setBusy('upload');
        try {
            setUploadResult(await uploadAppTranslations(file));
            router.refresh();
        } catch (error) {
            setNotice({ message: messageOf(error, t), isError: true });
        } finally {
            setBusy(null);
        }
    };

    const publish = async () => {
        setBusy('publish');
        try {
            const result = await publishAppTranslations();
            setNotice({
                message: t('Translations published. ({count})', { count: formatCount(result.entries) }),
                isError: false,
            });
            router.refresh();
        } catch (error) {
            setNotice({ message: messageOf(error, t), isError: true });
        } finally {
            setBusy(null);
        }
    };

    return (
        <>
            <span className="helper">
                {t('Last published')}: {lastPublishedAt ? formatDateTime(lastPublishedAt) : t('Never')}
            </span>
            <button
                type="button"
                className="btn btn-secondary"
                disabled={busy !== null}
                onClick={() => void download()}
            >
                <DownloadIcon />
                {t('Download')}
            </button>
            <button
                type="button"
                className="btn btn-secondary"
                disabled={busy !== null}
                onClick={() => fileInput.current?.click()}
            >
                <ImportIcon />
                {busy === 'upload' ? t('Uploading…') : t('Upload')}
            </button>
            <input
                ref={fileInput}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(event) => void upload(event.target.files?.[0])}
            />
            <button type="button" className="btn btn-secondary" onClick={() => setAdding(true)}>
                <PlusIcon />
                {t('Add Translation')}
            </button>
            <button type="button" className="btn btn-primary" disabled={busy !== null} onClick={() => void publish()}>
                <RefreshIcon />
                {busy === 'publish' ? t('Publishing…') : t('Publish translations')}
            </button>
            {adding && (
                <TranslationDialog
                    languages={languages}
                    editing={null}
                    onSaved={() => {
                        setAdding(false);
                        setNotice({ message: t('Translation added.'), isError: false });
                        router.refresh();
                    }}
                    onClose={() => setAdding(false)}
                />
            )}
            {uploadResult && <UploadResultDialog result={uploadResult} onClose={() => setUploadResult(null)} />}
            {notice && <Toast message={notice.message} isError={notice.isError} onClose={() => setNotice(null)} />}
        </>
    );
}
