import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type {
    MyProfile,
    MyProfileInput,
    PartnerPackagePage,
    PartnerParkPage,
    PartnerProfile,
    UserProfileAnswer,
    UserSafariPage,
} from '@/types/profile.types';

import { apiClient } from './api-client';

const BASE = '/profile';

export const getMyProfile = (): Promise<MyProfile> => apiClient.get<MyProfile>(`${BASE}/me`);

export const saveMyProfile = (input: MyProfileInput): Promise<MyProfile> => apiClient.put<MyProfile>(`${BASE}/me`, input);

const pictureForm = (field: string, file: File): FormData => {
    const body = new FormData();
    body.append(field, file);
    return body;
};

export const saveMyPhoto = (file: File): Promise<MyProfile> =>
    apiClient.put<MyProfile>(`${BASE}/me/photo`, pictureForm('photo', file));

export const removeMyPhoto = (): Promise<MyProfile> => apiClient.delete<MyProfile>(`${BASE}/me/photo`);

export const saveMyCoverPhoto = (file: File): Promise<MyProfile> =>
    apiClient.put<MyProfile>(`${BASE}/me/cover-photo`, pictureForm('coverPhoto', file));

export const removeMyCoverPhoto = (): Promise<MyProfile> => apiClient.delete<MyProfile>(`${BASE}/me/cover-photo`);

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const getUserProfile = (userId: number, accessToken?: string): Promise<UserProfileAnswer> =>
    apiClient.get<UserProfileAnswer>(`${BASE}/users/${userId}`, { headers: cookieHeader(accessToken) });

export const listUserSafaris = (userId: number, page: number): Promise<UserSafariPage> =>
    apiClient.get<UserSafariPage>(`${BASE}/users/${userId}/safaris`, { query: { page } });

export const userPhotoUrl = (userId: number, photoVersion: string): string =>
    apiClient.fileUrl(`${BASE}/users/${userId}/photo`, { v: photoVersion });

export const userCoverPhotoUrl = (userId: number, coverPhotoVersion: string): string =>
    apiClient.fileUrl(`${BASE}/users/${userId}/cover-photo`, { v: coverPhotoVersion });

export const getPartnerProfile = (partnerId: number): Promise<PartnerProfile> =>
    apiClient.get<PartnerProfile>(`${BASE}/partners/${partnerId}`);

export const listPartnerPackages = (partnerId: number, page: number): Promise<PartnerPackagePage> =>
    apiClient.get<PartnerPackagePage>(`${BASE}/partners/${partnerId}/packages`, { query: { page } });

export const listPartnerParks = (partnerId: number, page: number): Promise<PartnerParkPage> =>
    apiClient.get<PartnerParkPage>(`${BASE}/partners/${partnerId}/parks`, { query: { page } });
