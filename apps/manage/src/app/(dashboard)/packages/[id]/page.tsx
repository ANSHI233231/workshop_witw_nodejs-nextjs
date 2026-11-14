import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { PackageConsoleDetail } from '@/components/package/package-console-detail';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { requireConsoleArea } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { type PageSearchParams, idParam, singleParam } from '@/lib/search-params';
import { ApiError } from '@/services/api-error';
import { getAdminFormOptions, getAdminPackage, getAdminVersion } from '@/services/package.service';
import { PackageVersionStatus, PackageWebsiteStatus } from '@/types/package.types';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Package preview / edit'),
});

export default async function PackageDetailPage({
    params,
    searchParams,
}: {
    readonly params: Promise<{ id: string }>;
    readonly searchParams: Promise<PageSearchParams>;
}) {
    await requireConsoleArea('platform');
    const id = idParam((await params).id);
    if (id === undefined) notFound();
    const query = await searchParams;
    const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const summary = await getAdminPackage(id, token).catch((error: unknown) => {
        if (error instanceof ApiError && error.code === 'PACKAGE_NOT_FOUND') notFound();
        throw error;
    });
    const deleted = summary.websiteStatus === PackageWebsiteStatus.DELETED_BY_ADMIN;
    const waitingId = summary.working?.status === PackageVersionStatus.WAITING ? summary.working.id : null;
    const asked = singleParam(query['version']);
    const which = deleted ? 'live' : asked === 'live' || asked === 'waiting' ? asked : waitingId ? 'waiting' : 'live';
    const versionId = which === 'waiting' ? waitingId : (summary.live?.id ?? null);
    const nameFrom = versionId ?? summary.live?.id ?? summary.working?.id;
    if (nameFrom === undefined) notFound();
    const [view, named] = await Promise.all([
        versionId === null ? null : getAdminVersion(id, versionId, token),
        versionId === null ? getAdminVersion(id, nameFrom, token) : null,
    ]);
    const options = view && !deleted ? await getAdminFormOptions(id, token) : null;
    return (
        <PackageConsoleDetail
            key={[id, view?.version.id ?? 0, view?.version.status ?? 0, summary.websiteStatus, which].join(':')}
            summary={summary}
            view={view}
            title={(view ?? named)?.version.name ?? ''}
            which={which}
            initialTab={singleParam(query['tab']) === 'edit' ? 'edit' : 'preview'}
            options={options}
        />
    );
}
