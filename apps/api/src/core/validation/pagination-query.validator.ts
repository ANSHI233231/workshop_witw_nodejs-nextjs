import { z } from 'zod';

export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;

/** Out-of-range values are clamped, not rejected: `?page=0` is page 1, `?limit=1000` is 100. */
export const paginationQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .default(1)
        .transform((value) => Math.max(value, 1)),
    limit: z.coerce
        .number()
        .int()
        .default(PAGINATION_DEFAULT_LIMIT)
        .transform((value) => Math.min(Math.max(value, 1), PAGINATION_MAX_LIMIT)),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const EXPORT_MAX_ROWS = 10000;

export const EXPORT_PAGE: PaginationQuery = { page: 1, limit: EXPORT_MAX_ROWS };

export const toOffset = (pagination: PaginationQuery): number => (pagination.page - 1) * pagination.limit;
