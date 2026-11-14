import type { ParkPriceRange } from '../dto/park.dto';

export interface IParkPriceSource {
    priceRangesOfParks(masterParkIds: readonly number[]): Promise<readonly ParkPriceRange[]>;
}
