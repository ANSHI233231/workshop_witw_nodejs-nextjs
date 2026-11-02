import { getRequestContext } from '../../../core/context';
import { NotFoundException } from '../../../core/exceptions';
import { logger } from '../../../core/logger';
import type { PaginationQuery } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import type { IEmailSender } from '../../../infrastructure/email';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IMailLogRepository } from '../contracts/mail-log-repository.contract';
import type { IMailService } from '../contracts/mail-service.contract';
import type { IMailTemplateRepository } from '../contracts/mail-template-repository.contract';
import type {
    MailLogDetailDto,
    MailLogFilters,
    MailLogPage,
    MailTemplateDetailDto,
    MailTemplateDto,
    MailTemplateFilters,
    TemplateMail,
} from '../dto/mail.dto';
import { toMailLogDetail, toMailLogListItem, toMailTemplate, toMailTemplateDetail } from '../mappers/mail.mapper';
import { MAIL_LIMITS, MailLogStatus, type MailLogStatusCode } from '../types/mail.types';
import { renderHtml, renderText } from './render-template';

const log = logger.category('mail');

const signedInUserId = (): number | null => {
    const userId = getRequestContext()?.userId;
    return typeof userId === 'number' ? userId : null;
};

const shortError = (error: unknown): string =>
    (error instanceof Error ? error.message : String(error)).slice(0, MAIL_LIMITS.ERROR_MESSAGE);

export class MailService implements IMailService {
    constructor(
        private readonly db: Database,
        private readonly auditService: IAuditService,
        private readonly templateRepository: IMailTemplateRepository,
        private readonly logRepository: IMailLogRepository,
        private readonly emailSender: IEmailSender,
        private readonly mailFrom: string,
    ) {}

    async sendTemplate(code: string, mail: TemplateMail): Promise<MailLogStatusCode> {
        const base = {
            templateCode: code,
            clientApp: getRequestContext()?.clientApp ?? null,
            userId: mail.userId,
            recipientEmail: mail.to,
            senderEmail: this.mailFrom,
            createdBy: signedInUserId(),
        };
        const template = await this.templateRepository.findActiveByCode(this.db, code);
        if (!template) {
            log.error('Mail template missing or inactive', { code });
            await this.logRepository.insert(this.db, {
                ...base,
                mailTemplateId: null,
                subject: code,
                bodyHtml: '',
                status: MailLogStatus.FAILED,
                errorMessage: `The mail template "${code}" is missing or inactive.`,
            });
            return MailLogStatus.FAILED;
        }
        const subject = renderText(template.subject, mail.variables);
        const bodyHtml = renderHtml(template.body_html, mail.variables);
        let status: MailLogStatusCode;
        let errorMessage: string | null = null;
        try {
            const delivery = await this.emailSender.send({ to: mail.to, from: this.mailFrom, subject, html: bodyHtml });
            status = delivery.outcome === 'sent' ? MailLogStatus.SENT : MailLogStatus.CAPTURED;
        } catch (error) {
            log.error('Mail could not be sent', { code, error });
            status = MailLogStatus.FAILED;
            errorMessage = shortError(error);
        }
        await this.logRepository.insert(this.db, {
            ...base,
            mailTemplateId: template.id,
            subject,
            bodyHtml,
            status,
            errorMessage,
        });
        return status;
    }

    async listLogs(filters: MailLogFilters, pagination: PaginationQuery): Promise<MailLogPage> {
        const [rows, total] = await Promise.all([
            this.logRepository.list(this.db, filters, pagination),
            this.logRepository.count(this.db, filters),
        ]);
        return { items: rows.map(toMailLogListItem), total };
    }

    async logDetail(id: number): Promise<MailLogDetailDto> {
        const row = await this.logRepository.findById(this.db, id);
        if (!row) throw new NotFoundException('This mail was not found.', 'MAIL_LOG_NOT_FOUND');
        return toMailLogDetail(row);
    }

    async listTemplates(filters: MailTemplateFilters): Promise<MailTemplateDto[]> {
        return (await this.templateRepository.list(this.db, filters)).map(toMailTemplate);
    }

    async templateDetail(id: number): Promise<MailTemplateDetailDto> {
        const row = await this.templateRepository.findById(this.db, id);
        if (!row) throw new NotFoundException('This email template was not found.', 'MAIL_TEMPLATE_NOT_FOUND');
        return toMailTemplateDetail(row);
    }

    async updateTemplateBody(id: number, bodyHtml: string): Promise<void> {
        try {
            await this.db.transaction(async () => {
                const before = await this.templateRepository.findById(this.db, id);
                if (!before) throw new NotFoundException('This email template was not found.', 'MAIL_TEMPLATE_NOT_FOUND');
                await this.templateRepository.updateBody(this.db, id, bodyHtml, signedInUserId());
                await this.auditService.record({
                    action: AuditAction.MAIL_TEMPLATE_UPDATED,
                    entityType: AuditEntity.MAIL_TEMPLATE,
                    entityId: id,
                    changes: { bodyHtml: { from: before.body_html, to: bodyHtml } },
                    details: { code: before.code },
                });
            });
        } catch (error) {
            await this.auditService.recordFailure(
                { action: AuditAction.MAIL_TEMPLATE_UPDATE_FAILED, entityType: AuditEntity.MAIL_TEMPLATE, entityId: id },
                error,
            );
            throw error;
        }
    }
}
