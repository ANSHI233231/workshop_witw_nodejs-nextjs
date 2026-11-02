type AuditLogShape = {
    readonly search: boolean;
    readonly module: boolean;
    readonly action: boolean;
    readonly outcome: boolean;
    readonly clientApp: boolean;
    readonly from: boolean;
    readonly to: boolean;
};

const FROM_LOGS = `FROM audit_log a
        LEFT JOIN user u ON u.id = a.user_id`;

const filtersOf = (shape: AuditLogShape): string =>
    [
        'WHERE 1 = 1',
        shape.search
            ? ' AND (u.name LIKE ? OR u.username LIKE ? OR a.actor_label LIKE ? OR a.ip_address LIKE ? OR a.request_id = ?)'
            : '',
        shape.module ? ' AND a.module = ?' : '',
        shape.action ? ' AND a.action = ?' : '',
        shape.outcome ? ' AND a.outcome = ?' : '',
        shape.clientApp ? ' AND a.client_app = ?' : '',
        shape.from ? ' AND a.created_at >= ?' : '',
        shape.to ? ' AND a.created_at < ?' : '',
    ].join('');

const LIST_COLUMNS = `a.id, a.client_app, a.module, a.action, a.outcome, a.user_id, u.name AS user_name, u.username,
               a.actor_label, a.entity_type, a.entity_id, a.ip_address, a.created_at`;

export const AuditLogSQL = {
    insert: `
        INSERT INTO audit_log (
            client_app, module, action, outcome, user_id, actor_label, entity_type, entity_id, changes, details,
            request_id, ip_address, user_agent
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    list: (shape: AuditLogShape) => `
        SELECT ${LIST_COLUMNS}
        ${FROM_LOGS}
        ${filtersOf(shape)}
        ORDER BY a.id DESC
        LIMIT ? OFFSET ?`,

    count: (shape: AuditLogShape) => `
        SELECT COUNT(*) AS total
        ${FROM_LOGS}
        ${filtersOf(shape)}`,

    summary: (shape: AuditLogShape) => `
        SELECT COUNT(*) AS total,
               SUM(a.outcome = ?) AS failed,
               SUM(a.module = ?) AS sign_in,
               SUM(a.created_at >= ?) AS today
        ${FROM_LOGS}
        ${filtersOf(shape)}`,

    findById: `
        SELECT ${LIST_COLUMNS}, a.changes, a.details, a.request_id, a.user_agent
        ${FROM_LOGS}
        WHERE a.id = ?`,
} as const;
