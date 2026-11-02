export type AuthUserDto = {
    readonly id: number;
    readonly name: string;
    readonly username: string | null;
    readonly email: string | null;
    readonly passwordChangedAt: string | null;
};

export type AuthTokens = {
    readonly accessToken: string;
    readonly refreshToken: string;
};

export type AuthSession = {
    readonly user: AuthUserDto;
    readonly tokens: AuthTokens;
};
