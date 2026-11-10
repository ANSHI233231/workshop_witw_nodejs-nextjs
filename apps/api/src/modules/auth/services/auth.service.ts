import bcrypt from 'bcryptjs';

import { ClientApp, type ClientAppCode, getRequestContext } from '../../../core/context';
import { ForbiddenException, UnauthenticatedException, ValidationException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import {
    type ActiveRole,
    type IUsersService,
    MetaRole,
    type SignInIdentifier,
    type UserSummary,
    UserStatus,
} from '../../users';
import type { IAuthRepository } from '../contracts/auth-repository.contract';
import type { IAuthService, RefreshedSession, SignedInSession } from '../contracts/auth-service.contract';
import type { AuthUserDto } from '../dto/auth.dto';
import { toAuthUser } from '../mappers/auth.mapper';
import { type AuthSettings, currentSessionApp, REFRESH_REUSE_GRACE_SECONDS } from '../types/auth.types';
import type { ChangePasswordBody, SignInBody, SignUpBody } from '../validators/auth.validators';
import {
    hashToken,
    isPast,
    signAccessToken,
    signRefreshToken,
    utcDateTimeAfter,
    verifyAccessToken,
    verifyRefreshToken,
} from './auth-tokens';

const MOBILE_PATTERN = /^\d{10}$/;
const PASSWORD_HASH_ROUNDS = 10;

const SIGN_UP_REMEMBERED = true;

const INVALID_CREDENTIALS = 'The mobile number, email, username or password is not correct.';
const SESSION_EXPIRED = 'Your session has expired. Please sign in again.';

const CURRENT_PASSWORD_WRONG = 'Your current password is not correct.';

const SESSION_CHANGED = 'You signed in as someone else in another tab. Please sign in again.';

const identifierOf = (text: string): SignInIdentifier => {
    if (text.includes('@')) return { field: 'email', value: text.toLowerCase() };
    if (MOBILE_PATTERN.test(text)) return { field: 'mobile', value: text };
    return { field: 'username', value: text };
};

const passwordMatches = async (password: string, passwordHash: string | null): Promise<boolean> =>
    passwordHash ? bcrypt.compare(password, passwordHash) : false;

const sessionAppOrRefuse = (): ClientAppCode => {
    const app = currentSessionApp();
    if (!app)
        throw new ValidationException('Sign-in is available only from this platform\'s apps.', [], 'AUTH_APP_NOT_ALLOWED');
    return app;
};

const sessionAppOrExpired = (): ClientAppCode => {
    const app = currentSessionApp();
    if (!app) throw new UnauthenticatedException(SESSION_EXPIRED);
    return app;
};

const MANAGE_CONSOLE_ROLES: readonly number[] = [MetaRole.SUPER_ADMIN];

const consoleAccessDenied = (): ForbiddenException =>
    new ForbiddenException('This account cannot sign in to the Admin Console.', 'CONSOLE_ACCESS_DENIED');

const markSignedIn = (userId: number): void => {
    const context = getRequestContext();
    if (context) context.userId = userId;
};

export class AuthService implements IAuthService {
    constructor(
        private readonly db: Database,
        private readonly authRepository: IAuthRepository,
        private readonly usersService: IUsersService,
        private readonly auditService: IAuditService,
        private readonly settings: AuthSettings,
    ) {}

    async signIn(body: SignInBody): Promise<SignedInSession> {
        const app = sessionAppOrRefuse();
        const user = await this.usersService.findForSignIn(identifierOf(body.identifier));
        if (!user || !(await passwordMatches(body.password, user.passwordHash))) {
            return this.refuseSignIn(
                body.identifier,
                new UnauthenticatedException(INVALID_CREDENTIALS, 'INVALID_CREDENTIALS'),
            );
        }
        if (user.status !== UserStatus.ACTIVE) {
            return this.refuseSignIn(
                body.identifier,
                new ForbiddenException('This account is not active.', 'ACCOUNT_INACTIVE'),
            );
        }
        if (!(await this.mayUseApp(user.id, app))) {
            return this.refuseSignIn(body.identifier, consoleAccessDenied());
        }

        markSignedIn(user.id);
        return this.db.transaction(async () => {
            const session = await this.issue(user, body.remember);
            await this.auditService.record({ action: AuditAction.SIGNED_IN, details: { remember: body.remember } });
            return session;
        });
    }

    async signUp(body: SignUpBody): Promise<SignedInSession> {
        if (sessionAppOrRefuse() !== ClientApp.WEB) {
            throw new ValidationException('Sign Up is available only on the website.', [], 'AUTH_APP_NOT_ALLOWED');
        }
        const user = await this.usersService.signUp(body);
        markSignedIn(user.id);
        return this.db.transaction(async () => {
            const session = await this.issue(user, SIGN_UP_REMEMBERED);
            await this.auditService.record({ action: AuditAction.SIGNED_IN, details: { remember: SIGN_UP_REMEMBERED } });
            return session;
        });
    }

    async refresh(refreshToken: string | undefined): Promise<RefreshedSession> {
        if (!refreshToken) throw new UnauthenticatedException(SESSION_EXPIRED);
        sessionAppOrExpired();
        const verified = verifyRefreshToken(this.settings, refreshToken);
        const tokenHash = hashToken(refreshToken);
        const stored = await this.authRepository.findActiveRefreshToken(this.db, tokenHash);

        if (!stored || stored.userId !== verified.userId) {
            return this.refreshWithUsedToken(tokenHash, verified.userId);
        }

        const user = isPast(stored.expiresAt) ? undefined : await this.usersService.findActiveById(stored.userId);
        if (!user) {
            await this.authRepository.retireRefreshToken(this.db, stored.id, stored.userId);
            throw new UnauthenticatedException(SESSION_EXPIRED);
        }

        markSignedIn(user.id);
        const session = await this.db.transaction(async () => {
            if (!(await this.authRepository.retireRefreshToken(this.db, stored.id, user.id))) return undefined;
            const issued = await this.issue(user, verified.remember);
            await this.auditService.record({ action: AuditAction.TOKENS_REFRESHED });
            return issued;
        });
        return session ?? { user: toAuthUser(user), tokens: undefined };
    }

    private async refreshWithUsedToken(tokenHash: string, userId: number): Promise<RefreshedSession> {
        markSignedIn(userId);
        const justRotated = await this.authRepository.findRefreshTokenRetiredWithin(
            this.db,
            tokenHash,
            REFRESH_REUSE_GRACE_SECONDS,
        );
        const user = justRotated?.userId === userId ? await this.usersService.findActiveById(userId) : undefined;
        if (user) return { user: toAuthUser(user), tokens: undefined };
        await this.db.transaction(async () => {
            const retired = await this.authRepository.retireRefreshTokensEverywhere(this.db, userId, userId);
            await this.auditService.record({ action: AuditAction.REFRESH_TOKEN_REUSED, details: { retired } });
        });
        throw new UnauthenticatedException(SESSION_EXPIRED);
    }

    async signOut(refreshToken: string | undefined): Promise<void> {
        if (!refreshToken || currentSessionApp() === undefined) return;
        const stored = await this.authRepository.findActiveRefreshToken(this.db, hashToken(refreshToken));
        if (!stored) return;
        markSignedIn(stored.userId);
        await this.db.transaction(async () => {
            await this.authRepository.retireRefreshToken(this.db, stored.id, stored.userId);
            await this.auditService.record({ action: AuditAction.SIGNED_OUT });
        });
    }

    async authenticate(accessToken: string | undefined, sessionUserId?: string): Promise<AuthUserDto> {
        const user = await this.identify(accessToken, sessionUserId);
        if (!(await this.mayUseApp(user.id, sessionAppOrExpired()))) throw consoleAccessDenied();
        return user;
    }

    async identify(accessToken: string | undefined, sessionUserId?: string): Promise<AuthUserDto> {
        if (!accessToken) throw new UnauthenticatedException();
        sessionAppOrExpired();
        const verified = verifyAccessToken(this.settings, accessToken);
        const user = await this.usersService.findActiveById(verified.userId);
        if (!user) throw new UnauthenticatedException(SESSION_EXPIRED);
        markSignedIn(user.id);
        if (sessionUserId !== undefined && sessionUserId !== String(user.id)) {
            throw new UnauthenticatedException(SESSION_CHANGED, 'SESSION_CHANGED');
        }
        return toAuthUser(user);
    }

    async changePassword(userId: number, body: ChangePasswordBody): Promise<void> {
        if (!(await passwordMatches(body.currentPassword, await this.usersService.passwordHashOf(userId)))) {
            const error = new ValidationException(
                CURRENT_PASSWORD_WRONG,
                [{ field: 'currentPassword', message: CURRENT_PASSWORD_WRONG }],
                'CURRENT_PASSWORD_INCORRECT',
            );
            await this.auditService.recordFailure(
                { action: AuditAction.USER_PASSWORD_CHANGE_FAILED, entityType: AuditEntity.USER, entityId: userId },
                error,
            );
            throw error;
        }
        await this.usersService.changePassword(userId, await bcrypt.hash(body.password, PASSWORD_HASH_ROUNDS), userId);
    }

    consoleRoles(userId: number): Promise<ActiveRole[]> {
        return this.usersService.activeRoles(userId, MANAGE_CONSOLE_ROLES);
    }

    async grantedRoleIds(userId: number, roleIds: readonly number[]): Promise<number[]> {
        const granted = await this.usersService.activeRoles(userId, roleIds);
        if (granted.length === 0) throw new ForbiddenException('You do not have access to this.', 'ACCESS_DENIED');
        return granted.map((role) => role.id);
    }

    private async mayUseApp(userId: number, app: ClientAppCode): Promise<boolean> {
        if (app !== ClientApp.MANAGE) return true;
        return (await this.consoleRoles(userId)).length > 0;
    }

    private async issue(user: UserSummary, remember: boolean): Promise<SignedInSession> {
        const accessToken = signAccessToken(this.settings, user.id, remember);
        const refreshToken = signRefreshToken(this.settings, user.id, remember);
        await this.authRepository.insertRefreshToken(
            this.db,
            user.id,
            sessionAppOrExpired(),
            hashToken(refreshToken),
            utcDateTimeAfter(this.settings.refreshTokenLifetimeSeconds),
        );
        return { user: toAuthUser(user), tokens: { accessToken, refreshToken }, remember };
    }

    private async refuseSignIn(
        identifier: string,
        error: UnauthenticatedException | ForbiddenException,
    ): Promise<never> {
        await this.auditService.recordFailure({ action: AuditAction.SIGN_IN_FAILED, actorLabel: identifier }, error);
        throw error;
    }
}
