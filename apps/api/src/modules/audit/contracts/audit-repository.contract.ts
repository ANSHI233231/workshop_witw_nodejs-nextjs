import type { DbExecutor } from '../../../database/connection';
import type { AuditLogRecord } from '../dto/audit.dto';

export interface IAuditRepository {
    insert(db: DbExecutor, record: AuditLogRecord): Promise<void>;
}
