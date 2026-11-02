export type DeliveryListShape = {
    readonly search: boolean;
    readonly channel: boolean;
    readonly templateKey: boolean;
    readonly status: boolean;
};

const DELIVERIES = `
        SELECT ? AS channel, l.id AS recordId, l.recipient_email AS recipient, l.subject AS title,
               l.template_code AS templateKey, COALESCE(t.name, l.template_code) AS templateName,
               l.created_at AS sentAt, CASE l.status WHEN ? THEN ? WHEN ? THEN ? ELSE ? END AS deliveryStatus
        FROM mail_log l
        LEFT JOIN mail_template t ON t.id = l.mail_template_id
        UNION ALL
        SELECT ?, n.id, IF(u.username IS NULL, u.name, CONCAT(u.name, ' (', u.username, ')')), n.title, nt.code,
               nt.name, n.created_at, IF(n.read_at IS NULL, ?, ?)
        FROM notification n
        LEFT JOIN user u ON u.id = n.user_id
        LEFT JOIN notification_template nt ON nt.notification_kind = n.notification_kind
        WHERE n.status = ?`;

const filtersOf = (shape: DeliveryListShape): string =>
    [
        'WHERE 1 = 1',
        shape.search ? ' AND (d.recipient LIKE ? OR d.title LIKE ?)' : '',
        shape.channel ? ' AND d.channel = ?' : '',
        shape.templateKey ? ' AND d.templateKey = ?' : '',
        shape.status ? ' AND d.deliveryStatus = ?' : '',
    ].join('');

export const DeliverySQL = {
    list: (shape: DeliveryListShape) => `
        SELECT d.* FROM (${DELIVERIES}) d
        ${filtersOf(shape)}
        ORDER BY d.sentAt DESC, d.channel, d.recordId DESC
        LIMIT ? OFFSET ?`,

    count: (shape: DeliveryListShape) => `
        SELECT COUNT(*) AS total FROM (${DELIVERIES}) d
        ${filtersOf(shape)}`,

    inAppDetail: `
        SELECT n.id, n.notification_kind AS notificationKind, n.client_app AS clientApp, u.name AS recipientName,
               u.username AS recipientUsername, a.name AS actorName, n.title, n.excerpt, n.read_at AS readAt,
               n.created_at AS createdAt, nt.name AS templateName, nt.title_template AS titleTemplate, nt.opens
        FROM notification n
        LEFT JOIN user u ON u.id = n.user_id
        LEFT JOIN user a ON a.id = n.created_by
        LEFT JOIN notification_template nt ON nt.notification_kind = n.notification_kind
        WHERE n.id = ? AND n.status = ?`,
} as const;
