const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

export const AuthTestDataSQL = {
    refreshTokensOf: (count: number) => `
        SELECT user_refresh_token.id, user_refresh_token.user_id, user_refresh_token.client_app
        FROM user_refresh_token
        WHERE user_refresh_token.user_id IN (${inList(count)})
        ORDER BY user_refresh_token.id`,

    passwordResetsOf: (count: number) => `
        SELECT user_password_reset.id, user_password_reset.user_id, user_password_reset.client_app
        FROM user_password_reset
        WHERE user_password_reset.user_id IN (${inList(count)})
        ORDER BY user_password_reset.id`,

    deleteRefreshTokens: (count: number) => `
        DELETE FROM user_refresh_token
        WHERE id IN (${inList(count)})`,

    deletePasswordResets: (count: number) => `
        DELETE FROM user_password_reset
        WHERE id IN (${inList(count)})`,
} as const;
