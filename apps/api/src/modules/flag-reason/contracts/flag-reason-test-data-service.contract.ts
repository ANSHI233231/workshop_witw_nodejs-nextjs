import type { FlagReasonTestData, FlagReasonTestDataMarker } from '../dto/flag-reason-test-data.dto';

export interface IFlagReasonTestDataService {
    find(marker: FlagReasonTestDataMarker): Promise<FlagReasonTestData>;
    remove(found: FlagReasonTestData): Promise<number>;
}
