export const UserPasswordResetSQL = {
    insert: `
        INSERT INTO user_password_reset (user_id, client_app, token_hash, expires_at, status, created_by, updated_by)
        VALUES (?, ?, ?, UTC_TIMESTAMP() + INTERVAL ? MINUTE, ?, ?, ?)`,

    retireIssuedOfUser: `
        UPDATE user_password_reset
        SET status = ?, updated_by = ?
        WHERE user_id = ? AND client_app = ? AND status = ?`,

    findByTokenHash: `
        SELECT id, user_id AS userId, client_app AS clientApp, status, expires_at <= UTC_TIMESTAMP() AS isExpired
        FROM user_password_reset
        WHERE token_hash = ?`,

    markUsed: `
        UPDATE user_password_reset
        SET status = ?, used_at = UTC_TIMESTAMP(), updated_by = ?
        WHERE id = ? AND status = ? AND expires_at > UTC_TIMESTAMP()`,
} as const;
