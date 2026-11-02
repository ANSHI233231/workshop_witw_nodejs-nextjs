import { AuditOutcome, type AuditOutcomeCode } from '@/types/audit.types';

const SHORT_WORDS = new Set(['UI', 'IP', 'ID']);

export const labelOf = (codeName: string): string =>
    codeName
        .split('_')
        .map((word, index) => {
            if (SHORT_WORDS.has(word)) return word;
            const lower = word.toLowerCase();
            return index === 0 ? `${lower[0]?.toUpperCase() ?? ''}${lower.slice(1)}` : lower;
        })
        .join(' ');

export const titleOf = (codeName: string): string =>
    codeName
        .split('_')
        .map((word) => `${word[0] ?? ''}${word.slice(1).toLowerCase()}`)
        .join(' ');

const APP_LABELS: Readonly<Record<string, string>> = { MANAGE: 'Admin Console', CLI: 'CLI' };

export const appLabelOf = (codeName: string): string => APP_LABELS[codeName] ?? titleOf(codeName);

export const OUTCOME_BADGES: Readonly<
    Record<AuditOutcomeCode, { readonly className: string; readonly label: string }>
> = {
    [AuditOutcome.SUCCESS]: { className: 'badge badge-success', label: 'Success' },
    [AuditOutcome.FAILURE]: { className: 'badge badge-danger', label: 'Failed' },
};

export const OUTCOME_OPTIONS: readonly AuditOutcomeCode[] = [AuditOutcome.SUCCESS, AuditOutcome.FAILURE];
