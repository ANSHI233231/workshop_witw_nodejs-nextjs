import type { PaginationQuery } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { MailLogFilters, NewMailLog } from '../dto/mail.dto';
import type { MailLogDetailRow, MailLogListRow } from '../types/mail.types';

export interface IMailLogRepository {
    insert(db: DbExecutor, log: NewMailLog): Promise<number>;
    list(db: DbExecutor, filters: MailLogFilters, pagination: PaginationQuery): Promise<MailLogListRow[]>;
    count(db: DbExecutor, filters: MailLogFilters): Promise<number>;
    findById(db: DbExecutor, id: number): Promise<MailLogDetailRow | undefined>;
}
