'use client';

import { useRouter } from 'next/navigation';

import { DateRangeFilter } from '@/components/ui/date-range-filter';
import { type RemoteOption, RemoteSelect } from '@/components/ui/remote-select';
import { ResetIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';
import { AUDIT_LOG_LIMITS, type AuditLogFilters, type AuditOptions } from '@/types/audit.types';

import { appLabelOf, labelOf, OUTCOME_BADGES, OUTCOME_OPTIONS, titleOf } from './audit-labels';
import { AUDIT_LOG_PATH, auditLogUrl } from './audit-log-url';

const codeOf = (value: string): number | undefined => (value ? Number(value) : undefined);

export function AuditLogFilterBar({
    filters,
    options,
}: {
    readonly filters: AuditLogFilters;
    readonly options: AuditOptions;
}) {
    const t = useT();
    const router = useRouter();
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(auditLogUrl({ ...filters, search, page: 1 })),
    );
    const goTo = (changes: Partial<AuditLogFilters>) =>
        router.push(auditLogUrl({ ...filters, search: text.trim(), ...changes, page: 1 }));
    const moduleNameOf = new Map(options.modules.map((module) => [module.code, titleOf(module.name)]));
    const actionChoices: readonly RemoteOption[] = options.actions
        .filter((action) => filters.module === undefined || action.module === filters.module)
        .map((action) => ({
            id: action.code,
            label: labelOf(action.name),
            context: filters.module === undefined ? (moduleNameOf.get(action.module) ?? null) : null,
        }));
    const chosenAction = actionChoices.find((action) => action.id === filters.action);
    const findActions = async (search: string): Promise<readonly RemoteOption[]> => {
        const words = search.toLowerCase().split(/\s+/).filter(Boolean);
        return actionChoices.filter((action) => {
            const text = `${action.label} ${action.context ?? ''}`.toLowerCase();
            return words.every((word) => text.includes(word));
        });
    };

    return (
        <div className="filter-bar al-fb">
            <div className="input-group fw-md">
                <SearchIcon />
                <input
                    className="input"
                    placeholder={t('Search by user, IP or request ID')}
                    aria-label={t('Search')}
                    value={text}
                    maxLength={AUDIT_LOG_LIMITS.SEARCH}
                    onChange={(event) => setText(event.target.value)}
                />
            </div>
            <select
                className="select fw-sm"
                aria-label={t('Module')}
                value={filters.module ?? ''}
                onChange={(event) => goTo({ module: codeOf(event.target.value), action: undefined })}
            >
                <option value="">{t('Module: All')}</option>
                {options.modules.map((module) => (
                    <option key={module.code} value={module.code}>
                        {titleOf(module.name)}
                    </option>
                ))}
            </select>
            <RemoteSelect
                ariaLabel={t('Action')}
                allLabel={t('Action: All')}
                searchPlaceholder={t('Search actions')}
                value={chosenAction}
                load={findActions}
                onChange={(action) => goTo({ action: action?.id })}
            />
            <select
                className="select fw-sm"
                aria-label={t('Outcome')}
                value={filters.outcome ?? ''}
                onChange={(event) =>
                    goTo({ outcome: OUTCOME_OPTIONS.find((outcome) => String(outcome) === event.target.value) })
                }
            >
                <option value="">{t('Outcome: All')}</option>
                {OUTCOME_OPTIONS.map((outcome) => (
                    <option key={outcome} value={outcome}>
                        {t(OUTCOME_BADGES[outcome].label)}
                    </option>
                ))}
            </select>
            <select
                className="select fw-sm"
                aria-label={t('App')}
                value={filters.clientApp ?? ''}
                onChange={(event) => goTo({ clientApp: codeOf(event.target.value) })}
            >
                <option value="">{t('App: All')}</option>
                {options.clientApps.map((app) => (
                    <option key={app.code} value={app.code}>
                        {t(appLabelOf(app.name))}
                    </option>
                ))}
            </select>
            <DateRangeFilter
                range={{ from: filters.from, to: filters.to }}
                onChange={(range) => goTo({ from: range.from, to: range.to })}
            />
            <button
                type="button"
                className="btn btn-text"
                onClick={() => {
                    clearText();
                    router.push(AUDIT_LOG_PATH);
                }}
            >
                <ResetIcon />
                {t('Reset')}
            </button>
        </div>
    );
}
