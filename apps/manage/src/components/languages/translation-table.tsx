'use client';

import { useRouter } from 'next/navigation';
import { type CSSProperties, useState } from 'react';

import { MasterSwitch } from '@/components/ui/master-switch';
import { EditIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { formatCount, formatDate } from '@/lib/format';
import { setAppTranslationStatus } from '@/services/language.service';
import {
    type AppTranslation,
    type AppTranslationLanguage,
    AppTranslationStatus,
    type AppTranslationStatusCode,
} from '@/types/language.types';

import { TranslationDialog } from './translation-dialog';

const STATUS_BADGES: Record<AppTranslationStatusCode, { readonly className: string; readonly label: string }> = {
    [AppTranslationStatus.ACTIVE]: { className: 'badge badge-success', label: 'Active' },
    [AppTranslationStatus.INACTIVE]: { className: 'badge badge-neutral', label: 'Inactive' },
};

type Notice = { readonly message: string; readonly isError: boolean };

export function TranslationTable({
    rows,
    languages,
    firstSerial,
}: {
    readonly rows: readonly AppTranslation[];
    readonly languages: readonly AppTranslationLanguage[];
    readonly firstSerial: number;
}) {
    const t = useT();
    const router = useRouter();
    const [editing, setEditing] = useState<AppTranslation | null>(null);
    const [switching, setSwitching] = useState<number | null>(null);
    const [notice, setNotice] = useState<Notice | null>(null);

    const toggle = async (row: AppTranslation) => {
        const next =
            row.status === AppTranslationStatus.ACTIVE ? AppTranslationStatus.INACTIVE : AppTranslationStatus.ACTIVE;
        setSwitching(row.id);
        try {
            await setAppTranslationStatus(row.id, next);
            setNotice({
                message:
                    next === AppTranslationStatus.ACTIVE ? t('Translation activated.') : t('Translation deactivated.'),
                isError: false,
            });
            router.refresh();
        } catch {
            setNotice({ message: t('It could not be changed. Please try again.'), isError: true });
        } finally {
            setSwitching(null);
        }
    };

    return (
        <>
            <div className="table-scroll">
                <table
                    className="table tr-table"
                    style={{ '--tr-text-columns': languages.length + 1 } as CSSProperties}
                >
                    <thead>
                        <tr>
                            <th scope="col" className="col-sno">
                                {t('S.No')}
                            </th>
                            <th scope="col" className="tr-text">
                                {t('English Text')}
                            </th>
                            {languages.map((language) => (
                                <th key={language.code} scope="col" className="tr-text">
                                    {t('{language} Text', { language: language.name })}
                                </th>
                            ))}
                            <th scope="col" className="col-status tr-fixed">
                                {t('Status')}
                            </th>
                            <th scope="col" className="tr-fixed">
                                {t('Updated On')}
                            </th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={5 + languages.length} className="mt-empty">
                                    {t('No translations match this filter.')}
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, index) => {
                                const badge = STATUS_BADGES[row.status];
                                return (
                                    <tr key={row.id}>
                                        <td className="col-sno">{formatCount(firstSerial + index)}</td>
                                        <td className="tr-text">{row.enText}</td>
                                        {languages.map((language) => (
                                            <td key={language.code} className="tr-text" lang={language.code}>
                                                {row.texts[language.code] ?? ''}
                                            </td>
                                        ))}
                                        <td className="col-status tr-fixed">
                                            <span className={badge.className}>{t(badge.label)}</span>
                                        </td>
                                        <td className="tr-fixed">{formatDate(row.updatedAt)}</td>
                                        <td className="col-actions">
                                            <div className="mt-acts">
                                                <button
                                                    type="button"
                                                    className="btn-icon"
                                                    aria-label={t('Edit {name}', { name: row.enText })}
                                                    data-tooltip={t('Edit')}
                                                    onClick={() => setEditing(row)}
                                                >
                                                    <EditIcon />
                                                </button>
                                                <MasterSwitch
                                                    name={row.enText}
                                                    active={row.status === AppTranslationStatus.ACTIVE}
                                                    busy={switching === row.id}
                                                    onToggle={() => void toggle(row)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            {editing && (
                <TranslationDialog
                    editing={editing}
                    languages={languages}
                    onSaved={() => {
                        setEditing(null);
                        setNotice({ message: t('Translation updated.'), isError: false });
                        router.refresh();
                    }}
                    onClose={() => setEditing(null)}
                />
            )}
            {notice && <Toast message={notice.message} isError={notice.isError} onClose={() => setNotice(null)} />}
        </>
    );
}
