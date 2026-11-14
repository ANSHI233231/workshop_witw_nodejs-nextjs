import type { TestAccountMarker, UsersTestData } from '../dto/users-test-data.dto';

export interface IUsersTestDataService {
    find(marker: TestAccountMarker): Promise<UsersTestData>;
    remove(found: UsersTestData): Promise<number>;
}
