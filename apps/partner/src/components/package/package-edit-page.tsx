import Link from 'next/link';

import { PackageEditorHost } from '@/components/package/package-editor-host';
import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { FormOptions, PackageView } from '@/types/package.types';

export async function PackageEditPage({
    view,
    options,
    partnerName,
}: {
    readonly view: PackageView | null;
    readonly options: FormOptions;
    readonly partnerName: string;
}) {
    const { t } = await serverTranslator();
    return (
        <div className="page">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('Partner Portal')}</a>
                    <BreadcrumbChevronIcon />
                    <Link href="/packages">{t('Packages')}</Link>
                    <BreadcrumbChevronIcon />
                    <span>{view ? t('Edit package') : t('Add package')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{view ? view.version.name : t('Add package')}</h1>
                </div>
            </div>
            <PackageEditorHost
                key={
                    view
                        ? [
                              view.package.id,
                              view.version.id,
                              view.version.status,
                              view.package.websiteStatus,
                              view.package.working?.id ?? 0,
                          ].join(':')
                        : 'new'
                }
                initial={view}
                options={options}
                partnerName={partnerName}
            />
        </div>
    );
}
