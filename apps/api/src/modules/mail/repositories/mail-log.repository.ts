import { type PaginationQuery, toOffset } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { IMailLogRepository } from '../contracts/mail-log-repository.contract';
import type { MailLogFilters, NewMailLog } from '../dto/mail.dto';
import { MailLogSQL } from '../sql/mail-log.sql';
import type { MailCountRow, MailLogDetailRow, MailLogListRow } from '../types/mail.types';

const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

const listShape = (filters: MailLogFilters) => ({
    search: filters.search !== undefined,
    status: filters.status !== undefined,
    template: filters.templateCode !== undefined,
});

const listParams = (filters: MailLogFilters): unknown[] => [
    ...(filters.search !== undefined ? [likeAnywhere(filters.search), likeAnywhere(filters.search)] : []),
    ...(filters.status !== undefined ? [filters.status] : []),
    ...(filters.templateCode !== undefined ? [filters.templateCode] : []),
];

export class MailLogRepository implements IMailLogRepository {
    async insert(db: DbExecutor, log: NewMailLog): Promise<number> {
        const result = await db.execute(MailLogSQL.insert, [
            log.mailTemplateId,
            log.templateCode,
            log.clientApp,
            log.userId,
            log.recipientEmail,
            log.senderEmail,
            log.subject,
            log.bodyHtml,
            log.status,
            log.errorMessage,
            log.createdBy,
        ]);
        return result.insertId;
    }

    list(db: DbExecutor, filters: MailLogFilters, pagination: PaginationQuery): Promise<MailLogListRow[]> {
        return db.query<MailLogListRow>(MailLogSQL.list(listShape(filters)), [
            ...listParams(filters),
            pagination.limit,
            toOffset(pagination),
        ]);
    }

    async count(db: DbExecutor, filters: MailLogFilters): Promise<number> {
        const rows = await db.query<MailCountRow>(MailLogSQL.count(listShape(filters)), listParams(filters));
        return Number(rows[0]?.total ?? 0);
    }

    async findById(db: DbExecutor, id: number): Promise<MailLogDetailRow | undefined> {
        const rows = await db.query<MailLogDetailRow>(MailLogSQL.findById, [id]);
        return rows[0];
    }
}
