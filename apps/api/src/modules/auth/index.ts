import type { Response } from 'express';

import { AccessGuard, asyncHandler } from '../../core/http';
import type { AuthModuleDependencies, AuthTestDataModuleDependencies } from './contracts/auth-module.contract';
import type { IAuthService, SignedInSession } from './contracts/auth-service.contract';
import type { IAuthTestDataService } from './contracts/auth-test-data-service.contract';
import type { ISignUpProfileWriter } from './contracts/sign-up-profile-writer.contract';
import { AuthController } from './controllers/auth.controller';
import { AuthTestDataRepository } from './repositories/auth-test-data.repository';
import { AuthRepository } from './repositories/auth.repository';
import { createAuthRouter } from './routes/auth.routes';
import { AuthTestDataService } from './services/auth-test-data.service';
import { AuthService } from './services/auth.service';
import { PasswordResetService } from './services/password-reset.service';
import { SignUpProfileSlot } from './services/sign-up-profile-slot';

export type { AuthModuleDependencies } from './contracts/auth-module.contract';
export type { IAuthService, SignedInSession, SignedUpWith } from './contracts/auth-service.contract';
export { signUpAccountSchema, type SignUpBody } from './validators/auth.validators';
export type { ISignUpProfileWriter, SignUpProfile } from './contracts/sign-up-profile-writer.contract';

export type SessionCookies = {
    readonly write: (res: Response, session: SignedInSession) => void;
};
export type { AuthUserDto } from './dto/auth.dto';
export type { AppUrls, AuthSettings } from './types/auth.types';

export type { IAuthTestDataService } from './contracts/auth-test-data-service.contract';
export type { AuthTestData } from './dto/auth-test-data.dto';

export const createAuthTestDataModule = (dependencies: AuthTestDataModuleDependencies) => {
    const authTestDataService: IAuthTestDataService = new AuthTestDataService(
        dependencies.db,
        new AuthTestDataRepository(),
        dependencies.auditService,
        dependencies.isProduction,
    );
    return { authTestDataService };
};

export const createAuthModule = (dependencies: AuthModuleDependencies) => {
    const authRepository = new AuthRepository();
    const signUpProfiles = new SignUpProfileSlot();
    const authService: IAuthService = new AuthService(
        dependencies.db,
        authRepository,
        dependencies.usersService,
        dependencies.auditService,
        dependencies.settings,
        signUpProfiles,
    );
    const passwordResetService = new PasswordResetService(
        dependencies.db,
        authRepository,
        dependencies.usersService,
        dependencies.mailService,
        dependencies.auditService,
        dependencies.appUrls,
    );
    const authController = new AuthController(authService, dependencies.settings, passwordResetService);
    const access = {
        session: AccessGuard.define('session', asyncHandler(authController.identify)),
        signedIn: AccessGuard.define('signed-in', asyncHandler(authController.authenticate)),
        viewer: AccessGuard.define('public', asyncHandler(authController.identifyIfSignedIn)),
        roles: (roleIds: readonly number[]) =>
            AccessGuard.define('roles', asyncHandler(authController.requireRoles(roleIds)), roleIds),
    };

    const sessionCookies: SessionCookies = {
        write: (res, session) => authController.writeSessionCookies(res, session),
    };

    return {
        authService,
        sessionCookies,
        access,
        connectSignUpProfiles: (writer: ISignUpProfileWriter): void => signUpProfiles.connect(writer),
        createRouter: () => createAuthRouter(authController, access.session),
    };
};
