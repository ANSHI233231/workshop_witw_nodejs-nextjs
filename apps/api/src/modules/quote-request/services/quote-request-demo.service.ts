import { ClientApp } from '../../../core/context';
import { ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import { type INotificationSeedService, NotificationKind, type SeedNotification } from '../../notification';
import type { IQuoteRequestDemoService } from '../contracts/quote-request-demo-service.contract';
import type { IQuoteRequestRepository } from '../contracts/quote-request-repository.contract';
import type {
    DemoPartnerNote,
    DemoQuoteOutcome,
    DemoQuoteRequest,
    DemoQuoteResult,
} from '../dto/quote-request-demo.dto';
import type { DemoVersionRow } from '../types/quote-request.types';

type Placed = { readonly quote: DemoQuoteRequest; readonly id: number; readonly version: DemoVersionRow };

export class QuoteRequestDemoService implements IQuoteRequestDemoService {
    constructor(
        private readonly db: Database,
        private readonly repository: IQuoteRequestRepository,
        private readonly auditService: IAuditService,
        private readonly notificationSeedService: INotificationSeedService,
        private readonly isProduction: boolean,
    ) {}

    async add(quotes: readonly DemoQuoteRequest[], notes: readonly DemoPartnerNote[]): Promise<DemoQuoteResult> {
        this.refuseInProduction();
        const event = { action: AuditAction.QUOTE_REQUEST_DEMO_ADDED, entityType: AuditEntity.QUOTE_REQUEST } as const;
        try {
            const versions = await this.repository.demoVersions(
                this.db,
                quotes.map((quote) => quote.packageSlug),
            );
            const result = await this.db.transaction(async () => {
                const outcomes: DemoQuoteOutcome[] = [];
                const placed: Placed[] = [];
                for (const quote of quotes) {
                    const outcome = await this.addQuote(quote, versions, placed);
                    outcomes.push(outcome);
                }
                const created = outcomes.filter((outcome) => outcome.created);
                if (created.length > 0) {
                    await this.auditService.record({
                        ...event,
                        details: { created: created.map((outcome) => ({ id: outcome.quoteRequestId, key: outcome.key })) },
                    });
                }
                return { outcomes, placed };
            });
            const written = await this.notificationSeedService.seed(this.notesOf(notes, result.placed));
            return { quotes: result.outcomes, notes: written };
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.QUOTE_REQUEST_DEMO_ADD_FAILED }, error);
            throw error;
        }
    }

    async remove(partnerIds: readonly number[], userIds: readonly number[], write: boolean): Promise<number> {
        this.refuseInProduction();
        const ids = await this.repository.demoIdsOf(this.db, partnerIds, userIds);
        if (!write || ids.length === 0) return ids.length;
        const event = { action: AuditAction.QUOTE_REQUEST_DEMO_REMOVED, entityType: AuditEntity.QUOTE_REQUEST } as const;
        try {
            await this.notificationSeedService.remove({ userIds: [], entityType: AuditEntity.QUOTE_REQUEST, entityIds: ids });
            return await this.db.transaction(async () => {
                const removed = await this.repository.demoDelete(this.db, ids);
                await this.auditService.record({ ...event, details: { removed: ids } });
                return removed;
            });
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.QUOTE_REQUEST_DEMO_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private async addQuote(
        quote: DemoQuoteRequest,
        versions: readonly DemoVersionRow[],
        placed: Placed[],
    ): Promise<DemoQuoteOutcome> {
        const version = versions.find(
            (row) => row.slug === quote.packageSlug && row.version_number === quote.versionNumber,
        );
        if (!version) {
            return { key: quote.key, quoteRequestId: null, created: false, skipped: 'package version not found' };
        }
        const existing = await this.repository.demoExisting(this.db, quote.sender.userId, version.package_id, quote.sentAt);
        if (existing !== null) {
            placed.push({ quote, id: existing, version });
            return { key: quote.key, quoteRequestId: existing, created: false, skipped: null };
        }
        const id = await this.repository.demoInsert(this.db, {
            userId: quote.sender.userId,
            partnerId: version.partner_id,
            packageId: version.package_id,
            packageVersionId: version.package_version_id,
            travellerCount: quote.travellerCount,
            startDate: quote.startDate,
            notes: quote.notes,
            userName: quote.sender.name,
            userEmail: quote.sender.email,
            userMobile: quote.sender.mobile,
            mark: quote.mark,
            status: quote.status,
            createdAt: quote.sentAt,
        });
        placed.push({ quote, id, version });
        return { key: quote.key, quoteRequestId: id, created: true, skipped: null };
    }

    private notesOf(notes: readonly DemoPartnerNote[], placed: readonly Placed[]): SeedNotification[] {
        return notes.flatMap((note): SeedNotification[] => {
            const target = placed.find((candidate) => candidate.quote.key === note.quoteKey);
            if (!target) return [];
            const base = {
                userId: target.version.partner_user_id,
                entityType: AuditEntity.QUOTE_REQUEST,
                entityId: target.id,
                clientApp: ClientApp.PARTNER,
                ownerType: null,
                ownerId: null,
                createdAt: note.at,
                readAt: note.isRead ? note.at : null,
            };
            if (note.kind === 'received') {
                return [
                    {
                        ...base,
                        notificationKind: NotificationKind.QUOTE_REQUEST_RECEIVED,
                        title: target.version.name,
                        excerpt: null,
                        actorId: target.quote.sender.userId,
                    },
                ];
            }
            return [
                {
                    ...base,
                    notificationKind: NotificationKind.QUOTE_REQUEST_ADMIN_MESSAGE,
                    title: target.quote.sender.name,
                    excerpt: note.message,
                    actorId: note.adminId,
                },
            ];
        });
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Demo data is never written in production.', 'DEMO_NOT_ALLOWED');
        }
    }
}
