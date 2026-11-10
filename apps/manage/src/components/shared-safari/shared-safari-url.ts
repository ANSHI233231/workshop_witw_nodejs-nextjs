import { listUrl } from '@/lib/list-url';
import type { FlaggedFilters, SafariFilters } from '@/types/shared-safari.types';

export const SHARED_SAFARIS_PATH = '/shared-safaris';

export const FLAGGED_COMMENTS_PATH = '/flagged-comments';

export const sharedSafariPath = (id: number): string => `${SHARED_SAFARIS_PATH}/${id}`;

export const safariListParams = (filters: Omit<SafariFilters, 'page'>) => ({
    search: filters.search,
    status: filters.status,
    hostId: filters.hostId,
});

export const safariListUrl = (filters: SafariFilters): string =>
    listUrl(SHARED_SAFARIS_PATH, { ...safariListParams(filters), page: filters.page });

export const flaggedListParams = (filters: Omit<FlaggedFilters, 'page'>) => ({ search: filters.search });

export const flaggedListUrl = (filters: FlaggedFilters): string =>
    listUrl(FLAGGED_COMMENTS_PATH, { ...flaggedListParams(filters), page: filters.page });
