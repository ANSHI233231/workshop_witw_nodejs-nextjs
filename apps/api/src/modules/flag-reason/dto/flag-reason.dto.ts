import type { FlagReasonStatusCode } from '../types/flag-reason.types';

export type ActiveFlagReasonDto = {
    readonly id: number;
    readonly name: string;
};

export type FlagReasonDto = {
    readonly id: number;
    readonly name: string;
    readonly status: FlagReasonStatusCode;
};

export type FlagReasonListItemDto = FlagReasonDto & {
    readonly usedInFlags: number;
};

export type FlagReasonFilters = {
    readonly search: string | undefined;
    readonly status: FlagReasonStatusCode | undefined;
};

export type NewFlagReason = {
    readonly name: string;
};

export type FlagReasonInput = {
    readonly name: string;
    readonly status: FlagReasonStatusCode;
};
