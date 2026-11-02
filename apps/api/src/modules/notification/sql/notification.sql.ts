export type NotificationListShape = {
    readonly unreadOnly: boolean;
    readonly kinds: boolean;
};

const IN_PLACE = 'n.user_id = ? AND n.client_app = ? AND n.owner_type <=> ? AND n.owner_id <=> ? AND n.status = ?';

const listWhere = (shape: NotificationListShape): string =>
    [
        `WHERE ${IN_PLACE}`,
        shape.unreadOnly ? ' AND n.read_at IS NULL' : '',
        shape.kinds ? ' AND n.notification_kind IN (?)' : '',
    ].join('');

const valueGroups = (rowCount: number, columnCount: number): string =>
    Array.from({ length: rowCount }, () => `(${Array.from({ length: columnCount }, () => '?').join(', ')})`).join(', ');

export const NotificationSQL = {
    list: (shape: NotificationListShape) => `
        SELECT n.id, n.notification_kind AS notificationKind, n.entity_type AS entityType, n.entity_id AS entityId,
               n.title, n.excerpt, n.read_at AS readAt, n.created_at AS createdAt, n.created_by AS actorId,
               u.name AS actorName
        FROM notification n
        LEFT JOIN user u ON u.id = n.created_by
        ${listWhere(shape)}
        ORDER BY n.created_at DESC, n.id DESC
        LIMIT ? OFFSET ?`,

    count: (shape: NotificationListShape) => `
        SELECT COUNT(*) AS total
        FROM notification n
        ${listWhere(shape)}`,

    countsByKind: `
        SELECT n.notification_kind AS notificationKind, COUNT(*) AS total, COALESCE(SUM(n.read_at IS NULL), 0) AS unread
        FROM notification n
        WHERE ${IN_PLACE}
        GROUP BY n.notification_kind`,

    unreadCount: `
        SELECT COUNT(*) AS total
        FROM notification n
        WHERE ${IN_PLACE} AND n.read_at IS NULL`,

    insert: (rowCount: number) => `
        INSERT INTO notification
            (user_id, notification_kind, entity_type, entity_id, client_app, owner_type, owner_id, title, excerpt,
             status, created_by, updated_by)
        VALUES ${valueGroups(rowCount, 12)}`,

    markRead: `
        UPDATE notification
        SET read_at = COALESCE(read_at, UTC_TIMESTAMP()), updated_by = ?
        WHERE id = ? AND user_id = ? AND status = ?`,

    markUnread: `
        UPDATE notification
        SET read_at = NULL, updated_by = ?
        WHERE id = ? AND user_id = ? AND status = ?`,

    markAllRead: `
        UPDATE notification
        SET read_at = UTC_TIMESTAMP(), updated_by = ?
        WHERE user_id = ? AND client_app = ? AND owner_type <=> ? AND owner_id <=> ? AND status = ? AND read_at IS NULL`,

    markEntityRead: `
        UPDATE notification
        SET read_at = UTC_TIMESTAMP(), updated_by = ?
        WHERE user_id = ? AND entity_type = ? AND entity_id = ? AND status = ? AND read_at IS NULL`,
} as const;
