// Business rules live here. The service owns the injected database and passes it to repositories.

import type { Database } from '../../../database/connection';
import { logger } from '../../../core/logger';
import type { IHealthRepository } from '../contracts/health-repository.contract';
import type { IHealthService } from '../contracts/health-service.contract';
import type { DatabaseStatus, HealthStatus } from '../types/health.types';

export class HealthService implements IHealthService {
    constructor(
        private readonly db: Database,
        private readonly healthRepository: IHealthRepository,
    ) {}

    async check(): Promise<HealthStatus> {
        const database = await this.databaseStatus();
        return {
            status: database === 'up' ? 'ok' : 'degraded',
            database,
            uptimeSeconds: Math.round(process.uptime()),
        };
    }

    private async databaseStatus(): Promise<DatabaseStatus> {
        try {
            return (await this.healthRepository.ping(this.db)) ? 'up' : 'down';
        } catch (error) {
            logger.warn('Health check: database unreachable', {
                error: error instanceof Error ? error.message : String(error),
            });
            return 'down';
        }
    }
}
