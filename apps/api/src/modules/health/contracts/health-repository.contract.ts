import type { DbExecutor } from '../../../database/connection';

export interface IHealthRepository {
    ping(db: DbExecutor): Promise<boolean>;
}
