import type { RowDataPacket } from 'mysql2';

export const MailTemplateStatus = { ACTIVE: 1, INACTIVE: 2, DRAFT: 3 } as const;

export const MailLogStatus = { SENT: 1, FAILED: 2, CAPTURED: 3 } as const;

export const MailTemplateCode = { PASSWORD_RESET: 'password_reset' } as const;

export type MailTemplateStatusCode = (typeof MailTemplateStatus)[keyof typeof MailTemplateStatus];
export type MailLogStatusCode = (typeof MailLogStatus)[keyof typeof MailLogStatus];
export type MailTemplateCodeValue = (typeof MailTemplateCode)[keyof typeof MailTemplateCode];

export const MAIL_LIMITS = { SEARCH: 100, ERROR_MESSAGE: 1000 } as const;

export interface MailTemplateRow extends RowDataPacket {
    id: number;
    code: string;
    name: string;
    sent_when: string | null;
    subject: string;
    body_html: string;
    status: MailTemplateStatusCode;
    updated_at: Date;
}

export interface MailLogListRow extends RowDataPacket {
    id: number;
    template_code: string | null;
    template_name: string | null;
    client_app: number | null;
    recipient_email: string;
    subject: string;
    status: MailLogStatusCode;
    error_message: string | null;
    created_at: Date;
}

export interface MailLogDetailRow extends MailLogListRow {
    sender_email: string;
    body_html: string;
    user_id: number | null;
}

export interface MailCountRow extends RowDataPacket {
    total: number;
}
