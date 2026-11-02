import type { AccessGuard } from '../../core/http';

import type { IAppLogService } from './contracts/app-log-service.contract';
import type { SystemLogModuleDependencies } from './contracts/system-log-module.contract';
import { AppLogController } from './controllers/app-log.controller';
import { SystemLogController } from './controllers/system-log.controller';
import { AppLogRepository } from './repositories/app-log.repository';
import { createSystemLogRouter } from './routes/system-log.routes';
import { AppLogService } from './services/app-log.service';
import { AppLogWriter } from './services/app-log-writer';
import { SystemLogService } from './services/system-log.service';

export type { SystemLogModuleDependencies } from './contracts/system-log-module.contract';
export type { IAppLogService } from './contracts/app-log-service.contract';
export type { AppLogPruneResult } from './dto/app-log.dto';

export const createSystemLogModule = (dependencies: SystemLogModuleDependencies) => {
    const controller = new SystemLogController(new SystemLogService(dependencies.logDirectories));
    const repository = new AppLogRepository();
    const writer = new AppLogWriter(dependencies.db, repository);
    const appLogService: IAppLogService = new AppLogService(
        dependencies.db,
        repository,
        writer,
        dependencies.auditService,
    );
    const appLogs = new AppLogController(appLogService);
    return {
        appLogService,
        logRecordSink: writer.sink,
        createRouter: (superAdmin: AccessGuard) =>
            createSystemLogRouter(controller, appLogs, superAdmin, dependencies.ingestKey),
    };
};
