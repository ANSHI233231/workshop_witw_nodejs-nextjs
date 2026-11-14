import { ConflictException, NotFoundException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { type AuditActionCode, AuditEntity, type IAuditService } from '../../audit';
import type { IQuoteRequestRepository } from '../contracts/quote-request-repository.contract';
import type { QuoteRequestRow } from '../types/quote-request.types';
import { QUOTE_MESSAGES } from '../validators/quote-request.validators';

export type Done<T> = {
    readonly result: T;
    readonly id: number;
    readonly changes: Readonly<Record<string, unknown>>;
};

export type AuditPair = { readonly done: AuditActionCode; readonly failed: AuditActionCode };

export const quoteNotFound = (): NotFoundException =>
    new NotFoundException(QUOTE_MESSAGES.NOT_FOUND, 'QUOTE_REQUEST_NOT_FOUND');

export const quoteNotActive = (): ConflictException =>
    new ConflictException(QUOTE_MESSAGES.NOT_ACTIVE, 'QUOTE_REQUEST_NOT_ACTIVE');

export class QuoteRequestRecords {
    constructor(
        readonly db: Database,
        readonly repository: IQuoteRequestRepository,
        private readonly auditService: IAuditService,
    ) {}

    async row(id: number): Promise<QuoteRequestRow> {
        const row = await this.repository.findById(this.db, id);
        if (!row) throw quoteNotFound();
        return row;
    }

    async audited<T>(
        actions: AuditPair,
        id: number | undefined,
        input: Readonly<Record<string, unknown>>,
        work: () => Promise<Done<T>>,
    ): Promise<T> {
        try {
            return await this.db.transaction(async () => {
                const done = await work();
                await this.auditService.record({
                    action: actions.done,
                    entityType: AuditEntity.QUOTE_REQUEST,
                    entityId: done.id,
                    changes: done.changes,
                });
                return done.result;
            });
        } catch (error) {
            await this.auditService.recordFailure(
                { action: actions.failed, entityType: AuditEntity.QUOTE_REQUEST, entityId: id, details: { input } },
                error,
            );
            throw error;
        }
    }
}
