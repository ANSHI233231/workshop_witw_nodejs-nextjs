import type { RowDataPacket } from '../../../database/connection';
import type { NotificationKindCode } from './notification.types';

export const DeliveryChannel = { EMAIL: 1, IN_APP: 2 } as const;

export type DeliveryChannelCode = (typeof DeliveryChannel)[keyof typeof DeliveryChannel];

export const DeliveryStatus = { DELIVERED: 1, FAILED: 2, CAPTURED: 3, SENT: 4, READ: 5 } as const;

export type DeliveryStatusCode = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];

export type MailStatusCodes = { readonly sent: number; readonly failed: number };

export const DELIVERY_LIMITS = { TEMPLATE_KEY: 64, SEARCH: 100 } as const;

export interface DeliveryRow extends RowDataPacket {
    channel: DeliveryChannelCode;
    recordId: number;
    recipient: string | null;
    title: string;
    templateKey: string | null;
    templateName: string | null;
    sentAt: Date;
    deliveryStatus: DeliveryStatusCode;
}

export interface InAppDeliveryRow extends RowDataPacket {
    id: number;
    notificationKind: NotificationKindCode;
    clientApp: number;
    recipientName: string | null;
    recipientUsername: string | null;
    actorName: string | null;
    title: string;
    excerpt: string | null;
    readAt: Date | null;
    createdAt: Date;
    templateName: string | null;
    titleTemplate: string | null;
    opens: string | null;
}

export interface DeliveryTotalRow extends RowDataPacket {
    total: number;
}
