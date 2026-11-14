import type { NotificationTestData, NotificationTestDataScope } from '../dto/notification-test-data.dto';

export interface INotificationTestDataService {
    find(scope: NotificationTestDataScope): Promise<NotificationTestData>;
    remove(found: NotificationTestData): Promise<number>;
}
