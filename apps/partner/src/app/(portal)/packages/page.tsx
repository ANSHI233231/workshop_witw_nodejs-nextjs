import type { Metadata } from 'next';
import Link from 'next/link';

import { PackageRows } from '@/components/package/package-rows';
import { PageBreadcrumb } from '@/components/portal/page-breadcrumb';
import { PlusIcon } from '@/components/ui/icons';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { readAccessToken, requireActivePartner } from '@/lib/portal-session';
import { listPackages } from '@/services/package.service';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Packages'),
});

export default async function PackagesPage() {
    await requireActivePartner();
    const { t } = await serverTranslator();
    const rows = await listPackages(await readAccessToken());
    return (
        <div className="page">
            <div>
                <PageBreadcrumb portalLabel={t('Partner Portal')} pageLabel={t('Packages')} ariaLabel={t('Breadcrumb')} />
                <div className="page-head">
                    <h1 className="page-title">{t('Packages')}</h1>
                    <div className="actions">
                        <Link className="btn btn-primary" href="/packages/new">
                            <PlusIcon />
                            {t('Add Package')}
                        </Link>
                    </div>
                </div>
            </div>
            <div className="table-card">
                <PackageRows rows={rows} />
            </div>
        </div>
    );
}
