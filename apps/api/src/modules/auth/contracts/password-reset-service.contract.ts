import type { ResetPasswordBody } from '../validators/auth.validators';

export type PasswordResetCheck = { readonly maskedEmail: string };

export interface IPasswordResetService {
    requestReset(email: string): Promise<void>;
    checkReset(token: string): Promise<PasswordResetCheck>;
    resetPassword(body: ResetPasswordBody): Promise<void>;
}
