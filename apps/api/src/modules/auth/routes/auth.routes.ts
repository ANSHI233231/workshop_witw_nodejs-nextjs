import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler, publicAccess } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { AuthController } from '../controllers/auth.controller';
import {
    changePasswordSchema,
    checkResetPasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    signInSchema,
    signUpSchema,
} from '../validators/auth.validators';

export const createAuthRouter = (authController: AuthController, session: AccessGuard): ApiRouter => {
    const route = apiRouter();

    route.post('/sign-in', publicAccess, validate(signInSchema), asyncHandler(authController.signIn));
    route.post('/sign-up', publicAccess, validate(signUpSchema), asyncHandler(authController.signUp));
    route.post('/refresh', publicAccess, asyncHandler(authController.refresh));
    route.post('/sign-out', publicAccess, asyncHandler(authController.signOut));
    route.get('/me', session, authController.me);
    route.post(
        '/change-password',
        session,
        validate(changePasswordSchema),
        asyncHandler(authController.changePassword),
    );
    route.post('/forgot-password', publicAccess, validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
    route.get('/reset-password', publicAccess, validate(checkResetPasswordSchema), asyncHandler(authController.checkResetPassword));
    route.post('/reset-password', publicAccess, validate(resetPasswordSchema), asyncHandler(authController.resetPassword));
    route.get('/console-roles', session, asyncHandler(authController.consoleRoles));

    return route;
};
