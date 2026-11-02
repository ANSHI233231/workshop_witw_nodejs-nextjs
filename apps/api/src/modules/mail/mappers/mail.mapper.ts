import type { MailLogDetailDto, MailLogListItemDto, MailTemplateDetailDto, MailTemplateDto } from '../dto/mail.dto';
import type { MailLogDetailRow, MailLogListRow, MailTemplateRow } from '../types/mail.types';

export const toMailLogListItem = (row: MailLogListRow): MailLogListItemDto => ({
    id: row.id,
    templateCode: row.template_code,
    templateName: row.template_name,
    clientApp: row.client_app,
    recipientEmail: row.recipient_email,
    subject: row.subject,
    status: row.status,
    errorMessage: row.error_message,
    createdAt: row.created_at.toISOString(),
});

export const toMailLogDetail = (row: MailLogDetailRow): MailLogDetailDto => ({
    ...toMailLogListItem(row),
    senderEmail: row.sender_email,
    bodyHtml: row.body_html,
    userId: row.user_id,
});

export const toMailTemplate = (row: MailTemplateRow): MailTemplateDto => ({
    id: row.id,
    code: row.code,
    name: row.name,
    sentWhen: row.sent_when,
    subject: row.subject,
    status: row.status,
    updatedAt: row.updated_at.toISOString(),
});

export const toMailTemplateDetail = (row: MailTemplateRow): MailTemplateDetailDto => ({
    ...toMailTemplate(row),
    bodyHtml: row.body_html,
});
