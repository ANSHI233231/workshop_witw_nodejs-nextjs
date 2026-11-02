import type { Express } from 'express';

import { mountApi, type RouteEntry } from '../core/http';
import { logger } from '../core/logger';
import type { Database } from '../database/connection';
import type { IEmailSender } from '../infrastructure/email';
import type { ICommandRunner } from '../infrastructure/process';
import type { IFileStorage } from '../infrastructure/storage';
import { createAuditModule } from '../modules/audit';
import { type AppUrls, type AuthSettings, createAuthModule } from '../modules/auth';
import { createHealthModule } from '../modules/health';
import { createJobsModule } from '../modules/jobs';
import { createLanguageModule } from '../modules/language';
import { createMailModule, MailLogStatus } from '../modules/mail';
import { createNotificationModule } from '../modules/notification';
import { createSystemLogModule } from '../modules/system-log';
import { createUsersModule, MetaRole } from '../modules/users';

export const API_PREFIX = '/api';

export type RouteDependencies = {
    readonly db: Database;
    readonly auth: AuthSettings;
    readonly emailSender: IEmailSender;
    readonly fileStorage: IFileStorage;
    readonly commandRunner: ICommandRunner;
    readonly mailFrom: string;
    readonly appUrls: AppUrls;
    readonly logDirectories: Readonly<Record<string, string>>;
    readonly translationDirectories: Readonly<Record<string, string>>;
    readonly logIngestKey: string | null;
};

export const registerRoutes = (app: Express, dependencies: RouteDependencies): RouteEntry[] => {
    const health = createHealthModule({ db: dependencies.db });
    const audit = createAuditModule({ db: dependencies.db });
    const language = createLanguageModule({
        db: dependencies.db,
        auditService: audit.auditService,
        translationDirectories: dependencies.translationDirectories,
    });
    const systemLog = createSystemLogModule({
        db: dependencies.db,
        auditService: audit.auditService,
        logDirectories: dependencies.logDirectories,
        ingestKey: dependencies.logIngestKey,
    });
    logger.setRecordSink(systemLog.logRecordSink);

    const notification = createNotificationModule({
        db: dependencies.db,
        auditService: audit.auditService,
        mailStatus: { sent: MailLogStatus.SENT, failed: MailLogStatus.FAILED },
    });
    const users = createUsersModule({
        db: dependencies.db,
        auditService: audit.auditService,
        notificationService: notification.notificationService,
    });
    const mail = createMailModule({
        db: dependencies.db,
        auditService: audit.auditService,
        emailSender: dependencies.emailSender,
        mailFrom: dependencies.mailFrom,
    });
    const auth = createAuthModule({
        db: dependencies.db,
        usersService: users.usersService,
        auditService: audit.auditService,
        mailService: mail.mailService,
        settings: dependencies.auth,
        appUrls: dependencies.appUrls,
    });
    const jobs = createJobsModule({
        db: dependencies.db,
        auditService: audit.auditService,
        commandRunner: dependencies.commandRunner,
        notificationService: notification.notificationService,
        usersService: users.usersService,
    });

    const superAdmin = auth.access.roles([MetaRole.SUPER_ADMIN]);

    return [
        ...mountApi(app, `${API_PREFIX}/health`, health.createRouter()),
        ...mountApi(app, `${API_PREFIX}/auth`, auth.createRouter()),
        ...mountApi(
            app,
            `${API_PREFIX}/users`,
            users.createRouter({ users: superAdmin, roles: superAdmin, picker: superAdmin }),
        ),
        ...mountApi(app, `${API_PREFIX}/audit`, audit.createRouter(superAdmin)),
        ...mountApi(app, `${API_PREFIX}/system-log`, systemLog.createRouter(superAdmin)),
        ...mountApi(app, `${API_PREFIX}/jobs`, jobs.createRouter(superAdmin)),
        ...mountApi(app, `${API_PREFIX}/language`, language.createRouter(superAdmin)),
        ...mountApi(app, `${API_PREFIX}/mail`, mail.createRouter(superAdmin)),
        ...mountApi(
            app,
            `${API_PREFIX}/notification`,
            notification.createRouter({ signedIn: auth.access.signedIn, superAdmin }),
        ),
    ];
};
