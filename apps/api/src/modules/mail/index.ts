import type { AccessGuard } from '../../core/http';

import type { MailModuleDependencies } from './contracts/mail-module.contract';
import type { IMailService } from './contracts/mail-service.contract';
import { MailController } from './controllers/mail.controller';
import { MailLogRepository } from './repositories/mail-log.repository';
import { MailTemplateRepository } from './repositories/mail-template.repository';
import { createMailRouter } from './routes/mail.routes';
import { MailService } from './services/mail.service';

export type { MailModuleDependencies } from './contracts/mail-module.contract';
export type { IMailService } from './contracts/mail-service.contract';
export type { TemplateMail } from './dto/mail.dto';
export { MailLogStatus, MailTemplateCode, type MailLogStatusCode } from './types/mail.types';

export const createMailModule = (dependencies: MailModuleDependencies) => {
    const mailService: IMailService = new MailService(
        dependencies.db,
        dependencies.auditService,
        new MailTemplateRepository(),
        new MailLogRepository(),
        dependencies.emailSender,
        dependencies.mailFrom,
    );
    const mailController = new MailController(mailService);

    return {
        mailService,
        createRouter: (superAdmin: AccessGuard) => createMailRouter(mailController, superAdmin),
    };
};
