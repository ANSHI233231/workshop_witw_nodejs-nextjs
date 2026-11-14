import type { ClientAppCode } from '../../../core/context';

export type NotificationFeedGate = (userId: number) => Promise<boolean>;

export type NotificationFeedGates = Readonly<Partial<Record<ClientAppCode, NotificationFeedGate>>>;
