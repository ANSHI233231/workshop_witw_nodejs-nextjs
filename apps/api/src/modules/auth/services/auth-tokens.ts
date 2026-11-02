import { createHash, randomUUID } from 'node:crypto';

import jwt from 'jsonwebtoken';

import { UnauthenticatedException } from '../../../core/exceptions';
import { type AuthSettings, TokenType } from '../types/auth.types';

const ALGORITHM = 'HS256';

type TokenTypeName = (typeof TokenType)[keyof typeof TokenType];

type TokenClaims = {
    readonly sub: string;
    readonly typ: TokenTypeName;
    readonly rem: boolean;
};

export type VerifiedToken = {
    readonly userId: number;
    readonly remember: boolean;
};

export const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');

export const utcDateTimeAfter = (seconds: number): string =>
    new Date(Date.now() + seconds * 1000).toISOString().slice(0, 19).replace('T', ' ');

export const isPast = (utcDateTime: string): boolean =>
    new Date(`${utcDateTime.replace(' ', 'T')}Z`).getTime() <= Date.now();

const sign = (claims: TokenClaims, secret: string, lifetimeSeconds: number, tokenId?: string): string =>
    jwt.sign(claims, secret, {
        algorithm: ALGORITHM,
        expiresIn: lifetimeSeconds,
        ...(tokenId ? { jwtid: tokenId } : {}),
    });

export const signAccessToken = (settings: AuthSettings, userId: number, remember: boolean): string =>
    sign(
        { sub: String(userId), typ: TokenType.ACCESS, rem: remember },
        settings.accessTokenSecret,
        settings.accessTokenLifetimeSeconds,
    );

export const signRefreshToken = (settings: AuthSettings, userId: number, remember: boolean): string =>
    sign(
        { sub: String(userId), typ: TokenType.REFRESH, rem: remember },
        settings.refreshTokenSecret,
        settings.refreshTokenLifetimeSeconds,
        randomUUID(),
    );

const verify = (token: string, secret: string, expectedType: TokenTypeName): VerifiedToken => {
    let claims: jwt.JwtPayload | string;
    try {
        claims = jwt.verify(token, secret, { algorithms: [ALGORITHM] });
    } catch {
        throw new UnauthenticatedException('Your session has expired. Please sign in again.');
    }
    const userId = typeof claims === 'object' ? Number(claims.sub) : NaN;
    if (typeof claims !== 'object' || claims['typ'] !== expectedType || !Number.isInteger(userId) || userId <= 0) {
        throw new UnauthenticatedException('Your session has expired. Please sign in again.');
    }
    return { userId, remember: claims['rem'] === true };
};

export const verifyAccessToken = (settings: AuthSettings, token: string): VerifiedToken =>
    verify(token, settings.accessTokenSecret, TokenType.ACCESS);

export const verifyRefreshToken = (settings: AuthSettings, token: string): VerifiedToken =>
    verify(token, settings.refreshTokenSecret, TokenType.REFRESH);
