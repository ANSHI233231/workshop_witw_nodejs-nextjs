import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { Paginated } from '@/types/api.types';
import type {
    MailLogDetail,
    MailLogFilters,
    MailLogListItem,
    MailTemplateDetail,
    MailTemplateFilters,
    MailTemplateItem,
} from '@/types/mail.types';

import { apiClient } from './api-client';

export const MAIL_LOGS_PER_PAGE = 20;

const cookieOf = (accessToken: string | undefined): Record<string, string> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const listMailLogs = (
    filters: MailLogFilters,
    accessToken: string | undefined,
): Promise<Paginated<MailLogListItem>> =>
    apiClient.paginated<MailLogListItem>('/mail/logs', {
        query: {
            search: filters.search || undefined,
            template: filters.template,
            status: filters.status,
            page: filters.page,
            limit: MAIL_LOGS_PER_PAGE,
        },
        headers: cookieOf(accessToken),
    });

export const listMailTemplates = (
    accessToken: string | undefined,
    filters?: MailTemplateFilters,
): Promise<MailTemplateItem[]> =>
    apiClient.get<MailTemplateItem[]>('/mail/templates', {
        query: { search: filters?.search || undefined, status: filters?.status },
        headers: cookieOf(accessToken),
    });

export const getMailTemplate = (id: number): Promise<MailTemplateDetail> =>
    apiClient.get<MailTemplateDetail>(`/mail/templates/${id}`);

export const getMailLog = (id: number): Promise<MailLogDetail> => apiClient.get<MailLogDetail>(`/mail/logs/${id}`);
