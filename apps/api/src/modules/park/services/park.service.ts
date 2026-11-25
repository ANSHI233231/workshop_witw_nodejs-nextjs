import { ConflictException, NotFoundException } from '../../../core/exceptions';
import { freeSlug, type PaginationQuery, slugOf } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import { AuditAction, type AuditActionCode, AuditEntity, type IAuditService } from '../../audit';
import type { IParkRepository } from '../contracts/park-repository.contract';
import type { IParkService } from '../contracts/park-service.contract';
import type {
    ParkDetailDto,
    ParkDto,
    ParkFeatureImage,
    ParkFilters,
    ParkInput,
    ParkOptionDto,
    ParkPage,
    ParkStateDto,
    ParkUpdate,
    WebsiteParkCardDto,
} from '../dto/park.dto';
import {
    editableFieldsOf,
    toPark,
    toParkDetail,
    toParkOption,
    toParkState,
    toWebsiteParkCard,
} from '../mappers/park.mapper';
import {
    PARK_LIMITS,
    PARK_SLUG_FALLBACK,
    PARK_TIME_ZONE,
    type ParkDetailRow,
    type ParkStatusCode,
} from '../types/park.types';
import { PARK_MESSAGES } from '../validators/park.validators';
import type { ParkImages } from './park-images';
import { type ParkPrices, priceIn } from './park-prices';

const notFound = (): NotFoundException => new NotFoundException(PARK_MESSAGES.NOT_FOUND, 'PARK_NOT_FOUND');

const nameTaken = (): ConflictException => new ConflictException(PARK_MESSAGES.NAME_TAKEN, 'PARK_NAME_TAKEN');

const TODAY_FORMAT = new Intl.DateTimeFormat('en-CA', {
    timeZone: PARK_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

const todayInIndia = (): string => TODAY_FORMAT.format(new Date());

const changesBetween = (
    before: Readonly<Record<string, unknown>>,
    after: Readonly<Record<string, unknown>>,
): Record<string, unknown> => {
    const changes: Record<string, unknown> = {};
    for (const [field, value] of Object.entries(after)) {
        if (before[field] !== value) changes[field] = { from: before[field] ?? null, to: value };
    }
    return changes;
};

type Done = {
    readonly result: ParkDto;
    readonly id: number;
    readonly changes: Readonly<Record<string, unknown>>;
};

export class ParkService implements IParkService {
    constructor(
        private readonly db: Database,
        private readonly repository: IParkRepository,
        private readonly auditService: IAuditService,
        private readonly prices: ParkPrices,
        private readonly images: ParkImages,
    ) {}

    async listActive(): Promise<ParkOptionDto[]> {
        return (await this.repository.listActive(this.db)).map(toParkOption);
    }

    async findById(id: number): Promise<ParkStateDto | null> {
        const row = await this.repository.findState(this.db, id);
        return row ? toParkState(row) : null;
    }

    async list(filters: ParkFilters, pagination: PaginationQuery): Promise<ParkPage> {
        const [rows, total] = await Promise.all([
            this.repository.list(this.db, filters, pagination, todayInIndia()),
            this.repository.count(this.db, filters),
        ]);
        const prices = await this.prices.of(rows.map((row) => row.id));
        return { items: rows.map((row) => toPark(row, priceIn(prices, row.id))), total };
    }

    async detail(id: number): Promise<ParkDetailDto> {
        const today = todayInIndia();
        const row = await this.repository.findById(this.db, id, today);
        if (!row) throw notFound();
        const [price, upcoming] = await Promise.all([
            this.prices.ofOne(id),
            this.repository.upcomingSafaris(this.db, id, today),
        ]);
        return toParkDetail(row, price, upcoming);
    }

    async create(input: ParkInput, actorId: number): Promise<ParkDto> {
        return this.audited(AuditAction.PARK_ADDED, AuditAction.PARK_ADD_FAILED, undefined, input, async () => {
            await this.refuseNameTaken(input.name, 0);
            const slug = await freeSlug(slugOf(input.name, PARK_LIMITS.SLUG_MAX, PARK_SLUG_FALLBACK), (candidate) =>
                this.repository.slugTaken(this.db, candidate),
            );
            const id = await this.repository.insert(this.db, input, slug, actorId);
            const created = await this.row(id);
            return {
                result: await this.toDto(created),
                id,
                changes: changesBetween({}, { ...editableFieldsOf(created), slug: created.slug }),
            };
        });
    }

    async update(id: number, input: ParkUpdate, actorId: number): Promise<ParkDto> {
        return this.audited(AuditAction.PARK_UPDATED, AuditAction.PARK_UPDATE_FAILED, id, input, async () => {
            const before = await this.row(id);
            await this.refuseNameTaken(input.name, id);
            await this.repository.update(this.db, id, input, actorId);
            const after = await this.row(id);
            return {
                result: await this.toDto(after),
                id,
                changes: changesBetween(editableFieldsOf(before), editableFieldsOf(after)),
            };
        });
    }

    async setStatus(id: number, status: ParkStatusCode, actorId: number): Promise<ParkDto> {
        return this.audited(
            AuditAction.PARK_STATUS_CHANGED,
            AuditAction.PARK_STATUS_CHANGE_FAILED,
            id,
            { status },
            async () => {
                const before = await this.row(id);
                await this.repository.updateStatus(this.db, id, status, actorId);
                return {
                    result: await this.toDto(await this.row(id)),
                    id,
                    changes: before.status === status ? {} : { status: { from: before.status, to: status } },
                };
            },
        );
    }

    async setFeatureImage(id: number, content: Buffer, actorId: number): Promise<ParkDto> {
        const current = await this.repository.featureImageById(this.db, id);
        if (!current) throw notFound();
        const fileName = await this.images.store(id, content);
        try {
            const saved = await this.audited(
                AuditAction.PARK_UPDATED,
                AuditAction.PARK_UPDATE_FAILED,
                id,
                { featureImage: fileName },
                async () => {
                    await this.repository.updateFeatureImage(this.db, id, fileName, actorId);
                    return {
                        result: await this.toDto(await this.row(id)),
                        id,
                        changes: { featureImage: { from: current.feature_image, to: fileName } },
                    };
                },
            );
            if (current.feature_image && current.feature_image !== fileName) await this.images.discard(id, current.feature_image);
            return saved;
        } catch (error) {
            await this.images.discard(id, fileName);
            throw error;
        }
    }

    async featureImage(id: number): Promise<ParkFeatureImage> {
        const row = await this.repository.featureImageById(this.db, id);
        if (!row) throw notFound();
        return this.images.read(row.id, row.feature_image);
    }

    async websiteCardsOf(masterParkIds: readonly number[]): Promise<WebsiteParkCardDto[]> {
        const rows = await this.repository.websiteCardsByIds(this.db, [...new Set(masterParkIds)]);
        const prices = await this.prices.of(rows.map((row) => row.id));
        return rows.map((row) => toWebsiteParkCard(row, priceIn(prices, row.id)));
    }

    private async row(id: number): Promise<ParkDetailRow> {
        const row = await this.repository.findById(this.db, id, todayInIndia());
        if (!row) throw notFound();
        return row;
    }

    private async toDto(row: ParkDetailRow): Promise<ParkDto> {
        return toPark(row, await this.prices.ofOne(row.id));
    }

    private async refuseNameTaken(name: string, exceptId: number): Promise<void> {
        if (await this.repository.findOtherByName(this.db, name, exceptId)) throw nameTaken();
    }

    private async audited(
        action: AuditActionCode,
        failure: AuditActionCode,
        id: number | undefined,
        input: Readonly<Record<string, unknown>>,
        work: () => Promise<Done>,
    ): Promise<ParkDto> {
        try {
            return await this.db.transaction(async () => {
                const done = await work();
                await this.auditService.record({
                    action,
                    entityType: AuditEntity.PARK,
                    entityId: done.id,
                    changes: done.changes,
                    details: { name: done.result.name },
                });
                return done.result;
            });
        } catch (error) {
            await this.auditService.recordFailure(
                { action: failure, entityType: AuditEntity.PARK, entityId: id, details: { input } },
                error,
            );
            throw error;
        }
    }
}
