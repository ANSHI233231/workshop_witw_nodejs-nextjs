import type { FlagReasonModuleDependencies } from './contracts/flag-reason-module.contract';
import type { IFlagReasonService } from './contracts/flag-reason-service.contract';
import { FlagReasonController } from './controllers/flag-reason.controller';
import { FlagReasonRepository } from './repositories/flag-reason.repository';
import { createFlagReasonRouter, type FlagReasonAccess } from './routes/flag-reason.routes';
import { FlagReasonService } from './services/flag-reason.service';

export type { FlagReasonModuleDependencies } from './contracts/flag-reason-module.contract';
export type { IFlagReasonService } from './contracts/flag-reason-service.contract';
export type { FlagReasonAccess } from './routes/flag-reason.routes';
export type { ActiveFlagReasonDto } from './dto/flag-reason.dto';
export { FlagReasonStatus, type FlagReasonStatusCode } from './types/flag-reason.types';

export const createFlagReasonModule = (dependencies: FlagReasonModuleDependencies) => {
    const flagReasonService: IFlagReasonService = new FlagReasonService(
        dependencies.db,
        new FlagReasonRepository(),
        dependencies.auditService,
    );
    const controller = new FlagReasonController(flagReasonService);
    return {
        flagReasonService,
        createRouter: (access: FlagReasonAccess) => createFlagReasonRouter(controller, access),
    };
};
