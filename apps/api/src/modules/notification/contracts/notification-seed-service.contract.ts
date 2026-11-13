import type { NotificationSeedRemoval, SeedNotification } from '../dto/notification-seed.dto';

export interface INotificationSeedService {
    seed(notifications: readonly SeedNotification[]): Promise<number>;
    count(removal: NotificationSeedRemoval): Promise<number>;
    remove(removal: NotificationSeedRemoval): Promise<number>;
}
