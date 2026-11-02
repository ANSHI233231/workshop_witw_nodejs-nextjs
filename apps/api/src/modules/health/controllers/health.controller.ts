// Thin: read the request, call the service, respond. No SQL, no business rules, no try/catch
// (the route wraps each handler in `asyncHandler`). Depends on the service CONTRACT, not the class.

import type { Request, Response } from 'express';

import { ServiceUnavailableException } from '../../../core/exceptions';
import { ok } from '../../../core/http';
import type { IHealthService } from '../contracts/health-service.contract';

export class HealthController {
    constructor(private readonly healthService: IHealthService) {}

    check = async (_req: Request, res: Response): Promise<void> => {
        const health = await this.healthService.check();
        if (health.database === 'down') {
            // 503 so a load balancer or uptime monitor sees the outage.
            throw new ServiceUnavailableException('The database is unreachable.', 'DATABASE_UNAVAILABLE');
        }
        ok(res, health, 'API is healthy.');
    };
}
