// The health module's PUBLIC SURFACE and composition root. Code outside this folder imports from
// here and from nowhere else inside it. Repositories are deliberately NOT exported: another module
// must never query this module's tables directly, only call its service contract.

import type { HealthModuleDependencies } from './contracts/health-module.contract';
import type { IHealthService } from './contracts/health-service.contract';
import { HealthController } from './controllers/health.controller';
import { HealthRepository } from './repositories/health.repository';
import { createHealthRouter } from './routes/health.routes';
import { HealthService } from './services/health.service';

export type { HealthModuleDependencies } from './contracts/health-module.contract';
export type { IHealthService } from './contracts/health-service.contract';
export type { HealthStatus } from './types/health.types';

export const createHealthModule = (dependencies: HealthModuleDependencies) => {
    const healthService: IHealthService = new HealthService(dependencies.db, new HealthRepository());
    const healthController = new HealthController(healthService);

    return {
        healthService,
        createRouter: () => createHealthRouter(healthController),
    };
};
