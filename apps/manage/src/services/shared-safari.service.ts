import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type { Paginated } from '@/types/api.types';
import type {
    AdminDeleteInput,
    CommentFlags,
    ConsoleSafari,
    ConsoleSafariDetail,
    FlaggedComment,
    FlaggedFilters,
    HostOption,
    SafariFilters,
} from '@/types/shared-safari.types';

import { apiClient } from './api-client';

export const SHARED_SAFARI_PAGE_SIZE = 20;

const ADMIN_PATH = '/shared-safari/admin';

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const listSharedSafaris = (
    filters: SafariFilters,
    accessToken: string | undefined,
): Promise<Paginated<ConsoleSafari>> =>
    apiClient.paginated<ConsoleSafari>(`${ADMIN_PATH}/safaris`, {
        query: {
            search: filters.search || undefined,
            status: filters.status,
            hostId: filters.hostId,
            page: filters.page,
            limit: SHARED_SAFARI_PAGE_SIZE,
        },
        headers: cookieHeader(accessToken),
    });

export const listSafariHosts = (accessToken: string | undefined): Promise<HostOption[]> =>
    apiClient.get<HostOption[]>(`${ADMIN_PATH}/hosts`, { headers: cookieHeader(accessToken) });

export const getSharedSafari = (id: number, accessToken?: string): Promise<ConsoleSafariDetail> =>
    apiClient.get<ConsoleSafariDetail>(`${ADMIN_PATH}/safaris/${id}`, { headers: cookieHeader(accessToken) });

export const sharedSafariCoverUrl = (id: number, coverVersion: string): string =>
    apiClient.fileUrl(`${ADMIN_PATH}/safaris/${id}/cover-image`, { v: coverVersion });

export const deleteSharedSafari = (id: number, input: AdminDeleteInput): Promise<void> =>
    apiClient.post<void>(`${ADMIN_PATH}/safaris/${id}/delete`, input);

export const makeSharedSafariActive = (id: number): Promise<void> =>
    apiClient.post<void>(`${ADMIN_PATH}/safaris/${id}/make-active`);

export const setSharedSafariPinned = (id: number, pinned: boolean): Promise<void> =>
    apiClient.patch<void>(`${ADMIN_PATH}/safaris/${id}/pin`, { pinned });

export const deleteSafariComment = (commentId: number): Promise<void> =>
    apiClient.delete<void>(`${ADMIN_PATH}/comments/${commentId}`);

export const listFlaggedComments = (
    filters: FlaggedFilters,
    accessToken: string | undefined,
): Promise<Paginated<FlaggedComment>> =>
    apiClient.paginated<FlaggedComment>(`${ADMIN_PATH}/flagged-comments`, {
        query: { search: filters.search || undefined, page: filters.page, limit: SHARED_SAFARI_PAGE_SIZE },
        headers: cookieHeader(accessToken),
    });

export const getCommentFlags = (commentId: number): Promise<CommentFlags> =>
    apiClient.get<CommentFlags>(`${ADMIN_PATH}/comments/${commentId}/flags`);

export const ignoreCommentFlags = (commentId: number): Promise<void> =>
    apiClient.post<void>(`${ADMIN_PATH}/comments/${commentId}/ignore-flags`);
