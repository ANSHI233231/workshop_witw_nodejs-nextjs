import type { AuthTestData } from '../dto/auth-test-data.dto';

export interface IAuthTestDataService {
    find(userIds: readonly number[]): Promise<AuthTestData>;
    remove(found: AuthTestData): Promise<number>;
}
