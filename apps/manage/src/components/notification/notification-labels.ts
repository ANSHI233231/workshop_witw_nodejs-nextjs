import { MailLogStatus } from '@/types/mail.types';
import {
    DeliveryChannel,
    type DeliveryChannelCode,
    DeliveryStatus,
    type DeliveryStatusCode,
    NotificationTemplateStatus,
} from '@/types/notification.types';

type Badge = { readonly className: string; readonly label: string };

export const CHANNELS: Readonly<Record<DeliveryChannelCode, { readonly key: string; readonly label: string }>> = {
    [DeliveryChannel.EMAIL]: { key: 'email', label: 'Email' },
    [DeliveryChannel.IN_APP]: { key: 'inapp', label: 'In-app' },
};

export const CHANNEL_OPTIONS: readonly DeliveryChannelCode[] = [DeliveryChannel.EMAIL, DeliveryChannel.IN_APP];

export const DELIVERY_BADGES: Readonly<Record<DeliveryStatusCode, Badge>> = {
    [DeliveryStatus.DELIVERED]: { className: 'badge badge-success', label: 'Delivered' },
    [DeliveryStatus.FAILED]: { className: 'badge badge-danger', label: 'Failed' },
    [DeliveryStatus.CAPTURED]: { className: 'badge badge-info', label: 'Captured (not sent)' },
    [DeliveryStatus.SENT]: { className: 'badge badge-neutral', label: 'Sent' },
    [DeliveryStatus.READ]: { className: 'badge badge-success', label: 'Read' },
};

export const DELIVERY_STATUS_OPTIONS: readonly DeliveryStatusCode[] = [
    DeliveryStatus.DELIVERED,
    DeliveryStatus.FAILED,
    DeliveryStatus.CAPTURED,
    DeliveryStatus.SENT,
    DeliveryStatus.READ,
];

export const MAIL_DELIVERY_STATUS: Readonly<Record<number, DeliveryStatusCode>> = {
    [MailLogStatus.SENT]: DeliveryStatus.DELIVERED,
    [MailLogStatus.FAILED]: DeliveryStatus.FAILED,
    [MailLogStatus.CAPTURED]: DeliveryStatus.CAPTURED,
};

const TEMPLATE_BADGES: Readonly<Record<number, Badge>> = {
    [NotificationTemplateStatus.ACTIVE]: { className: 'badge badge-success', label: 'Active' },
    [NotificationTemplateStatus.DRAFT]: { className: 'badge badge-neutral', label: 'Draft' },
    [NotificationTemplateStatus.INACTIVE]: { className: 'badge badge-warning', label: 'Inactive' },
};

const INACTIVE_BADGE: Badge = { className: 'badge badge-warning', label: 'Inactive' };

export const templateBadgeOf = (status: number): Badge => TEMPLATE_BADGES[status] ?? INACTIVE_BADGE;

export const TEMPLATE_STATUS_OPTIONS: readonly { readonly value: number; readonly label: string }[] = [
    { value: NotificationTemplateStatus.ACTIVE, label: 'Active' },
    { value: NotificationTemplateStatus.DRAFT, label: 'Draft' },
    { value: NotificationTemplateStatus.INACTIVE, label: 'Inactive' },
];
