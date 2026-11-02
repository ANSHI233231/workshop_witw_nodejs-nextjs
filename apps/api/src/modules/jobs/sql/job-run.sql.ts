type RunShape = {
    readonly search: boolean;
    readonly scheduleId: boolean;
    readonly status: boolean;
    readonly trigger: boolean;
    readonly from: boolean;
    readonly to: boolean;
    readonly errorsOnly: boolean;
    readonly oneTime: boolean;
};

const placeholders = (count: number): string => Array.from({ length: count }, () => '?').join(', ');

const runWhere = (shape: RunShape, errorStatusCount: number): string =>
    [
        'WHERE 1 = 1',
        shape.search ? ' AND (r.command LIKE ? OR r.title LIKE ?)' : '',
        shape.scheduleId ? ' AND r.job_schedule_id = ?' : '',
        shape.status ? ' AND r.status = ?' : '',
        shape.trigger ? ' AND r.run_trigger = ?' : '',
        shape.from ? ' AND r.run_at >= ?' : '',
        shape.to ? ' AND r.run_at < ?' : '',
        shape.errorsOnly ? ` AND r.status IN (${placeholders(errorStatusCount)})` : '',
        shape.oneTime ? ' AND r.job_schedule_id IS NULL' : '',
    ].join('');

const RUN_COLUMNS = `
        r.id, r.command, r.arguments, r.title, r.job_schedule_id AS jobScheduleId, s.name AS scheduleName,
        r.run_trigger AS runTrigger, r.run_at AS runAt, r.status, r.timeout_minutes AS timeoutMinutes, r.pid,
        r.progress_percent AS progressPercent, r.started_at AS startedAt, r.finished_at AS finishedAt,
        r.exit_code AS exitCode, r.retry_of_job_run_id AS retryOfJobRunId, r.created_by AS createdBy,
        u.name AS createdByName, r.created_at AS createdAt`;

const RUN_FROM = `
        FROM job_run r
        LEFT JOIN job_schedule s ON s.id = r.job_schedule_id
        LEFT JOIN user u ON u.id = r.created_by`;

export const JobRunSQL = {
    list: (shape: RunShape, errorStatusCount: number) => `
        SELECT ${RUN_COLUMNS}
        ${RUN_FROM}
        ${runWhere(shape, errorStatusCount)}
        ORDER BY r.run_at DESC, r.id DESC
        LIMIT ? OFFSET ?`,

    count: (shape: RunShape, errorStatusCount: number) => `
        SELECT COUNT(*) AS total
        FROM job_run r
        ${runWhere(shape, errorStatusCount)}`,

    find: `
        SELECT ${RUN_COLUMNS}, r.output, r.error
        ${RUN_FROM}
        WHERE r.id = ?
        LIMIT 1`,

    insert: `
        INSERT IGNORE INTO job_run
            (command, arguments, title, job_schedule_id, run_trigger, run_key, run_at, status, timeout_minutes,
             retry_of_job_run_id, error, finished_at, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    openRunOfSchedule: `
        SELECT id FROM job_run WHERE job_schedule_id = ? AND status IN (?, ?) LIMIT 1`,

    dueIds: `
        SELECT id FROM job_run
        WHERE status = ? AND run_at <= UTC_TIMESTAMP()
        ORDER BY run_at, id
        LIMIT ?
        FOR UPDATE SKIP LOCKED`,

    markRunning: `
        UPDATE job_run SET status = ?, started_at = UTC_TIMESTAMP(), heartbeat_at = UTC_TIMESTAMP() WHERE id = ?`,

    setPid: `
        UPDATE job_run SET pid = ? WHERE id = ?`,

    heartbeat: (count: number) => `
        UPDATE job_run SET heartbeat_at = UTC_TIMESTAMP() WHERE status = ? AND id IN (${placeholders(count)})`,

    finish: `
        UPDATE job_run
        SET status = ?, finished_at = UTC_TIMESTAMP(), exit_code = ?, output = ?, error = ?, pid = NULL
        WHERE id = ? AND status = ?`,

    recoverStale: `
        UPDATE job_run
        SET status = ?, finished_at = UTC_TIMESTAMP(), error = ?, pid = NULL
        WHERE status = ? AND heartbeat_at < (UTC_TIMESTAMP() - INTERVAL ? SECOND)`,

    cancel: `
        UPDATE job_run SET status = ?, finished_at = UTC_TIMESTAMP() WHERE id = ? AND status = ?`,

    terminate: `
        UPDATE job_run SET status = ?, finished_at = UTC_TIMESTAMP(), error = ?, pid = NULL WHERE id = ? AND status = ?`,
} as const;
