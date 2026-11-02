export const MailLogStatus = { SENT: 1, FAILED: 2, CAPTURED: 3 } as const;

export type MailLogStatusCode = (typeof MailLogStatus)[keyof typeof MailLogStatus];

export const MAIL_LOG_LIMITS = { SEARCH: 100, TEMPLATE: 64 } as const;

export type MailLogListItem = {
    readonly id: number;
    readonly templateCode: string | null;
    readonly templateName: string | null;
    readonly clientApp: number | null;
    readonly recipientEmail: string;
    readonly subject: string;
    readonly status: MailLogStatusCode;
    readonly errorMessage: string | null;
    readonly createdAt: string;
};

export type MailLogDetail = MailLogListItem & {
    readonly senderEmail: string;
    readonly bodyHtml: string;
    readonly userId: number | null;
};

export const MailTemplateStatus = { ACTIVE: 1, INACTIVE: 2, DRAFT: 3 } as const;

export type MailTemplateStatusCode = (typeof MailTemplateStatus)[keyof typeof MailTemplateStatus];

export type MailTemplateItem = {
    readonly id: number;
    readonly code: string;
    readonly name: string;
    readonly sentWhen: string | null;
    readonly subject: string;
    readonly status: MailTemplateStatusCode;
    readonly updatedAt: string;
};

export type MailTemplateDetail = MailTemplateItem & {
    readonly bodyHtml: string;
};

export type MailTemplateFilters = {
    readonly search: string;
    readonly status: MailTemplateStatusCode | undefined;
};

export type MailLogFilters = {
    readonly search: string;
    readonly template: string | undefined;
    readonly status: MailLogStatusCode | undefined;
    readonly page: number;
};
