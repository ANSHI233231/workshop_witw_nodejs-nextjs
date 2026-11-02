import type { AuditEvent } from '../dto/audit.dto';

export interface IAuditService {
    record(event: AuditEvent): Promise<void>;
    recordFailure(event: AuditEvent, error: unknown): Promise<void>;
}
