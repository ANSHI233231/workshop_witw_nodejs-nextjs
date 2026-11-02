import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { MailController } from '../controllers/mail.controller';
import {
    listMailLogsSchema,
    listMailTemplatesSchema,
    mailLogIdSchema,
    mailTemplateIdSchema,
} from '../validators/mail.validators';

export const createMailRouter = (mailController: MailController, superAdmin: AccessGuard): ApiRouter => {
    const route = apiRouter();

    route.get('/logs', superAdmin, validate(listMailLogsSchema), asyncHandler(mailController.logs));
    route.get('/logs/:id', superAdmin, validate(mailLogIdSchema), asyncHandler(mailController.logDetail));
    route.get(
        '/templates',
        superAdmin,
        validate(listMailTemplatesSchema),
        asyncHandler(mailController.templates),
    );
    route.get(
        '/templates/:id',
        superAdmin,
        validate(mailTemplateIdSchema),
        asyncHandler(mailController.templateDetail),
    );

    return route;
};
