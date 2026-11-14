import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { Paginated } from '@/types/api.types';
import type {
    ApprovalFilters,
    ApprovalItem,
    DeleteReason,
    DeleteReasonFilters,
    DeleteReasonStatusCode,
    FormOptions,
    PackageListFilters,
    PackageListItem,
    PackageSummary,
    PackageView,
    ParkOfVersion,
} from '@/types/package.types';
import { PartnerStatus } from '@/types/partner.types';

import { apiClient } from './api-client';
import { packageFileUrl } from './package-editor.service';
import { parkFeatureImageUrl } from './park.service';

const DEFAULT_PACKAGE_PICTURE = '/witw/default-cover.jpg';

export const packagePictureSources = (
    packageId: number,
    versionId: number | null,
    packageImage: string | null,
    mainPark: ParkOfVersion | null,
): readonly string[] => {
    const own = versionId !== null && packageImage ? packageFileUrl(packageId, versionId, packageImage) : null;
    const park = mainPark?.featureImage ? parkFeatureImageUrl(mainPark.id, mainPark.featureImage) : null;
    return [...(own ? [own] : []), ...(park ? [park] : []), DEFAULT_PACKAGE_PICTURE];
};

export const PACKAGE_PAGE_SIZE = 20;

const ADMIN = '/package/admin';

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const listPackageApprovals = (filters: ApprovalFilters, accessToken: string | undefined) =>
    apiClient.paginated<ApprovalItem>(`${ADMIN}/approvals`, {
        query: { search: filters.search || undefined, page: filters.page, limit: PACKAGE_PAGE_SIZE },
        headers: cookieHeader(accessToken),
    });

export const listConsolePackages = (
    filters: PackageListFilters,
    accessToken: string | undefined,
): Promise<Paginated<PackageListItem>> =>
    apiClient.paginated<PackageListItem>(`${ADMIN}/packages`, {
        query: {
            search: filters.search || undefined,
            websiteStatus: filters.websiteStatus,
            partnerId: filters.partnerId,
            page: filters.page,
            limit: PACKAGE_PAGE_SIZE,
        },
        headers: cookieHeader(accessToken),
    });

export const getAdminPackage = (packageId: number, accessToken: string | undefined): Promise<PackageSummary> =>
    apiClient.get<PackageSummary>(`${ADMIN}/packages/${packageId}`, { headers: cookieHeader(accessToken) });

export const getAdminVersion = (
    packageId: number,
    versionId: number,
    accessToken: string | undefined,
): Promise<PackageView> =>
    apiClient.get<PackageView>(`${ADMIN}/packages/${packageId}/versions/${versionId}`, {
        headers: cookieHeader(accessToken),
    });

export const getAdminFormOptions = (packageId: number, accessToken: string | undefined): Promise<FormOptions> =>
    apiClient.get<FormOptions>(`${ADMIN}/packages/${packageId}/form-options`, { headers: cookieHeader(accessToken) });

export const approvePackageVersion = (packageId: number, versionId: number): Promise<PackageView> =>
    apiClient.post<PackageView>(`${ADMIN}/packages/${packageId}/versions/${versionId}/approve`);

export const rejectPackageVersion = (packageId: number, versionId: number, reason: string): Promise<PackageView> =>
    apiClient.post<PackageView>(`${ADMIN}/packages/${packageId}/versions/${versionId}/reject`, { reason });

export const deleteConsolePackage = (
    packageId: number,
    masterPackageDeleteReasonId: number,
    details: string,
): Promise<PackageSummary> =>
    apiClient.post<PackageSummary>(`${ADMIN}/packages/${packageId}/delete`, { masterPackageDeleteReasonId, details });

export const setPackagePopular = (packageId: number, on: boolean): Promise<PackageSummary> =>
    apiClient.put<PackageSummary>(`${ADMIN}/packages/${packageId}/popular`, { on });

export const setPackageBestDeal = (packageId: number, on: boolean): Promise<PackageSummary> =>
    apiClient.put<PackageSummary>(`${ADMIN}/packages/${packageId}/best-deal`, { on });

export const listDeleteReasons = (filters: DeleteReasonFilters, accessToken: string | undefined) =>
    apiClient.paginated<DeleteReason>(`${ADMIN}/delete-reasons`, {
        query: {
            search: filters.search || undefined,
            status: filters.status,
            page: filters.page,
            limit: PACKAGE_PAGE_SIZE,
        },
        headers: cookieHeader(accessToken),
    });

export const listActiveDeleteReasons = (): Promise<readonly DeleteReason[]> =>
    apiClient.get<readonly DeleteReason[]>(`${ADMIN}/delete-reasons/active`);

export const addDeleteReason = (name: string): Promise<DeleteReason> =>
    apiClient.post<DeleteReason>(`${ADMIN}/delete-reasons`, { name });

export const updateDeleteReason = (id: number, name: string, status: DeleteReasonStatusCode): Promise<DeleteReason> =>
    apiClient.put<DeleteReason>(`${ADMIN}/delete-reasons/${id}`, { name, status });

export const setDeleteReasonStatus = (id: number, status: DeleteReasonStatusCode): Promise<DeleteReason> =>
    apiClient.put<DeleteReason>(`${ADMIN}/delete-reasons/${id}/status`, { status });

export const listPartnerOptions = async (
    accessToken: string | undefined,
): Promise<readonly { readonly id: number; readonly businessName: string }[]> => {
    const results = await Promise.all(
        [PartnerStatus.ACTIVE, PartnerStatus.INACTIVE].map((status) =>
            apiClient.paginated<{ readonly id: number; readonly businessName: string }>('/partner/admin/partners', {
                query: { status, page: 1, limit: 100 },
                headers: cookieHeader(accessToken),
            }),
        ),
    );
    return results
        .flatMap((result) => result.items)
        .sort((a, b) => a.businessName.localeCompare(b.businessName));
};
