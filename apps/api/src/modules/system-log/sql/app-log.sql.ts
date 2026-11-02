export type AppLogListShape = {
    readonly search: boolean;
    readonly sourceApp: boolean;
    readonly logLevel: boolean;
    readonly from: boolean;
    readonly to: boolean;
};

const valueGroups = (rowCount: number, columnCount: number): string =>
    Array.from({ length: rowCount }, () => `(${Array.from({ length: columnCount }, () => '?').join(', ')})`).join(', ');

const listWhere = (shape: AppLogListShape): string =>
    [
        'WHERE 1 = 1',
        shape.search
            ? ' AND (l.message LIKE ? OR l.category LIKE ? OR l.request_id LIKE ? OR l.request_url LIKE ? OR l.error_message LIKE ?' +
              " OR JSON_UNQUOTE(JSON_EXTRACT(l.log_context, '$.digest')) LIKE ?)"
            : '',
        shape.sourceApp ? ' AND l.source_app = ?' : '',
        shape.logLevel ? ' AND l.log_level = ?' : '',
        shape.from ? ' AND l.logged_at >= ?' : '',
        shape.to ? ' AND l.logged_at < DATE_ADD(?, INTERVAL 1 DAY)' : '',
    ].join('');

const LIST_COLUMNS = `l.id, l.source_app AS sourceApp, l.log_level AS logLevel, l.category, LEFT(l.message, 500) AS message,
               l.error_name AS errorName, l.request_id AS requestId, l.user_id AS userId, u.name AS userName,
               l.ip_address AS ipAddress, l.http_method AS httpMethod, l.request_url AS requestUrl, l.logged_at AS loggedAt`;

export const AppLogSQL = {
    insert: (rowCount: number) => `
        INSERT INTO app_log
            (source_app, log_level, category, message, error_name, error_message, error_stack, log_context,
             request_id, ip_address, user_id, http_method, request_url, client_app, user_agent, logged_at)
        VALUES ${valueGroups(rowCount, 16)}`,

    list: (shape: AppLogListShape) => `
        SELECT ${LIST_COLUMNS}
        FROM app_log l
        LEFT JOIN user u ON u.id = l.user_id
        ${listWhere(shape)}
        ORDER BY l.logged_at DESC, l.id DESC
        LIMIT ? OFFSET ?`,

    count: (shape: AppLogListShape) => `
        SELECT COUNT(*) AS total
        FROM app_log l
        ${listWhere(shape)}`,

    findById: `
        SELECT ${LIST_COLUMNS}, l.message AS fullMessage, l.error_message AS errorMessage, l.error_stack AS errorStack,
               l.log_context AS logContext, l.client_app AS clientApp,
               l.user_agent AS userAgent
        FROM app_log l
        LEFT JOIN user u ON u.id = l.user_id
        WHERE l.id = ?`,

    countBefore: `
        SELECT COUNT(*) AS total
        FROM app_log
        WHERE logged_at < ?`,

    deleteBefore: `
        DELETE FROM app_log
        WHERE logged_at < ?`,
} as const;
