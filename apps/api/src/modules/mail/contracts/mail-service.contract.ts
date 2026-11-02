import type { PaginationQuery } from '../../../core/validation';
import type {
    MailLogDetailDto,
    MailLogFilters,
    MailLogPage,
    MailTemplateDetailDto,
    MailTemplateDto,
    MailTemplateFilters,
    TemplateMail,
} from '../dto/mail.dto';
import type { MailLogStatusCode } from '../types/mail.types';

export interface IMailService {
    sendTemplate(code: string, mail: TemplateMail): Promise<MailLogStatusCode>;
    listLogs(filters: MailLogFilters, pagination: PaginationQuery): Promise<MailLogPage>;
    logDetail(id: number): Promise<MailLogDetailDto>;
    listTemplates(filters: MailTemplateFilters): Promise<MailTemplateDto[]>;
    templateDetail(id: number): Promise<MailTemplateDetailDto>;
    updateTemplateBody(id: number, bodyHtml: string): Promise<void>;
}
