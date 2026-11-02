import { AccessGuard, asyncHandler } from '../../core/http';
import type { AuthModuleDependencies } from './contracts/auth-module.contract';
import type { IAuthService } from './contracts/auth-service.contract';
import { AuthController } from './controllers/auth.controller';
import { AuthRepository } from './repositories/auth.repository';
import { createAuthRouter } from './routes/auth.routes';
import { AuthService } from './services/auth.service';
import { PasswordResetService } from './services/password-reset.service';

export type { AuthModuleDependencies } from './contracts/auth-module.contract';
export type { IAuthService } from './contracts/auth-service.contract';
export type { AuthUserDto } from './dto/auth.dto';
export type { AppUrls, AuthSettings } from './types/auth.types';

export const createAuthModule = (dependencies: AuthModuleDependencies) => {
    const authRepository = new AuthRepository();
    const authService: IAuthService = new AuthService(
        dependencies.db,
        authRepository,
        dependencies.usersService,
        dependencies.auditService,
        dependencies.settings,
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
        roles: (roleIds: readonly number[]) =>
            AccessGuard.define('roles', asyncHandler(authController.requireRoles(roleIds)), roleIds),
    };

    return {
        authService,
        access,
        createRouter: () => createAuthRouter(authController, access.session),
    };
};
