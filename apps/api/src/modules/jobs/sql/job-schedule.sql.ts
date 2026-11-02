type ScheduleShape = { readonly search: boolean; readonly status: boolean };

const scheduleWhere = (shape: ScheduleShape): string =>
    `WHERE 1 = 1${shape.search ? ' AND (s.name LIKE ? OR s.command LIKE ?)' : ''}${shape.status ? ' AND s.status = ?' : ''}`;

const SCHEDULE_COLUMNS = `
        s.id, s.name, s.command, s.arguments, s.cron_expression AS cronExpression, s.timeout_minutes AS timeoutMinutes,
        s.description, s.status, lr.id AS lastRunId, lr.status AS lastRunStatus, lr.run_at AS lastRunAt,
        lr.started_at AS lastStartedAt, lr.finished_at AS lastFinishedAt`;

const SCHEDULE_FROM = `
        FROM job_schedule s
        LEFT JOIN job_run lr ON lr.id = (
            SELECT r.id FROM job_run r WHERE r.job_schedule_id = s.id ORDER BY r.run_at DESC, r.id DESC LIMIT 1
        )`;

export const JobScheduleSQL = {
    list: (shape: ScheduleShape) => `
        SELECT ${SCHEDULE_COLUMNS}
        ${SCHEDULE_FROM}
        ${scheduleWhere(shape)}
        ORDER BY s.name, s.id
        LIMIT ? OFFSET ?`,

    count: (shape: ScheduleShape) => `
        SELECT COUNT(*) AS total
        FROM job_schedule s
        ${scheduleWhere(shape)}`,

    find: `
        SELECT ${SCHEDULE_COLUMNS}
        ${SCHEDULE_FROM}
        WHERE s.id = ?
        LIMIT 1`,

    active: `
        SELECT ${SCHEDULE_COLUMNS}
        ${SCHEDULE_FROM}
        WHERE s.status = ?`,

    nameTaken: `
        SELECT id FROM job_schedule WHERE name = ? AND id <> ? LIMIT 1`,

    insert: `
        INSERT INTO job_schedule
            (name, command, arguments, cron_expression, timeout_minutes, description, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    update: `
        UPDATE job_schedule
        SET name = ?, command = ?, arguments = ?, cron_expression = ?, timeout_minutes = ?, description = ?, status = ?,
            updated_by = ?
        WHERE id = ?`,
} as const;
