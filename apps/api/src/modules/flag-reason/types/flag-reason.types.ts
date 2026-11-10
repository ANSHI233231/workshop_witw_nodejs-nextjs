import type { RowDataPacket } from '../../../database/connection';

export const FlagReasonStatus = { ACTIVE: 1, INACTIVE: 2 } as const;

export type FlagReasonStatusCode = (typeof FlagReasonStatus)[keyof typeof FlagReasonStatus];

export const FLAG_REASON_LIMITS = { NAME_MAX: 60, SEARCH: 60 } as const;

export interface FlagReasonRow extends RowDataPacket {
    id: number;
    name: string;
    status: FlagReasonStatusCode;
}

export interface FlagReasonListRow extends FlagReasonRow {
    used_in_flags: number | string;
}
