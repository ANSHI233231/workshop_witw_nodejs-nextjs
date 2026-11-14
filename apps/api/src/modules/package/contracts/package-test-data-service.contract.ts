import type { PackageTestData, PackageTestDataScope } from '../dto/package-test-data.dto';

export interface IPackageTestDataService {
    find(scope: PackageTestDataScope): Promise<PackageTestData>;
    remove(found: PackageTestData): Promise<number>;
}
