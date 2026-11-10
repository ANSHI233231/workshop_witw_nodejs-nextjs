import type { AccessGuard } from '../../core/http';

import type { ParkModuleDependencies } from './contracts/park-module.contract';
import type { IParkService } from './contracts/park-service.contract';
import { ParkController } from './controllers/park.controller';
import { ParkRepository } from './repositories/park.repository';
import { createParkRouter } from './routes/park.routes';
import { ParkService } from './services/park.service';

export type { ParkModuleDependencies } from './contracts/park-module.contract';
export type { IParkService } from './contracts/park-service.contract';
export type { ParkOptionDto, ParkStateDto } from './dto/park.dto';
export { ParkRegion, ParkStatus, type ParkRegionCode, type ParkStatusCode } from './types/park.types';

export const createParkModule = (dependencies: ParkModuleDependencies) => {
    const parkService: IParkService = new ParkService(dependencies.db, new ParkRepository(), dependencies.auditService);
    const controller = new ParkController(parkService);
    return {
        parkService,
        createRouter: (superAdmin: AccessGuard) => createParkRouter(controller, superAdmin),
    };
};
