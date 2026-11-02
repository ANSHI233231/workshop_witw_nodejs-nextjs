import type { MailLogStatusCode, MailTemplateStatusCode } from '../types/mail.types';

export type TemplateMail = {
    readonly to: string;
    readonly userId: number | null;
    readonly variables: Readonly<Record<string, string>>;
};

export type MailLogFilters = {
    readonly search: string | undefined;
    readonly status: MailLogStatusCode | undefined;
    readonly templateCode: string | undefined;
};

export type NewMailLog = {
    readonly mailTemplateId: number | null;
    readonly templateCode: string | null;
    readonly clientApp: number | null;
    readonly userId: number | null;
    readonly recipientEmail: string;
    readonly senderEmail: string;
    readonly subject: string;
    readonly bodyHtml: string;
    readonly status: MailLogStatusCode;
    readonly errorMessage: string | null;
    readonly createdBy: number | null;
};

export type MailLogListItemDto = {
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

export type MailLogDetailDto = MailLogListItemDto & {
    readonly senderEmail: string;
    readonly bodyHtml: string;
    readonly userId: number | null;
};

export type MailLogPage = {
    readonly items: readonly MailLogListItemDto[];
    readonly total: number;
};

export type MailTemplateFilters = {
    readonly search: string | undefined;
    readonly status: MailTemplateStatusCode | undefined;
};

export type MailTemplateDto = {
    readonly id: number;
    readonly code: string;
    readonly name: string;
    readonly sentWhen: string | null;
    readonly subject: string;
    readonly status: MailTemplateStatusCode;
    readonly updatedAt: string;
};

export type MailTemplateDetailDto = MailTemplateDto & {
    readonly bodyHtml: string;
};
