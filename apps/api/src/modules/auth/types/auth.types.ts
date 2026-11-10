import { ClientApp, type ClientAppCode, getRequestContext } from '../../../core/context';
import type { RowDataPacket } from '../../../database/connection';

export const RefreshTokenStatus = { ACTIVE: 1, RETIRED: -1 } as const;

export const SESSION_COOKIES = { ACCESS: 'access_token', REFRESH: 'refresh_token' } as const;

export type SessionCookieKind = (typeof SESSION_COOKIES)[keyof typeof SESSION_COOKIES];

export const SESSION_COOKIE_APP: Readonly<Partial<Record<ClientAppCode, string>>> = {
    [ClientApp.MANAGE]: 'manage_',
    [ClientApp.WEB]: 'web_',
};

export const SESSION_APPS: ReadonlySet<ClientAppCode> = new Set([ClientApp.MANAGE, ClientApp.WEB]);

export const currentSessionApp = (): ClientAppCode | undefined => {
    const code = getRequestContext()?.clientApp;
    return code !== undefined && SESSION_APPS.has(code) ? code : undefined;
};

export const REFRESH_COOKIE_PATH = '/api/auth';

export const REFRESH_REUSE_GRACE_SECONDS = 30;

export const SESSION_USER_HEADER = 'X-Session-User';

export const AUTH_LIMITS = { IDENTIFIER: 254, PASSWORD: 200, EMAIL: 254 } as const;

export const PASSWORD_LIMITS = { MIN: 8, MAX: 72 } as const;

export const SIGN_UP_LIMITS = { NAME_MIN: 2, NAME_MAX: 100, EMAIL: 254 } as const;

export const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;

export const TokenType = { ACCESS: 'access', REFRESH: 'refresh' } as const;

export const PasswordResetStatus = { ISSUED: 1, USED: 2, RETIRED: -1 } as const;

export const PASSWORD_RESET_LIFETIME_MINUTES = 60;

export const PASSWORD_RESET_PATH = '/forgot-password';

export interface PasswordResetRow extends RowDataPacket {
    id: number;
    userId: number;
    clientApp: number;
    status: number;
    isExpired: number;
}

export type AppUrls = Readonly<Record<'manage' | 'web', string>>;

export type AuthSettings = {
    readonly accessTokenSecret: string;
    readonly accessTokenLifetimeSeconds: number;
    readonly refreshTokenSecret: string;
    readonly refreshTokenLifetimeSeconds: number;
    readonly cookieDomain: string | undefined;
    readonly cookiePrefix: string;
    readonly cookieSecure: boolean;
};

export interface RefreshTokenRow extends RowDataPacket {
    id: number;
    userId: number;
    clientApp: number;
    expiresAt: string;
}

export interface RetiredRefreshTokenRow extends RowDataPacket {
    id: number;
    userId: number;
}
