import { randomBytes } from 'node:crypto';

import bcrypt from 'bcryptjs';

import { ClientApp, type ClientAppCode } from '../../../core/context';
import { UnauthenticatedException, ValidationException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import { type IMailService, MailTemplateCode } from '../../mail';
import { type IUsersService, UserStatus } from '../../users';
import type { IAuthRepository } from '../contracts/auth-repository.contract';
import type { IPasswordResetService, PasswordResetCheck } from '../contracts/password-reset-service.contract';
import {
    type AppUrls,
    currentSessionApp,
    PASSWORD_RESET_LIFETIME_MINUTES,
    PASSWORD_RESET_PATH,
    type PasswordResetRow,
    PasswordResetStatus,
} from '../types/auth.types';
import type { ResetPasswordBody } from '../validators/auth.validators';
import { hashToken } from './auth-tokens';

const RESET_TOKEN_BYTES = 32;
const PASSWORD_HASH_ROUNDS = 10;

const RESET_LINK_INVALID = 'This password reset link is not valid any more. Please ask for a new one.';

const appNameOf = (clientApp: ClientAppCode): string => (clientApp === ClientApp.MANAGE ? 'Admin Console' : 'Portal');

const maskEmail = (email: string): string => {
    const [local = '', domain = ''] = email.split('@');
    return `${local.slice(0, 1)}***@${domain}`;
};

const linkInvalid = (): ValidationException =>
    new ValidationException(
        RESET_LINK_INVALID,
        [{ field: 'token', message: RESET_LINK_INVALID }],
        'RESET_LINK_INVALID',
    );

const appOfRequest = (): ClientAppCode => {
    const app = currentSessionApp();
    if (!app) throw new UnauthenticatedException('Open this page from one of this platform\'s apps.', 'AUTH_APP_NOT_ALLOWED');
    return app;
};

export class PasswordResetService implements IPasswordResetService {
    constructor(
        private readonly db: Database,
        private readonly authRepository: IAuthRepository,
        private readonly usersService: IUsersService,
        private readonly mailService: IMailService,
        private readonly auditService: IAuditService,
        private readonly appUrls: AppUrls,
    ) {}

    async requestReset(email: string): Promise<void> {
        const clientApp = appOfRequest();
        const user = await this.usersService.findForSignIn({ field: 'email', value: email.toLowerCase() });
        if (!user || user.status !== UserStatus.ACTIVE || !user.email) return;
        const token = randomBytes(RESET_TOKEN_BYTES).toString('base64url');
        await this.db.transaction(async () => {
            await this.authRepository.retireIssuedPasswordResets(this.db, user.id, clientApp);
            await this.authRepository.insertPasswordReset(this.db, user.id, clientApp, hashToken(token));
            await this.auditService.record({
                action: AuditAction.PASSWORD_RESET_REQUESTED,
                entityType: AuditEntity.USER,
                entityId: user.id,
                actorLabel: user.email ?? undefined,
            });
        });
        await this.mailService.sendTemplate(MailTemplateCode.PASSWORD_RESET, {
            to: user.email,
            userId: user.id,
            variables: {
                name: user.name,
                appName: appNameOf(clientApp),
                resetLink: `${this.urlOf(clientApp)}${PASSWORD_RESET_PATH}?token=${encodeURIComponent(token)}`,
                validMinutes: String(PASSWORD_RESET_LIFETIME_MINUTES),
            },
        });
    }

    async checkReset(token: string): Promise<PasswordResetCheck> {
        const reset = await this.usableReset(token);
        const user = await this.usersService.findActiveById(reset.userId);
        if (!user?.email) throw linkInvalid();
        return { maskedEmail: maskEmail(user.email) };
    }

    async resetPassword(body: ResetPasswordBody): Promise<void> {
        let reset: PasswordResetRow | undefined;
        try {
            reset = await this.usableReset(body.token);
            const found = reset;
            const passwordHash = await bcrypt.hash(body.password, PASSWORD_HASH_ROUNDS);
            await this.db.transaction(async () => {
                if (!(await this.authRepository.markPasswordResetUsed(this.db, found.id, found.userId)))
                    throw linkInvalid();
                await this.usersService.changePassword(found.userId, passwordHash, found.userId);
                const signedOut = await this.authRepository.retireRefreshTokensEverywhere(
                    this.db,
                    found.userId,
                    found.userId,
                );
                await this.auditService.record({
                    action: AuditAction.PASSWORD_RESET_DONE,
                    entityType: AuditEntity.USER,
                    entityId: found.userId,
                    details: { sessionsSignedOut: signedOut },
                });
            });
        } catch (error) {
            await this.auditService.recordFailure(
                {
                    action: AuditAction.PASSWORD_RESET_REFUSED,
                    entityType: AuditEntity.USER,
                    entityId: reset?.userId,
                },
                error,
            );
            throw error;
        }
    }

    private async usableReset(token: string): Promise<PasswordResetRow> {
        const reset = await this.authRepository.findPasswordReset(this.db, hashToken(token));
        const usable =
            reset !== undefined &&
            reset.status === PasswordResetStatus.ISSUED &&
            !reset.isExpired &&
            reset.clientApp === appOfRequest();
        if (!usable) throw linkInvalid();
        return reset;
    }

    private urlOf(clientApp: ClientAppCode): string {
        return clientApp === ClientApp.MANAGE ? this.appUrls.manage : this.appUrls.web;
    }
}
