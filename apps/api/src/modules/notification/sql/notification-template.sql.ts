const TEMPLATE_COLUMNS = `id, notification_kind AS notificationKind, client_app AS clientApp, code, name,
               title_template AS titleTemplate, sent_when AS sentWhen, opens, status, updated_at AS updatedAt`;

export const NotificationTemplateSQL = {
    list: (shape: { readonly search: boolean; readonly status: boolean }) => `
        SELECT ${TEMPLATE_COLUMNS}
        FROM notification_template
        WHERE 1 = 1${shape.search ? ' AND (name LIKE ? OR title_template LIKE ?)' : ''}${shape.status ? ' AND status = ?' : ''}
        ORDER BY notification_kind`,

    active: `
        SELECT ${TEMPLATE_COLUMNS}
        FROM notification_template
        WHERE status = ?`,
} as const;
