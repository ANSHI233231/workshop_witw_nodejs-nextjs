import { listUrl } from '@/lib/list-url';
import type { PartnerFilters } from '@/types/partner.types';

export const PARTNER_REQUESTS_PATH = '/partner-requests';

export const PARTNERS_PATH = '/partners';

export const partnerListParams = (filters: Omit<PartnerFilters, 'page'>) => ({
    search: filters.search,
    status: filters.status,
});

export const partnerListUrl = (path: string, filters: PartnerFilters): string =>
    listUrl(path, { ...partnerListParams(filters), page: filters.page });
