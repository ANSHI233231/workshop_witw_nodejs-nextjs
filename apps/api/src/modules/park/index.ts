import type { AccessGuard } from '../../core/http';

import type { ParkModuleDependencies, ParkTestDataModuleDependencies } from './contracts/park-module.contract';
import type { IParkPriceSource } from './contracts/park-price-source.contract';
import type { IParkService } from './contracts/park-service.contract';
import type { IParkTestDataService } from './contracts/park-test-data-service.contract';
import { ParkController } from './controllers/park.controller';
import { ParkWebsiteController } from './controllers/park-website.controller';
import { ParkTestDataRepository } from './repositories/park-test-data.repository';
import { ParkRepository } from './repositories/park.repository';
import { createParkRouter } from './routes/park.routes';
import { ParkImages } from './services/park-images';
import { ParkPrices } from './services/park-prices';
import { ParkTestDataService } from './services/park-test-data.service';
import { ParkService } from './services/park.service';
import { ParkWebsiteService } from './services/park-website.service';

export type { ParkModuleDependencies } from './contracts/park-module.contract';
export type { IParkPriceSource } from './contracts/park-price-source.contract';
export type { IParkService } from './contracts/park-service.contract';
export type { ParkOptionDto, ParkPriceRange, ParkStateDto } from './dto/park.dto';
export { ParkRegion, ParkStatus, type ParkRegionCode, type ParkStatusCode } from './types/park.types';

export type { IParkTestDataService } from './contracts/park-test-data-service.contract';
export type { ParkTestData, ParkTestDataMarker } from './dto/park-test-data.dto';

export const createParkTestDataModule = (dependencies: ParkTestDataModuleDependencies) => {
    const parkTestDataService: IParkTestDataService = new ParkTestDataService(
        dependencies.db,
        new ParkTestDataRepository(),
        dependencies.auditService,
        dependencies.fileStorage,
        dependencies.isProduction,
    );
    return { parkTestDataService };
};

export const createParkModule = (dependencies: ParkModuleDependencies) => {
    const repository = new ParkRepository();
    const prices = new ParkPrices();
    const images = new ParkImages(dependencies.fileStorage);
    const parkService: IParkService = new ParkService(
        dependencies.db,
        repository,
        dependencies.auditService,
        prices,
        images,
    );
    const controllers = {
        console: new ParkController(parkService),
        website: new ParkWebsiteController(new ParkWebsiteService(dependencies.db, repository, prices, images)),
    };
    return {
        parkService,
        connectPriceSource: (source: IParkPriceSource): void => prices.connect(source),
        createRouter: (superAdmin: AccessGuard) => createParkRouter(controllers, superAdmin),
    };
};
