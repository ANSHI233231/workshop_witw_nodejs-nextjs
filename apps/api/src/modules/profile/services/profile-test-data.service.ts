import { ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IProfileTestDataService } from '../contracts/profile-test-data-service.contract';
import type { ProfileTestData } from '../dto/profile-test-data.dto';
import type { ProfileTestDataRepository } from '../repositories/profile-test-data.repository';
import { type ProfileFiles, profileFolder } from './profile-files';

export class ProfileTestDataService implements IProfileTestDataService {
    constructor(
        private readonly db: Database,
        private readonly repository: ProfileTestDataRepository,
        private readonly auditService: IAuditService,
        private readonly files: ProfileFiles,
        private readonly isProduction: boolean,
    ) {}

    async find(userIds: readonly number[]): Promise<ProfileTestData> {
        this.refuseInProduction();
        const rows = await this.repository.ofUsers(this.db, userIds);
        return {
            profileIds: rows.map((row) => row.id),
            tables: [{ table: 'user_profile', rows: rows.map((row) => ({ id: row.id, label: `user ${row.user_id}` })) }],
            folders: userIds.map(profileFolder),
        };
    }

    async remove(found: ProfileTestData): Promise<number> {
        this.refuseInProduction();
        const event = { action: AuditAction.PROFILE_TEST_DATA_REMOVED, entityType: AuditEntity.USER_PROFILE } as const;
        let removed = 0;
        try {
            if (found.profileIds.length > 0) {
                removed = await this.db.transaction(async () => {
                    const count = await this.repository.deleteProfiles(this.db, found.profileIds);
                    await this.auditService.record({ ...event, details: { removed: found.tables } });
                    return count;
                });
            }
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.PROFILE_TEST_DATA_REMOVE_FAILED }, error);
            throw error;
        }
        for (const folder of found.folders) await this.files.removeFolderAt(folder);
        return removed;
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Test data is never removed this way in production.', 'TEST_DATA_NOT_ALLOWED');
        }
    }
}
