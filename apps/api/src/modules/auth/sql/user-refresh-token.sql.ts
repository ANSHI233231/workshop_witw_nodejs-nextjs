export const UserRefreshTokenSQL = {
    insert: `
        INSERT INTO user_refresh_token (user_id, client_app, token_hash, expires_at, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,

    findActiveByHash: `
        SELECT id, user_id AS userId, client_app AS clientApp, DATE_FORMAT(expires_at, '%Y-%m-%d %H:%i:%s') AS expiresAt
        FROM user_refresh_token
        WHERE token_hash = ? AND status = ?`,

    findRetiredSinceByHash: `
        SELECT id, user_id AS userId
        FROM user_refresh_token
        WHERE token_hash = ? AND status = ? AND updated_at >= UTC_TIMESTAMP() - INTERVAL ? SECOND`,

    retireById: `
        UPDATE user_refresh_token
        SET status = ?, updated_by = ?
        WHERE id = ? AND status = ?`,

    retireAllActiveOfUserEverywhere: `
        UPDATE user_refresh_token
        SET status = ?, updated_by = ?
        WHERE user_id = ? AND status = ?`,
} as const;
