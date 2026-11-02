import type { DbExecutor } from '../../../database/connection';
import type { IMailTemplateRepository } from '../contracts/mail-template-repository.contract';
import type { MailTemplateFilters } from '../dto/mail.dto';
import { MailTemplateSQL } from '../sql/mail-template.sql';
import { type MailTemplateRow, MailTemplateStatus } from '../types/mail.types';

const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

export class MailTemplateRepository implements IMailTemplateRepository {
    async findActiveByCode(db: DbExecutor, code: string): Promise<MailTemplateRow | undefined> {
        const rows = await db.query<MailTemplateRow>(MailTemplateSQL.findActiveByCode, [
            code,
            MailTemplateStatus.ACTIVE,
        ]);
        return rows[0];
    }

    async findById(db: DbExecutor, id: number): Promise<MailTemplateRow | undefined> {
        const rows = await db.query<MailTemplateRow>(MailTemplateSQL.findById, [id]);
        return rows[0];
    }

    list(db: DbExecutor, filters: MailTemplateFilters): Promise<MailTemplateRow[]> {
        return db.query<MailTemplateRow>(
            MailTemplateSQL.list({ search: filters.search !== undefined, status: filters.status !== undefined }),
            [
                ...(filters.search !== undefined ? [likeAnywhere(filters.search), likeAnywhere(filters.search)] : []),
                ...(filters.status !== undefined ? [filters.status] : []),
            ],
        );
    }

    async updateBody(db: DbExecutor, id: number, bodyHtml: string, actorId: number | null): Promise<void> {
        await db.execute(MailTemplateSQL.updateBody, [bodyHtml, actorId, id]);
    }
}
