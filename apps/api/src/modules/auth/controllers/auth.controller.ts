import type { CookieOptions, NextFunction, Request, Response } from 'express';

import { created, noContent, ok } from '../../../core/http';
import type { IAuthService, SignedInSession } from '../contracts/auth-service.contract';
import type { IPasswordResetService } from '../contracts/password-reset-service.contract';
import type { AuthUserDto } from '../dto/auth.dto';
import {
    type AuthSettings,
    currentSessionApp,
    REFRESH_COOKIE_PATH,
    SESSION_COOKIE_APP,
    SESSION_COOKIES,
    type SessionCookieKind,
    SESSION_USER_HEADER,
} from '../types/auth.types';
import type {
    ChangePasswordBody,
    CheckResetPasswordQuery,
    ForgotPasswordBody,
    ResetPasswordBody,
    SignInBody,
    SignUpBody,
} from '../validators/auth.validators';

const BEARER_PREFIX = 'Bearer ';

const FORGOT_PASSWORD_REPLY = 'If this email is registered, a password reset link has been sent to it.';

const readCookie = (req: Request, name: string): string | undefined => {
    const value: unknown = req.cookies?.[name];
    return typeof value === 'string' && value ? value : undefined;
};


const sessionUserId = (req: Request): string | undefined => req.get(SESSION_USER_HEADER)?.trim() || undefined;

const bearerToken = (req: Request): string | undefined => {
    const header = req.get('authorization');
    return header?.startsWith(BEARER_PREFIX) ? header.slice(BEARER_PREFIX.length).trim() || undefined : undefined;
};

export class AuthController {
    constructor(
        private readonly authService: IAuthService,
        private readonly settings: AuthSettings,
        private readonly passwordResetService: IPasswordResetService,
    ) {}

    signIn = async (req: Request, res: Response): Promise<void> => {
        const session = await this.authService.signIn(req.body as SignInBody);
        this.setCookies(res, session);
        ok(res, { user: session.user }, 'Signed in.');
    };

    signUp = async (req: Request, res: Response): Promise<void> => {
        const session = await this.authService.signUp(req.body as SignUpBody);
        this.setCookies(res, session);
        created(res, { user: session.user }, 'Your account is created.');
    };

    refresh = async (req: Request, res: Response): Promise<void> => {
        const session = await this.authService.refresh(this.refreshCookie(req));
        if (session.tokens) this.setCookies(res, session);
        ok(res, { user: session.user });
    };

    signOut = async (req: Request, res: Response): Promise<void> => {
        await this.authService.signOut(this.refreshCookie(req));
        const accessName = this.cookieName(SESSION_COOKIES.ACCESS);
        const refreshName = this.cookieName(SESSION_COOKIES.REFRESH);
        if (accessName) res.clearCookie(accessName, this.cookieOptions('/'));
        if (refreshName) res.clearCookie(refreshName, this.cookieOptions(REFRESH_COOKIE_PATH));
        noContent(res);
    };

    me = (_req: Request, res: Response): void => {
        ok(res, { user: res.locals['authUser'] as AuthUserDto });
    };

    changePassword = async (req: Request, res: Response): Promise<void> => {
        await this.authService.changePassword(
            (res.locals['authUser'] as AuthUserDto).id,
            req.body as ChangePasswordBody,
        );
        noContent(res);
    };

    forgotPassword = async (req: Request, res: Response): Promise<void> => {
        await this.passwordResetService.requestReset((req.body as ForgotPasswordBody).email);
        ok(res, null, FORGOT_PASSWORD_REPLY);
    };

    checkResetPassword = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.passwordResetService.checkReset((req.query as unknown as CheckResetPasswordQuery).token));
    };

    resetPassword = async (req: Request, res: Response): Promise<void> => {
        await this.passwordResetService.resetPassword(req.body as ResetPasswordBody);
        noContent(res);
    };

    consoleRoles = async (_req: Request, res: Response): Promise<void> => {
        ok(res, { roles: await this.authService.consoleRoles((res.locals['authUser'] as AuthUserDto).id) });
    };

    requireRoles =
        (roleIds: readonly number[]) =>
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const user = await this.authService.authenticate(
                this.accessCookie(req) ?? bearerToken(req),
                sessionUserId(req),
            );
            res.locals['authUser'] = user;
            res.locals['grantedRoleIds'] = await this.authService.grantedRoleIds(user.id, roleIds);
            next();
        };

    identify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        res.locals['authUser'] = await this.authService.identify(
            this.accessCookie(req) ?? bearerToken(req),
            sessionUserId(req),
        );
        next();
    };

    identifyIfSignedIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const accessToken = this.accessCookie(req) ?? bearerToken(req);
        if (accessToken) {
            try {
                res.locals['authUser'] = await this.authService.authenticate(accessToken, sessionUserId(req));
            } catch {
                res.locals['authUser'] = undefined;
            }
        }
        next();
    };

    authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        res.locals['authUser'] = await this.authService.authenticate(
            this.accessCookie(req) ?? bearerToken(req),
            sessionUserId(req),
        );
        next();
    };

    private setCookies(res: Response, session: SignedInSession): void {
        const accessName = this.cookieName(SESSION_COOKIES.ACCESS);
        const refreshName = this.cookieName(SESSION_COOKIES.REFRESH);
        if (!accessName || !refreshName) return;
        res.cookie(accessName, session.tokens.accessToken, {
            ...this.cookieOptions('/'),
            ...(session.remember ? { maxAge: this.settings.accessTokenLifetimeSeconds * 1000 } : {}),
        });
        res.cookie(refreshName, session.tokens.refreshToken, {
            ...this.cookieOptions(REFRESH_COOKIE_PATH),
            ...(session.remember ? { maxAge: this.settings.refreshTokenLifetimeSeconds * 1000 } : {}),
        });
    }

    private cookieName(kind: SessionCookieKind): string | undefined {
        const app = currentSessionApp();
        const appPart = app === undefined ? undefined : SESSION_COOKIE_APP[app];
        return appPart === undefined ? undefined : `${this.settings.cookiePrefix}${appPart}${kind}`;
    }

    private sessionCookie(req: Request, kind: SessionCookieKind): string | undefined {
        const name = this.cookieName(kind);
        return name ? readCookie(req, name) : undefined;
    }

    private accessCookie(req: Request): string | undefined {
        return this.sessionCookie(req, SESSION_COOKIES.ACCESS);
    }

    private refreshCookie(req: Request): string | undefined {
        return this.sessionCookie(req, SESSION_COOKIES.REFRESH);
    }

    private cookieOptions(path: string): CookieOptions {
        return {
            httpOnly: true,
            sameSite: 'lax',
            secure: this.settings.cookieSecure,
            path,
            ...(this.settings.cookieDomain ? { domain: this.settings.cookieDomain } : {}),
        };
    }
}
