export type CsvCell = string | number | null;

const BYTE_ORDER_MARK = '﻿';

const NEEDS_QUOTES = /[",;\r\n\t]/;

const DOWNLOAD_CLEANUP_MS = 500;

const csvCell = (value: CsvCell, quoteEveryCell: boolean): string => {
    const text = value === null ? '' : String(value);
    return quoteEveryCell || NEEDS_QUOTES.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const localDay = (): string => {
    const now = new Date();
    const pad = (part: number) => String(part).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const downloadCsv = (
    fileName: string,
    headers: readonly string[],
    rows: readonly (readonly CsvCell[])[],
    { quoteEveryCell = false }: { readonly quoteEveryCell?: boolean } = {},
): void => {
    const cell = (value: CsvCell) => csvCell(value, quoteEveryCell);
    const lines = [headers.map(cell).join(','), ...rows.map((row) => row.map(cell).join(','))];
    const link = document.createElement('a');
    link.href = URL.createObjectURL(
        new Blob([BYTE_ORDER_MARK + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }),
    );
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => {
        URL.revokeObjectURL(link.href);
        link.remove();
    }, DOWNLOAD_CLEANUP_MS);
};
