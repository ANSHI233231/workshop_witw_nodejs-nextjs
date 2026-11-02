'use client';

import { type ExportColumn, ExportButton, serialColumn } from '@/components/ui/export-button';
import { DownloadIcon } from '@/components/ui/icons';
import { localDay } from '@/lib/csv';
import { formatDateTime } from '@/lib/format';
import { exportAuditLogs } from '@/services/audit.service';
import type { AuditLogFilters, AuditLogListItem } from '@/types/audit.types';

import { actorOf, entityOf } from './audit-actor';
import { appLabelOf, labelOf, OUTCOME_BADGES, titleOf } from './audit-labels';

const twoLines = (first: string, second: string | null): string => (second ? `${first} · ${second}` : first);

const COLUMNS: readonly ExportColumn<AuditLogListItem>[] = [
    serialColumn(),
    { header: 'Date & Time', value: (event) => formatDateTime(event.createdAt) },
    {
        header: 'Actor',
        value: (event) => {
            const actor = actorOf(event);
            return twoLines(actor.name, actor.detail);
        },
    },
    { header: 'Action', value: (event) => twoLines(labelOf(event.actionName), titleOf(event.moduleName)) },
    { header: 'Entity', value: (event) => entityOf(event) },
    { header: 'App', value: (event) => appLabelOf(event.clientAppName) },
    { header: 'IP Address', value: (event) => event.ipAddress },
    { header: 'Outcome', value: (event) => OUTCOME_BADGES[event.outcome]?.label ?? null },
];

export function AuditLogExport({ filters }: { readonly filters: AuditLogFilters }) {
    return (
        <ExportButton
            fileName={`audit-log-${localDay()}.csv`}
            columns={COLUMNS}
            load={() => exportAuditLogs(filters)}
            icon={<DownloadIcon />}
        />
    );
}
