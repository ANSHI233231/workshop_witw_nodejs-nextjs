import type { SharedSafariTestData, SharedSafariTestDataScope } from '../dto/shared-safari-test-data.dto';

export interface ISharedSafariTestDataService {
    find(scope: SharedSafariTestDataScope): Promise<SharedSafariTestData>;
    remove(found: SharedSafariTestData): Promise<number>;
}
