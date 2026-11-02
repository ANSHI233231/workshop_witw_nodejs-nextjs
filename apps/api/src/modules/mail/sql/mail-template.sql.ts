const TEMPLATE_COLUMNS = 'id, code, name, sent_when, subject, body_html, status, updated_at';
const SEARCH_FILTER = ' AND (name LIKE ? OR subject LIKE ?)';
const STATUS_FILTER = ' AND status = ?';

type MailTemplateShape = { readonly search: boolean; readonly status: boolean };

export const MailTemplateSQL = {
    findActiveByCode: `
        SELECT ${TEMPLATE_COLUMNS}
        FROM mail_template
        WHERE code = ? AND status = ?`,

    findById: `
        SELECT ${TEMPLATE_COLUMNS}
        FROM mail_template
        WHERE id = ?`,

    updateBody: `
        UPDATE mail_template
        SET body_html = ?, updated_by = ?
        WHERE id = ?`,

    list: (shape: MailTemplateShape) => `
        SELECT ${TEMPLATE_COLUMNS}
        FROM mail_template
        WHERE 1 = 1${shape.search ? SEARCH_FILTER : ''}${shape.status ? STATUS_FILTER : ''}
        ORDER BY name, id`,
} as const;
