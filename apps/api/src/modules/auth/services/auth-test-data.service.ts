import { ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IAuthTestDataService } from '../contracts/auth-test-data-service.contract';
import type { AuthTestData } from '../dto/auth-test-data.dto';
import type { AuthTestDataRepository, UserTokenRow } from '../repositories/auth-test-data.repository';

const tokenLabel = (row: UserTokenRow): string => `user ${row.user_id}, app ${row.client_app}`;

export class AuthTestDataService implements IAuthTestDataService {
    constructor(
        private readonly db: Database,
        private readonly repository: AuthTestDataRepository,
        private readonly auditService: IAuditService,
        private readonly isProduction: boolean,
    ) {}

    async find(userIds: readonly number[]): Promise<AuthTestData> {
        this.refuseInProduction();
        const refreshTokens = await this.repository.refreshTokensOf(this.db, userIds);
        const passwordResets = await this.repository.passwordResetsOf(this.db, userIds);
        return {
            refreshTokenIds: refreshTokens.map((row) => row.id),
            passwordResetIds: passwordResets.map((row) => row.id),
            tables: [
                { table: 'user_refresh_token', rows: refreshTokens.map((row) => ({ id: row.id, label: tokenLabel(row) })) },
                { table: 'user_password_reset', rows: passwordResets.map((row) => ({ id: row.id, label: tokenLabel(row) })) },
            ],
        };
    }

    async remove(found: AuthTestData): Promise<number> {
        this.refuseInProduction();
        if (found.refreshTokenIds.length === 0 && found.passwordResetIds.length === 0) return 0;
        const event = { action: AuditAction.AUTH_TEST_DATA_REMOVED, entityType: AuditEntity.USER } as const;
        try {
            return await this.db.transaction(async () => {
                const tokens = await this.repository.deleteRefreshTokens(this.db, found.refreshTokenIds);
                const resets = await this.repository.deletePasswordResets(this.db, found.passwordResetIds);
                await this.auditService.record({
                    ...event,
                    details: { refreshTokenIds: found.refreshTokenIds, passwordResetIds: found.passwordResetIds },
                });
                return tokens + resets;
            });
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.AUTH_TEST_DATA_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Test data is never removed this way in production.', 'TEST_DATA_NOT_ALLOWED');
        }
    }
}
