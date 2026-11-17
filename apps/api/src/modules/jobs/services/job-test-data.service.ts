import { ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IJobTestDataService } from '../contracts/job-test-data-service.contract';
import type { JobTestData, JobTestDataMarker } from '../dto/job-test-data.dto';
import type { JobTestDataRepository, TestJobRunRow } from '../repositories/job-test-data.repository';
import { JobRunStatus } from '../types/job.types';

const labelOf = (row: TestJobRunRow): string => `${row.title ?? row.command} (${row.command}, status ${row.status})`;

export class JobTestDataService implements IJobTestDataService {
    constructor(
        private readonly db: Database,
        private readonly repository: JobTestDataRepository,
        private readonly auditService: IAuditService,
        private readonly isProduction: boolean,
    ) {}

    async find(marker: JobTestDataMarker): Promise<JobTestData> {
        this.refuseInProduction();
        const runs = new Map<number, TestJobRunRow>();
        let level = await this.repository.marked(this.db, marker.textPrefix);
        while (level.length > 0) {
            for (const row of level) runs.set(row.id, row);
            level = (await this.repository.retriesOf(this.db, level.map((row) => row.id))).filter(
                (row) => !runs.has(row.id),
            );
        }
        const rows = [...runs.values()].sort((a, b) => a.id - b.id);
        return {
            runIds: rows.map((row) => row.id),
            tables: [{ table: 'job_run', rows: rows.map((row) => ({ id: row.id, label: labelOf(row) })) }],
            blockers: rows
                .filter((row) => row.status === JobRunStatus.RUNNING)
                .map((row) => `job_run ${row.id} is running now, and can't be removed`),
        };
    }

    async remove(found: JobTestData): Promise<number> {
        this.refuseInProduction();
        if (found.runIds.length === 0) return 0;
        const event = { action: AuditAction.JOB_RUN_TEST_DATA_REMOVED, entityType: AuditEntity.JOB_RUN } as const;
        try {
            return await this.db.transaction(async () => {
                const count = await this.repository.deleteRuns(this.db, found.runIds);
                await this.auditService.record({ ...event, details: { removed: found.tables } });
                return count;
            });
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.JOB_RUN_TEST_DATA_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Test data is never removed this way in production.', 'TEST_DATA_NOT_ALLOWED');
        }
    }
}
