// The service's public surface: what the controller, the CLI and other modules depend on.

import type { HealthStatus } from '../types/health.types';

export interface IHealthService {
    check(): Promise<HealthStatus>;
}
