import type { ParkTestData, ParkTestDataMarker } from '../dto/park-test-data.dto';

export interface IParkTestDataService {
    find(marker: ParkTestDataMarker): Promise<ParkTestData>;
    remove(found: ParkTestData): Promise<number>;
}
