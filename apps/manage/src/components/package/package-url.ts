import { listUrl } from '@/lib/list-url';
import type { ApprovalFilters, DeleteReasonFilters, PackageListFilters } from '@/types/package.types';

export const PACKAGE_APPROVALS_PATH = '/package-approvals';

export const PACKAGES_PATH = '/packages';

export const DELETE_REASONS_PATH = '/package-delete-reasons';

export const approvalListUrl = (filters: ApprovalFilters): string =>
    listUrl(PACKAGE_APPROVALS_PATH, { search: filters.search, page: filters.page });

export const packageListParams = (filters: Omit<PackageListFilters, 'page'>) => ({
    search: filters.search,
    websiteStatus: filters.websiteStatus,
    partnerId: filters.partnerId,
});

export const packageListUrl = (filters: PackageListFilters): string =>
    listUrl(PACKAGES_PATH, { ...packageListParams(filters), page: filters.page });

export const reasonListParams = (filters: Omit<DeleteReasonFilters, 'page'>) => ({
    search: filters.search,
    status: filters.status,
});

export const reasonListUrl = (filters: DeleteReasonFilters): string =>
    listUrl(DELETE_REASONS_PATH, { ...reasonListParams(filters), page: filters.page });

export const packageViewUrl = (packageId: number, version: 'waiting' | 'live', tab: 'preview' | 'edit'): string =>
    `${PACKAGES_PATH}/${packageId}?version=${version}&tab=${tab}`;
