import type { JobTestData, JobTestDataMarker } from '../dto/job-test-data.dto';

export interface IJobTestDataService {
    find(marker: JobTestDataMarker): Promise<JobTestData>;
    remove(found: JobTestData): Promise<number>;
}
