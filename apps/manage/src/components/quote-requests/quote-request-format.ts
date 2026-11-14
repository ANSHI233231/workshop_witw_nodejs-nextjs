import { formatDate, formatStamp } from '@/lib/format';
import {
    type QuoteMarkCode,
    QuoteMark,
    type QuoteRequest,
    QuoteRequestStatus,
    type QuoteRequestStatusCode,
} from '@/types/quote-request.types';

export const QUOTE_STATUS_BADGE: Readonly<
    Record<QuoteRequestStatusCode, { readonly label: string; readonly className: string }>
> = {
    [QuoteRequestStatus.ACTIVE]: { label: 'Active', className: 'badge badge-success' },
    [QuoteRequestStatus.INACTIVE]: { label: 'Inactive', className: 'badge badge-neutral' },
};

export const markLabelOf = (mark: QuoteMarkCode | null): string =>
    mark === QuoteMark.HOT ? 'Hot' : mark === QuoteMark.COLD ? 'Cold' : '–';

export const packageTextOf = (request: QuoteRequest): string =>
    `${request.package.name} (v${request.package.versionNumber})`;

export const contactOf = (request: QuoteRequest): string =>
    [request.user.email, request.user.mobile].filter(Boolean).join(' · ');

export const startTextOf = (request: QuoteRequest): string => formatDate(`${request.startDate}T00:00:00+05:30`);

export const receivedTextOf = (request: QuoteRequest): string => formatStamp(request.receivedAt);
