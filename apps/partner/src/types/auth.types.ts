export type AuthUser = {
    readonly id: number;
    readonly name: string;
    readonly username: string | null;
    readonly email: string | null;
    readonly passwordChangedAt: string | null;
};

export type SignInInput = {
    readonly identifier: string;
    readonly password: string;
    readonly remember: boolean;
};

export const SIGN_IN_LIMITS = { IDENTIFIER: 254, PASSWORD: 200 } as const;

export const PASSWORD_LIMITS = { MIN: 8, MAX: 72 } as const;

export type ChangePasswordInput = {
    readonly currentPassword: string;
    readonly password: string;
    readonly confirmPassword: string;
};

export type PasswordResetInput = {
    readonly token: string;
    readonly password: string;
    readonly confirmPassword: string;
};
