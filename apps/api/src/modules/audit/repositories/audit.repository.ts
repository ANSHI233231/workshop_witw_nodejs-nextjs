import type { DbExecutor } from '../../../database/connection';
import type { IAuditRepository } from '../contracts/audit-repository.contract';
import type { AuditLogRecord } from '../dto/audit.dto';
import { AuditLogSQL } from '../sql/audit-log.sql';

export class AuditRepository implements IAuditRepository {
    async insert(db: DbExecutor, record: AuditLogRecord): Promise<void> {
        await db.execute(AuditLogSQL.insert, [
            record.clientApp,
            record.module,
            record.action,
            record.outcome,
            record.userId,
            record.actorLabel,
            record.entityType,
            record.entityId,
            record.changes,
            record.details,
            record.requestId,
            record.ipAddress,
            record.userAgent,
        ]);
    }
}
