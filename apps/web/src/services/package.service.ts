import { type PackageFilters, type PackagePage, type PackagePageAnswer, type PackageSort, PACKAGE_LIMITS } from '@/types/package.types';

import { apiClient } from './api-client';

const BASE = '/package';

const joined = (codes: readonly number[]): string | undefined => (codes.length > 0 ? codes.join(',') : undefined);

const listQuery = (filters: PackageFilters, sort: PackageSort, page: number) => ({
    page,
    sort,
    search: filters.search.trim() || undefined,
    masterParkId: filters.parkId || undefined,
    priceMin: filters.priceFrom > PACKAGE_LIMITS.PRICE_MIN ? filters.priceFrom : undefined,
    priceMax: filters.priceTo < PACKAGE_LIMITS.PRICE_MAX ? filters.priceTo : undefined,
    nightsMin: filters.nightsFrom > PACKAGE_LIMITS.NIGHTS_MIN ? filters.nightsFrom : undefined,
    nightsMax: filters.nightsTo < PACKAGE_LIMITS.NIGHTS_MAX ? filters.nightsTo : undefined,
    safarisMin: filters.safarisFrom > PACKAGE_LIMITS.SAFARIS_MIN ? filters.safarisFrom : undefined,
    safarisMax: filters.safarisTo < PACKAGE_LIMITS.SAFARIS_MAX ? filters.safarisTo : undefined,
    stays: joined(filters.stays),
    features: joined(filters.features),
    inclusions: joined(filters.inclusions),
});

export const listPackages = (
    filters: PackageFilters,
    sort: PackageSort,
    page: number,
    signal?: AbortSignal,
): Promise<PackagePage> => apiClient.get<PackagePage>(`${BASE}/packages`, { query: listQuery(filters, sort, page), signal });

export const getPackagePage = (slug: string): Promise<PackagePageAnswer> =>
    apiClient.get<PackagePageAnswer>(`${BASE}/packages/${encodeURIComponent(slug)}`);

export const packageFileUrl = (slug: string, fileName: string): string =>
    apiClient.fileUrl(`${BASE}/packages/${encodeURIComponent(slug)}/files/${encodeURIComponent(fileName)}`);
