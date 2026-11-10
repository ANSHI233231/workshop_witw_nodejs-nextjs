export const FlagReasonStatus = { ACTIVE: 1, INACTIVE: 2 } as const;

export type FlagReasonStatusCode = (typeof FlagReasonStatus)[keyof typeof FlagReasonStatus];

export const FLAG_REASON_LIMITS = { NAME_MAX: 60, SEARCH: 60 } as const;

export type FlagReason = {
    readonly id: number;
    readonly name: string;
    readonly status: FlagReasonStatusCode;
};

export type FlagReasonListItem = FlagReason & {
    readonly usedInFlags: number;
};

export type FlagReasonFilters = {
    readonly search: string;
    readonly status: FlagReasonStatusCode | undefined;
};

export type FlagReasonInput = {
    readonly name: string;
    readonly status: FlagReasonStatusCode;
};
