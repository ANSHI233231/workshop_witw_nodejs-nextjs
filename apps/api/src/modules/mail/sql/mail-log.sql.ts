const LISTED_LOGS = `FROM mail_log l
        LEFT JOIN mail_template t ON t.id = l.mail_template_id
        WHERE 1 = 1`;
const SEARCH_FILTER = ' AND (l.recipient_email LIKE ? OR l.subject LIKE ?)';
const STATUS_FILTER = ' AND l.status = ?';
const TEMPLATE_FILTER = ' AND l.template_code = ?';

type MailLogShape = { readonly search: boolean; readonly status: boolean; readonly template: boolean };

const listFilters = (shape: MailLogShape): string =>
    `${LISTED_LOGS}${shape.search ? SEARCH_FILTER : ''}${shape.status ? STATUS_FILTER : ''}${shape.template ? TEMPLATE_FILTER : ''}`;

const LIST_COLUMNS = `l.id, l.template_code, t.name AS template_name, l.client_app, l.recipient_email, l.subject,
               l.status, l.error_message, l.created_at`;

export const MailLogSQL = {
    insert: `
        INSERT INTO mail_log (
            mail_template_id, template_code, client_app, user_id, recipient_email, sender_email,
            subject, body_html, status, error_message, created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    list: (shape: MailLogShape) => `
        SELECT ${LIST_COLUMNS}
        ${listFilters(shape)}
        ORDER BY l.id DESC
        LIMIT ? OFFSET ?`,

    count: (shape: MailLogShape) => `
        SELECT COUNT(*) AS total
        ${listFilters(shape)}`,

    findById: `
        SELECT ${LIST_COLUMNS}, l.sender_email, l.body_html, l.user_id
        FROM mail_log l
        LEFT JOIN mail_template t ON t.id = l.mail_template_id
        WHERE l.id = ?`,
} as const;
