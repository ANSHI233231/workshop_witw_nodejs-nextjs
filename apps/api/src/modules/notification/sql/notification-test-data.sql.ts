const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

const entityCondition = (count: number): string =>
    `(notification.entity_type = ? AND notification.entity_id IN (${inList(count)}))`;

export const NotificationTestDataSQL = {
    marked: (userCount: number, entityCounts: readonly number[]) => `
        SELECT notification.id, notification.user_id, notification.notification_kind, notification.entity_type,
            notification.entity_id, LEFT(notification.title, 40) AS title_start, LEFT(notification.excerpt, 40) AS excerpt_start
        FROM notification
        WHERE notification.user_id IN (${inList(userCount)})
            OR notification.created_by IN (${inList(userCount)})
            OR notification.title LIKE ?
            OR notification.excerpt LIKE ?
            OR notification.actor_name LIKE ?
            ${entityCounts.map((count) => `OR ${entityCondition(count)}`).join('\n            ')}
        ORDER BY notification.id`,

    countNotIn: (count: number) => `
        SELECT COUNT(*) AS total
        FROM notification
        WHERE notification.id NOT IN (${inList(count)})`,

    deleteNotifications: (count: number) => `
        DELETE FROM notification
        WHERE id IN (${inList(count)})`,
} as const;
