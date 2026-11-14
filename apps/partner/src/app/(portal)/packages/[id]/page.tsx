import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PackageEditPage } from '@/components/package/package-edit-page';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { readAccessToken, requireActivePartner } from '@/lib/portal-session';
import { type PageSearchParams, idParam } from '@/lib/search-params';
import { ApiError } from '@/services/api-error';
import { getFormOptions, getPackageView } from '@/services/package.service';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Edit package'),
});

export default async function PackagePage({
    params,
    searchParams,
}: {
    readonly params: Promise<{ id: string }>;
    readonly searchParams: Promise<PageSearchParams>;
}) {
    const { request } = await requireActivePartner();
    const id = idParam((await params).id);
    if (id === undefined) notFound();
    const versionId = idParam((await searchParams)['version']);
    const token = await readAccessToken();
    const [view, options] = await Promise.all([getPackageView(id, versionId, token), getFormOptions(token)]).catch(
        (error: unknown) => {
            if (error instanceof ApiError && (error.code === 'PACKAGE_NOT_FOUND' || error.code === 'PACKAGE_VERSION_NOT_FOUND'))
                notFound();
            throw error;
        },
    );
    return <PackageEditPage view={view} options={options} partnerName={request?.businessName ?? ''} />;
}
