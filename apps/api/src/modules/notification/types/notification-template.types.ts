import type { RowDataPacket } from '../../../database/connection';
import type { NotificationKindCode } from './notification.types';

export const NotificationTemplateStatus = { ACTIVE: 1, INACTIVE: 2, DRAFT: 3 } as const;

export type NotificationTemplateStatusCode =
    (typeof NotificationTemplateStatus)[keyof typeof NotificationTemplateStatus];

export interface NotificationTemplateRow extends RowDataPacket {
    id: number;
    notificationKind: NotificationKindCode;
    clientApp: number | null;
    code: string;
    name: string;
    titleTemplate: string;
    sentWhen: string | null;
    opens: string | null;
    status: NotificationTemplateStatusCode;
    updatedAt: Date;
}
