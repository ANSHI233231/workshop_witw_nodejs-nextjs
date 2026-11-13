import { ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import type { INotificationSeedService } from '../contracts/notification-seed-service.contract';
import type { NotificationSeedRemoval, SeedNotification } from '../dto/notification-seed.dto';
import type { NotificationSeedRepository } from '../repositories/notification-seed.repository';

export class NotificationSeedService implements INotificationSeedService {
    constructor(
        private readonly db: Database,
        private readonly repository: NotificationSeedRepository,
        private readonly isProduction: boolean,
    ) {}

    async seed(notifications: readonly SeedNotification[]): Promise<number> {
        this.refuseInProduction();
        let written = 0;
        for (const row of notifications) {
            if (await this.repository.exists(this.db, row)) continue;
            await this.repository.insert(this.db, row);
            written += 1;
        }
        return written;
    }

    async count(removal: NotificationSeedRemoval): Promise<number> {
        this.refuseInProduction();
        return this.repository.countFor(this.db, removal.entityType, removal.entityIds, removal.userIds);
    }

    async remove(removal: NotificationSeedRemoval): Promise<number> {
        this.refuseInProduction();
        const forEntities = await this.repository.deleteForEntities(this.db, removal.entityType, removal.entityIds);
        const forUsers = await this.repository.deleteForUsers(this.db, removal.userIds);
        return forEntities + forUsers;
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Sample data is never written in production.', 'SEED_NOT_ALLOWED');
        }
    }
}
