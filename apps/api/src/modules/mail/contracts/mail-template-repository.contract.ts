import type { DbExecutor } from '../../../database/connection';
import type { MailTemplateFilters } from '../dto/mail.dto';
import type { MailTemplateRow } from '../types/mail.types';

export interface IMailTemplateRepository {
    findActiveByCode(db: DbExecutor, code: string): Promise<MailTemplateRow | undefined>;
    findById(db: DbExecutor, id: number): Promise<MailTemplateRow | undefined>;
    list(db: DbExecutor, filters: MailTemplateFilters): Promise<MailTemplateRow[]>;
    updateBody(db: DbExecutor, id: number, bodyHtml: string, actorId: number | null): Promise<void>;
}
