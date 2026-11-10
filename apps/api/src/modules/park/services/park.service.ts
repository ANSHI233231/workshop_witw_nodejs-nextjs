import { ConflictException, NotFoundException } from '../../../core/exceptions';
import { freeSlug, type PaginationQuery, slugOf } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import { AuditAction, type AuditActionCode, AuditEntity, type IAuditService } from '../../audit';
import type { IParkRepository } from '../contracts/park-repository.contract';
import type { IParkService } from '../contracts/park-service.contract';
import type {
    ParkDetailDto,
    ParkDto,
    ParkFilters,
    ParkInput,
    ParkOptionDto,
    ParkPage,
    ParkStateDto,
    ParkUpdate,
} from '../dto/park.dto';
import { toPark, toParkDetail, toParkOption, toParkState } from '../mappers/park.mapper';
import { PARK_LIMITS, PARK_SLUG_FALLBACK, PARK_TIME_ZONE, type ParkStatusCode } from '../types/park.types';
import { PARK_MESSAGES } from '../validators/park.validators';

const notFound = (): NotFoundException => new NotFoundException(PARK_MESSAGES.NOT_FOUND, 'PARK_NOT_FOUND');

const nameTaken = (): ConflictException => new ConflictException(PARK_MESSAGES.NAME_TAKEN, 'PARK_NAME_TAKEN');

const TODAY_FORMAT = new Intl.DateTimeFormat('en-CA', {
    timeZone: PARK_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

const todayInIndia = (): string => TODAY_FORMAT.format(new Date());

const EDITABLE_FIELDS = ['name', 'region', 'avgSafariPriceMin', 'avgSafariPriceMax', 'status'] as const;

const changesOf = (before: ParkDto, after: ParkUpdate): Record<string, unknown> => {
    const changes: Record<string, unknown> = {};
    for (const field of EDITABLE_FIELDS) {
        if (before[field] !== after[field]) changes[field] = { from: before[field], to: after[field] };
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
        return { items: rows.map(toPark), total };
    }

    async detail(id: number): Promise<ParkDetailDto> {
        const today = todayInIndia();
        const row = await this.repository.findById(this.db, id, today);
        if (!row) throw notFound();
        return toParkDetail(row, await this.repository.upcomingSafaris(this.db, id, today));
    }

    async create(input: ParkInput, actorId: number): Promise<ParkDto> {
        return this.audited(AuditAction.PARK_ADDED, AuditAction.PARK_ADD_FAILED, undefined, input, async () => {
            await this.refuseNameTaken(input.name, 0);
            const slug = await freeSlug(slugOf(input.name, PARK_LIMITS.SLUG_MAX, PARK_SLUG_FALLBACK), (candidate) =>
                this.repository.slugTaken(this.db, candidate),
            );
            const id = await this.repository.insert(this.db, input, slug, actorId);
            const created = await this.current(id);
            return {
                result: created,
                id,
                changes: {
                    name: { from: null, to: created.name },
                    slug: { from: null, to: created.slug },
                    region: { from: null, to: created.region },
                    avgSafariPriceMin: { from: null, to: created.avgSafariPriceMin },
                    avgSafariPriceMax: { from: null, to: created.avgSafariPriceMax },
                    status: { from: null, to: created.status },
                },
            };
        });
    }

    async update(id: number, input: ParkUpdate, actorId: number): Promise<ParkDto> {
        return this.audited(AuditAction.PARK_UPDATED, AuditAction.PARK_UPDATE_FAILED, id, input, async () => {
            const before = await this.current(id);
            await this.refuseNameTaken(input.name, id);
            await this.repository.update(this.db, id, input, actorId);
            return { result: await this.current(id), id, changes: changesOf(before, input) };
        });
    }

    async setStatus(id: number, status: ParkStatusCode, actorId: number): Promise<ParkDto> {
        return this.audited(
            AuditAction.PARK_STATUS_CHANGED,
            AuditAction.PARK_STATUS_CHANGE_FAILED,
            id,
            { status },
            async () => {
                const before = await this.current(id);
                await this.repository.updateStatus(this.db, id, status, actorId);
                return {
                    result: await this.current(id),
                    id,
                    changes: before.status === status ? {} : { status: { from: before.status, to: status } },
                };
            },
        );
    }

    private async current(id: number): Promise<ParkDto> {
        const row = await this.repository.findById(this.db, id, todayInIndia());
        if (!row) throw notFound();
        return toPark(row);
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
