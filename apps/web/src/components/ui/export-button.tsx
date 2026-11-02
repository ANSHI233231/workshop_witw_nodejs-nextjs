'use client';

import { type ReactNode, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { type CsvCell, downloadCsv } from '@/lib/csv';
import { logger } from '@/lib/logger';

import { ExportIcon } from './icons';
import { Toast } from './toast';

const log = logger.category('export');

export type ExportColumn<T> = {
    readonly header: string;
    readonly value: (row: T, index: number) => CsvCell;
};

type Notice = { readonly message: string; readonly isError: boolean };

export function ExportButton<T>({
    fileName,
    columns,
    load,
    icon = <ExportIcon />,
}: {
    readonly fileName: string;
    readonly columns: readonly ExportColumn<T>[];
    readonly load: () => Promise<readonly T[]>;
    readonly icon?: ReactNode;
}) {
    const t = useT();
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState<Notice | null>(null);

    const run = async () => {
        setBusy(true);
        try {
            const rows = await load();
            if (rows.length === 0) {
                setNotice({ message: t('Nothing to export — no rows match your filters.'), isError: true });
                return;
            }
            downloadCsv(
                fileName,
                columns.map((column) => column.header),
                rows.map((row, index) => columns.map((column) => column.value(row, index))),
            );
            setNotice({
                message:
                    rows.length === 1 ? t('Exported 1 row to CSV.') : t('Exported {count} rows to CSV.', { count: rows.length }),
                isError: false,
            });
        } catch (error) {
            log.warn('Export failed', { error, fileName });
            setNotice({ message: t('This could not be done. Please try again.'), isError: true });
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void run()}>
                {icon}
                {t('Export')}
            </button>
            {notice && <Toast message={notice.message} isError={notice.isError} onClose={() => setNotice(null)} />}
        </>
    );
}

export const serialColumn = <T,>(): ExportColumn<T> => ({ header: 'S.No', value: (_row, index) => index + 1 });
