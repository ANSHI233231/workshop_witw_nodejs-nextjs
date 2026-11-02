import type { RowDataPacket } from '../../../database/connection';

export type DatabaseStatus = 'up' | 'down';

export type HealthStatus = {
    readonly status: 'ok' | 'degraded';
    readonly database: DatabaseStatus;
    readonly uptimeSeconds: number;
};

export interface PingRow extends RowDataPacket {
    ok: number;
}
