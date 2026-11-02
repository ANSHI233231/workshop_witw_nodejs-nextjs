import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { type AuthUser, type ChangePasswordInput, type PasswordResetInput, type SignInInput } from '@/types/auth.types';

import { apiClient } from './api-client';
import { ApiError } from './api-error';
import { forgetSessionUser } from './session-user';

type UserResponse = { readonly user: AuthUser };

const UNAUTHENTICATED = 'UNAUTHENTICATED';

const CONSOLE_ACCESS_DENIED = 'CONSOLE_ACCESS_DENIED';

const isSignedOut = (error: unknown): boolean =>
    error instanceof ApiError && (error.code === UNAUTHENTICATED || error.code === CONSOLE_ACCESS_DENIED);


export const signIn = async (input: SignInInput): Promise<AuthUser> =>
    (await apiClient.post<UserResponse>('/auth/sign-in', input)).user;

const requestRefresh = async (): Promise<AuthUser | null> => {
    try {
        return (await apiClient.post<UserResponse>('/auth/refresh')).user;
    } catch (error) {
        if (isSignedOut(error)) return null;
        throw error;
    }
};

let refreshInFlight: Promise<AuthUser | null> | null = null;

export const refreshSession = (): Promise<AuthUser | null> => {
    refreshInFlight ??= requestRefresh().finally(() => {
        refreshInFlight = null;
    });
    return refreshInFlight;
};

export const signOut = (): Promise<void> => {
    forgetSessionUser();
    return apiClient.post<void>('/auth/sign-out');
};

export const confirmSession = async (): Promise<void> => {
    await apiClient.get<UserResponse>('/auth/me').catch(() => undefined);
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
    try {
        return (await apiClient.get<UserResponse>('/auth/me')).user;
    } catch (error) {
        if (error instanceof ApiError && error.code === UNAUTHENTICATED) return refreshSession();
        if (isSignedOut(error)) return null;
        throw error;
    }
};

export const getSignedInUser = async (accessToken: string | undefined): Promise<AuthUser | null> => {
    if (!accessToken) return null;
    try {
        const response = await apiClient.get<UserResponse>('/auth/me', {
            headers: { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` },
        });
        return response.user;
    } catch (error) {
        if (isSignedOut(error)) return null;
        throw error;
    }
};

export const changePassword = (input: ChangePasswordInput): Promise<void> =>
    apiClient.post<void>('/auth/change-password', input);

export const requestPasswordReset = (email: string): Promise<null> =>
    apiClient.post<null>('/auth/forgot-password', { email });

export const checkPasswordReset = async (token: string): Promise<string> =>
    (await apiClient.get<{ readonly maskedEmail: string }>('/auth/reset-password', { query: { token } })).maskedEmail;

export const resetPassword = (input: PasswordResetInput): Promise<void> =>
    apiClient.post<void>('/auth/reset-password', input);
