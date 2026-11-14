import { ConflictException, ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IPackageTestDataService } from '../contracts/package-test-data-service.contract';
import type { PackageTestData, PackageTestDataScope, PackageTestDataTable } from '../dto/package-test-data.dto';
import type { PackageTestDataRepository, TestPackageRow } from '../repositories/package-test-data.repository';
import { PACKAGE_FOLDER } from '../types/package.types';

const packageLabel = (row: TestPackageRow): string => `${row.slug} (partner ${row.partner_id}, website status ${row.website_status})`;

export class PackageTestDataService implements IPackageTestDataService {
    constructor(
        private readonly db: Database,
        private readonly repository: PackageTestDataRepository,
        private readonly auditService: IAuditService,
        private readonly fileStorage: IFileStorage,
        private readonly isProduction: boolean,
    ) {}

    async find(scope: PackageTestDataScope): Promise<PackageTestData> {
        this.refuseInProduction();
        const packages = await this.repository.marked(this.db, scope.partnerIds, scope.textPrefix, scope.slugPrefix);
        const packageIds = packages.map((row) => row.id);
        const versions = await this.repository.versionsOf(this.db, packageIds);
        const versionIds = versions.map((row) => row.id);
        const children = await this.repository.childrenOf(this.db, versionIds);
        const reasons = await this.repository.markedReasons(this.db, scope.textPrefix);
        const reasonIds = reasons.map((row) => row.id);
        const reasonUses = await this.repository.reasonsUsedByOthers(this.db, reasonIds, packageIds);
        const strayVersions = await this.repository.markedVersionsOfOthers(this.db, packageIds, scope.textPrefix);
        const kept = await this.repository.packagesNotIn(this.db, packageIds);
        const childTables: PackageTestDataTable[] = [...children].map(([table, rows]) => ({
            table,
            rows: rows.map((row) => ({ id: row.id, label: '' })),
        }));
        return {
            packageIds,
            versionIds,
            deleteReasonIds: reasonIds,
            tables: [
                { table: 'package', rows: packages.map((row) => ({ id: row.id, label: packageLabel(row) })) },
                {
                    table: 'package_version',
                    rows: versions.map((row) => ({ id: row.id, label: `package ${row.package_id} v${row.version_number} ${row.name}` })),
                },
                ...childTables,
                { table: 'master_package_delete_reason', rows: reasons.map((row) => ({ id: row.id, label: row.name })) },
            ],
            folders: packageIds.map((id) => `${PACKAGE_FOLDER}/${id}`),
            kept: [
                { table: 'package', rows: kept.map((row) => ({ id: row.id, label: packageLabel(row) })) },
                {
                    table: 'package_version named with the marker, of a package that stays',
                    rows: strayVersions.map((row) => ({ id: row.id, label: `package ${row.package_id} v${row.version_number} ${row.name}` })),
                },
            ],
            blockers: reasonUses.map(
                (row) => `delete reason ${row.master_package_delete_reason_id} is used by package ${row.id}, which stays`,
            ),
        };
    }

    async remove(found: PackageTestData): Promise<number> {
        this.refuseInProduction();
        if (found.blockers.length > 0) {
            throw new ConflictException(`Test packages not removed: ${found.blockers.join('; ')}.`, 'TEST_DATA_BLOCKED');
        }
        if (found.packageIds.length === 0 && found.deleteReasonIds.length === 0) return 0;
        const event = { action: AuditAction.PACKAGE_TEST_DATA_REMOVED, entityType: AuditEntity.PACKAGE } as const;
        try {
            const removed = await this.db.transaction(async () => {
                const count = await this.repository.deletePackages(this.db, found.packageIds, found.versionIds);
                await this.repository.deleteReasons(this.db, found.deleteReasonIds);
                await this.auditService.record({ ...event, details: { removed: found.tables, folders: found.folders } });
                return count;
            });
            for (const folder of found.folders) await this.fileStorage.removeFolder(folder);
            return removed;
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.PACKAGE_TEST_DATA_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Test data is never removed this way in production.', 'TEST_DATA_NOT_ALLOWED');
        }
    }
}
