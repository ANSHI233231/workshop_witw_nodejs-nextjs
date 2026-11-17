const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

export const JobTestDataSQL = {
    marked: `
        SELECT job_run.id, job_run.title, job_run.command, job_run.status
        FROM job_run
        WHERE job_run.title LIKE ?
        ORDER BY job_run.id`,

    retriesOf: (count: number) => `
        SELECT job_run.id, job_run.title, job_run.command, job_run.status
        FROM job_run
        WHERE job_run.retry_of_job_run_id IN (${inList(count)})
        ORDER BY job_run.id`,

    deleteRuns: (count: number) => `
        DELETE FROM job_run
        WHERE id IN (${inList(count)})`,
} as const;
