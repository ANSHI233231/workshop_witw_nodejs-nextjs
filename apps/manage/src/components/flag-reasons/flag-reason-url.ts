import { listUrl } from '@/lib/list-url';
import type { FlagReasonFilters } from '@/types/flag-reason.types';

export const FLAG_REASONS_PATH = '/flag-reasons';

export const flagReasonUrl = (filters: FlagReasonFilters): string =>
    listUrl(FLAG_REASONS_PATH, { search: filters.search, status: filters.status });
