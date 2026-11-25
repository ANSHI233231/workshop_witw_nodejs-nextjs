import { ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IWishlistTestDataService } from '../contracts/wishlist-test-data-service.contract';
import type { WishlistTestData, WishlistTestDataScope } from '../dto/wishlist-test-data.dto';
import type { TestWishlistItemRow, WishlistTestDataRepository } from '../repositories/wishlist-test-data.repository';

const itemLabel = (row: TestWishlistItemRow): string =>
    `user ${row.user_id}: ${row.package_id === null ? `shared safari ${row.shared_safari_id ?? ''}` : `package ${row.package_id}`}`;

export class WishlistTestDataService implements IWishlistTestDataService {
    constructor(
        private readonly db: Database,
        private readonly repository: WishlistTestDataRepository,
        private readonly auditService: IAuditService,
        private readonly isProduction: boolean,
    ) {}

    async find(scope: WishlistTestDataScope): Promise<WishlistTestData> {
        this.refuseInProduction();
        const rows = await this.repository.marked(this.db, scope.userIds, scope.packageIds, scope.sharedSafariIds);
        return {
            wishlistItemIds: rows.map((row) => row.id),
            tables: [{ table: 'wishlist_item', rows: rows.map((row) => ({ id: row.id, label: itemLabel(row) })) }],
        };
    }

    async remove(found: WishlistTestData): Promise<number> {
        this.refuseInProduction();
        if (found.wishlistItemIds.length === 0) return 0;
        const event = { action: AuditAction.WISHLIST_TEST_DATA_REMOVED, entityType: AuditEntity.WISHLIST_ITEM } as const;
        try {
            return await this.db.transaction(async () => {
                const removed = await this.repository.deleteItems(this.db, found.wishlistItemIds);
                await this.auditService.record({ ...event, details: { removed: found.tables } });
                return removed;
            });
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.WISHLIST_TEST_DATA_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Test data is never removed this way in production.', 'TEST_DATA_NOT_ALLOWED');
        }
    }
}
