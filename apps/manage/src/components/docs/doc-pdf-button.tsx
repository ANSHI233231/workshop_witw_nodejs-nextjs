'use client';

import { DownloadIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';

const MARKDOWN_EXTENSION = /\.md$/i;

const pdfTitleOf = (docPath: string): string =>
    docPath.slice(docPath.lastIndexOf('/') + 1).replace(MARKDOWN_EXTENSION, '');

export function DocPdfButton({ docPath }: { readonly docPath: string }) {
    const t = useT();
    const download = () => {
        const pageTitle = document.title;
        const restore = () => {
            document.title = pageTitle;
            window.removeEventListener('afterprint', restore);
        };
        window.addEventListener('afterprint', restore);
        document.title = pdfTitleOf(docPath);
        window.print();
    };
    return (
        <button type="button" className="btn btn-secondary dc-pdf" onClick={download}>
            <DownloadIcon />
            {t('Download PDF')}
        </button>
    );
}
