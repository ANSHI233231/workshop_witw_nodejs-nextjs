import type { AccessGuard } from '../../core/http';

import type { AuditModuleDependencies } from './contracts/audit-module.contract';
import type { IAuditService } from './contracts/audit-service.contract';
import { AuditLogController } from './controllers/audit-log.controller';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { AuditRepository } from './repositories/audit.repository';
import { createAuditRouter } from './routes/audit.routes';
import { AuditLogService } from './services/audit-log.service';
import { AuditService } from './services/audit.service';

export type { AuditModuleDependencies } from './contracts/audit-module.contract';
export type { IAuditService } from './contracts/audit-service.contract';
export type { AuditChanges, AuditEvent } from './dto/audit.dto';
export {
    AuditAction,
    AuditEntity,
    AuditModule,
    AuditOutcome,
    moduleOfAction,
    type AuditActionCode,
    type AuditEntityCode,
} from './types/audit.types';

export const createAuditModule = (dependencies: AuditModuleDependencies) => {
    const auditService: IAuditService = new AuditService(dependencies.db, new AuditRepository());
    const auditLogController = new AuditLogController(new AuditLogService(dependencies.db, new AuditLogRepository()));
    return {
        auditService,
        createRouter: (superAdmin: AccessGuard) => createAuditRouter(auditLogController, superAdmin),
    };
};
