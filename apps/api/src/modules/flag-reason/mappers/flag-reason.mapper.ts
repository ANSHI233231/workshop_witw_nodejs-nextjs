import type { ActiveFlagReasonDto, FlagReasonDto, FlagReasonListItemDto } from '../dto/flag-reason.dto';
import type { FlagReasonListRow, FlagReasonRow } from '../types/flag-reason.types';

export const toFlagReason = (row: FlagReasonRow): FlagReasonDto => ({
    id: Number(row.id),
    name: row.name,
    status: row.status,
});

export const toActiveFlagReason = (row: FlagReasonRow): ActiveFlagReasonDto => ({
    id: Number(row.id),
    name: row.name,
});

export const toFlagReasonListItem = (row: FlagReasonListRow): FlagReasonListItemDto => ({
    ...toFlagReason(row),
    usedInFlags: Number(row.used_in_flags),
});
