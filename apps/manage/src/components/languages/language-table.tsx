'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { MasterSwitch } from '@/components/ui/master-switch';
import { EditIcon } from '@/components/ui/icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { formatCount } from '@/lib/format';
import { ApiError } from '@/services/api-error';
import { setLanguageStatus } from '@/services/language.service';
import {
    BASE_LANGUAGE_CODE,
    LANGUAGE_SITE_LABEL,
    LANGUAGE_SITES,
    type Language,
    LanguageStatus,
    type LanguageStatusCode,
} from '@/types/language.types';

import { LanguageDialog } from './language-dialog';

const STATUS_BADGES: Record<LanguageStatusCode, { readonly className: string; readonly label: string }> = {
    [LanguageStatus.ACTIVE]: { className: 'badge badge-success', label: 'Active' },
    [LanguageStatus.INACTIVE]: { className: 'badge badge-neutral', label: 'Inactive' },
};

type Notice = { readonly message: string; readonly isError: boolean };

export function LanguageTable({
    rows,
    firstSerial,
}: {
    readonly rows: readonly Language[];
    readonly firstSerial: number;
}) {
    const t = useT();
    const router = useRouter();
    const [editing, setEditing] = useState<Language | null>(null);
    const [switching, setSwitching] = useState<string | null>(null);
    const [notice, setNotice] = useState<Notice | null>(null);

    const toggle = async (row: Language) => {
        const next = row.status === LanguageStatus.ACTIVE ? LanguageStatus.INACTIVE : LanguageStatus.ACTIVE;
        setSwitching(row.code);
        try {
            await setLanguageStatus(row.code, next);
            setNotice({
                message:
                    next === LanguageStatus.ACTIVE
                        ? t('Language activated.')
                        : row.defaultFor.length > 0
                          ? t(
                                'Language deactivated. The portals and websites it was the default for now start in English.',
                            )
                          : t('Language deactivated.'),
                isError: false,
            });
            router.refresh();
        } catch (error) {
            setNotice({
                message:
                    error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
                        ? t(error.message)
                        : t('It could not be changed. Please try again.'),
                isError: true,
            });
        } finally {
            setSwitching(null);
        }
    };

    return (
        <>
            <div className="table-scroll">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col" className="col-sno">
                                {t('S.No')}
                            </th>
                            <th scope="col">{t('Name')}</th>
                            <th scope="col">{t('Native Name')}</th>
                            <th scope="col">{t('Short Name')}</th>
                            <th scope="col">{t('Code')}</th>
                            <th scope="col">{t('Shown in')}</th>
                            <th scope="col">{t('Default for')}</th>
                            <th scope="col" className="col-status">
                                {t('Status')}
                            </th>
                            <th scope="col" className="col-actions">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="mt-empty">
                                    {t('No languages match this filter.')}
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, index) => {
                                const badge = STATUS_BADGES[row.status];
                                return (
                                    <tr key={row.code}>
                                        <td className="col-sno">{formatCount(firstSerial + index)}</td>
                                        <td>{row.name}</td>
                                        <td>{row.nativeName}</td>
                                        <td>{row.shortName}</td>
                                        <td>{row.code}</td>
                                        <td>
                                            {row.shownIn.length === LANGUAGE_SITES.length
                                                ? t('All')
                                                : row.shownIn.length > 0
                                                  ? row.shownIn.map((site) => t(LANGUAGE_SITE_LABEL[site])).join(', ')
                                                  : t('Nowhere')}
                                        </td>
                                        <td>
                                            {row.defaultFor.length > 0
                                                ? row.defaultFor.map((app) => t(LANGUAGE_SITE_LABEL[app])).join(', ')
                                                : '—'}
                                        </td>
                                        <td className="col-status">
                                            <span className={badge.className}>{t(badge.label)}</span>
                                        </td>
                                        <td className="col-actions">
                                            <div className="mt-acts">
                                                <button
                                                    type="button"
                                                    className="btn-icon"
                                                    aria-label={t('Edit {name}', { name: row.name })}
                                                    data-tooltip={t('Edit')}
                                                    onClick={() => setEditing(row)}
                                                >
                                                    <EditIcon />
                                                </button>
                                                <MasterSwitch
                                                    name={row.name}
                                                    active={row.status === LanguageStatus.ACTIVE}
                                                    busy={switching === row.code}
                                                    lockedReason={
                                                        row.code === BASE_LANGUAGE_CODE
                                                            ? t('English is the base language')
                                                            : undefined
                                                    }
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
                <LanguageDialog
                    editing={editing}
                    onSaved={() => {
                        setEditing(null);
                        setNotice({ message: t('Language updated.'), isError: false });
                        router.refresh();
                    }}
                    onClose={() => setEditing(null)}
                />
            )}
            {notice && <Toast message={notice.message} isError={notice.isError} onClose={() => setNotice(null)} />}
        </>
    );
}
