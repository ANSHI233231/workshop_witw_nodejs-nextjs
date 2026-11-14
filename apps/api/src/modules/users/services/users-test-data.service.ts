import { ConflictException, ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IUsersTestDataService } from '../contracts/users-test-data-service.contract';
import type { TestAccountMarker, TestDataTable, UsersTestData } from '../dto/users-test-data.dto';
import type { TestAccountRow, UsersTestDataRepository } from '../repositories/users-test-data.repository';

const accountLabel = (row: TestAccountRow): string => `${row.name} <${row.email}>`;

const endsWith = (email: string, suffix: string): boolean => email.toLowerCase().endsWith(suffix.toLowerCase());

export class UsersTestDataService implements IUsersTestDataService {
    constructor(
        private readonly db: Database,
        private readonly repository: UsersTestDataRepository,
        private readonly auditService: IAuditService,
        private readonly isProduction: boolean,
    ) {}

    async find(marker: TestAccountMarker): Promise<UsersTestData> {
        this.refuseInProduction();
        const accounts = await this.repository.findMarked(this.db, marker.emailPrefix, marker.keptEmails);
        const userIds = accounts.map((row) => row.id);
        const roles = await this.repository.rolesOf(this.db, userIds);
        const blockers = [
            ...accounts
                .filter((row) => Number(row.super_admin_roles) > 0)
                .map((row) => `user ${row.id} ${row.email} has the Super Admin role`),
            ...accounts
                .filter((row) => marker.protectedEmailSuffixes.some((suffix) => endsWith(row.email, suffix)))
                .map((row) => `user ${row.id} ${row.email} is a sample or demo account`),
        ];
        const kept: TestDataTable[] = [];
        for (const suffix of marker.protectedEmailSuffixes) {
            const rows = await this.repository.withEmailEnding(this.db, suffix);
            kept.push({ table: `user (*${suffix})`, rows: rows.map((row) => ({ id: row.id, label: accountLabel(row) })) });
        }
        const keptAccounts = await this.repository.withEmails(this.db, marker.keptEmails);
        kept.push({ table: 'user (kept by email)', rows: keptAccounts.map((row) => ({ id: row.id, label: accountLabel(row) })) });
        return {
            userIds,
            tables: [
                { table: 'user', rows: accounts.map((row) => ({ id: row.id, label: accountLabel(row) })) },
                {
                    table: 'user_role',
                    rows: roles.map((row) => ({ id: row.id, label: `user ${row.user_id}, role ${row.meta_role_id}` })),
                },
            ],
            kept,
            blockers,
        };
    }

    async remove(found: UsersTestData): Promise<number> {
        this.refuseInProduction();
        if (found.blockers.length > 0) {
            throw new ConflictException(`Test accounts not removed: ${found.blockers.join('; ')}.`, 'TEST_DATA_BLOCKED');
        }
        if (found.userIds.length === 0) return 0;
        const event = { action: AuditAction.USER_TEST_DATA_REMOVED, entityType: AuditEntity.USER } as const;
        try {
            return await this.db.transaction(async () => {
                const removed = await this.repository.deleteUsers(this.db, found.userIds);
                await this.auditService.record({ ...event, details: { removed: found.tables } });
                return removed;
            });
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.USER_TEST_DATA_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Test data is never removed this way in production.', 'TEST_DATA_NOT_ALLOWED');
        }
    }
}
