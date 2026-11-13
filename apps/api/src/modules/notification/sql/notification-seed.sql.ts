const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

const placeholders = (count: number): string => Array.from({ length: count }, () => '?').join(', ');

export const NotificationSeedSQL = {
    insert: `
        INSERT INTO notification
            (user_id, notification_kind, entity_type, entity_id, client_app, owner_type, owner_id, title, excerpt,
             read_at, status, created_at, updated_at, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    exists: `
        SELECT id FROM notification
        WHERE user_id = ? AND notification_kind = ? AND entity_type = ? AND entity_id = ? AND created_at = ?`,

    countFor: (entities: number, users: number) => `
        SELECT COUNT(*) AS total FROM notification
        WHERE (entity_type = ? AND entity_id IN (${inList(entities)})) OR user_id IN (${inList(users)})`,

    deleteForUsers: (count: number) => `
        DELETE FROM notification WHERE user_id IN (${placeholders(count)})`,

    deleteForEntities: (count: number) => `
        DELETE FROM notification WHERE entity_type = ? AND entity_id IN (${placeholders(count)})`,
} as const;
