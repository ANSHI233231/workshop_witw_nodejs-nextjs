// Data access only: one method, one named query. The executor is always the first argument.

import type { DbExecutor } from '../../../database/connection';
import type { IHealthRepository } from '../contracts/health-repository.contract';
import { HealthSQL } from '../sql/health.sql';
import type { PingRow } from '../types/health.types';

export class HealthRepository implements IHealthRepository {
    async ping(db: DbExecutor): Promise<boolean> {
        const rows = await db.query<PingRow>(HealthSQL.ping);
        return rows[0]?.ok === 1;
    }
}
