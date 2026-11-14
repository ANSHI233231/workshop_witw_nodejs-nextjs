import type { PartnerTestData } from '../dto/partner-test-data.dto';

export interface IPartnerTestDataService {
    find(userIds: readonly number[]): Promise<PartnerTestData>;
    remove(found: PartnerTestData): Promise<number>;
}
