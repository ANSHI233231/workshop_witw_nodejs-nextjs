import type { ProfileTestData } from '../dto/profile-test-data.dto';

export interface IProfileTestDataService {
    find(userIds: readonly number[]): Promise<ProfileTestData>;
    remove(found: ProfileTestData): Promise<number>;
}
