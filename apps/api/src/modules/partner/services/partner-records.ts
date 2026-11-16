import { randomBytes } from 'node:crypto';

import { NotFoundException, ValidationException } from '../../../core/exceptions';
import { detectImageType, imageContentTypeOf } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import { type IFileStorage, StoredFileNotFoundError } from '../../../infrastructure/storage';
import { type AuditActionCode, AuditEntity, type IAuditService } from '../../audit';
import { type IParkService, ParkStatus } from '../../park';
import type { IPartnerRepository } from '../contracts/partner-repository.contract';
import type { PartnerDto, PartnerLogo } from '../dto/partner.dto';
import { parksByPartner, toPartner } from '../mappers/partner.mapper';
import { LOGO_CONTENT_TYPES, LOGO_FOLDER, type PartnerRow } from '../types/partner.types';
import { PARTNER_MESSAGES } from '../validators/partner.validators';

const RANDOM_BYTES = 8;

const PARKS_FIELD = 'masterParkIds';

export const fieldError = (field: string, message: string, code: string): ValidationException =>
    new ValidationException(message, [{ field, message }], code);

export const partnerNotFound = (): NotFoundException =>
    new NotFoundException(PARTNER_MESSAGES.NOT_FOUND, 'PARTNER_NOT_FOUND');

const logoNotFound = (): NotFoundException =>
    new NotFoundException('This partner has no logo.', 'PARTNER_LOGO_NOT_FOUND');

export const logoPath = (partnerId: number, fileName: string): string =>
    `${LOGO_FOLDER.PARENT}/${partnerId}/${LOGO_FOLDER.FEATURE}/${fileName}`;

const newFileName = (extension: string): string =>
    `${Date.now()}${randomBytes(RANDOM_BYTES).toString('hex')}.${extension}`;

export type Done<T> = {
    readonly result: T;
    readonly id: number;
    readonly changes: Readonly<Record<string, unknown>>;
};

export type AuditPair = { readonly done: AuditActionCode; readonly failed: AuditActionCode };

export const changesBetween = (
    before: Readonly<Record<string, unknown>>,
    after: Readonly<Record<string, unknown>>,
): Record<string, unknown> => {
    const changes: Record<string, unknown> = {};
    for (const [field, value] of Object.entries(after)) {
        if (JSON.stringify(before[field]) !== JSON.stringify(value)) changes[field] = { from: before[field], to: value };
    }
    return changes;
};

export class PartnerRecords {
    constructor(
        private readonly db: Database,
        private readonly repository: IPartnerRepository,
        private readonly parkService: IParkService,
        private readonly auditService: IAuditService,
        private readonly fileStorage: IFileStorage,
    ) {}

    async withParks(rows: readonly PartnerRow[]): Promise<PartnerDto[]> {
        const parks = parksByPartner(
            await this.repository.parksOf(
                this.db,
                rows.map((row) => row.id),
            ),
        );
        return rows.map((row) => toPartner(row, parks.get(row.id) ?? []));
    }

    async detail(row: PartnerRow): Promise<PartnerDto> {
        const [partner] = await this.withParks([row]);
        if (!partner) throw partnerNotFound();
        return partner;
    }

    async byId(id: number): Promise<PartnerDto> {
        const row = await this.repository.findById(this.db, id);
        if (!row) throw partnerNotFound();
        return this.detail(row);
    }

    async checkParks(masterParkIds: readonly number[], alreadyLinked: readonly number[]): Promise<void> {
        if (masterParkIds.length === 0) {
            throw fieldError(PARKS_FIELD, PARTNER_MESSAGES.PARKS_EMPTY, 'PARTNER_PARKS_REQUIRED');
        }
        const states = await Promise.all(masterParkIds.map((id) => this.parkService.findById(id)));
        const unusable = states.some(
            (park, index) =>
                !park || (park.status !== ParkStatus.ACTIVE && !alreadyLinked.includes(masterParkIds[index] ?? 0)),
        );
        if (unusable) {
            throw fieldError(PARKS_FIELD, PARTNER_MESSAGES.PARK_NOT_AVAILABLE, 'PARTNER_PARK_NOT_AVAILABLE');
        }
        if (!states.some((park) => park?.status === ParkStatus.ACTIVE)) {
            throw fieldError(PARKS_FIELD, PARTNER_MESSAGES.PARKS_EMPTY, 'PARTNER_PARKS_REQUIRED');
        }
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
                    entityType: AuditEntity.PARTNER,
                    entityId: done.id,
                    changes: done.changes,
                });
                return done.result;
            });
        } catch (error) {
            await this.auditService.recordFailure(
                { action: actions.failed, entityType: AuditEntity.PARTNER, entityId: id, details: { input } },
                error,
            );
            throw error;
        }
    }

    async storeLogo(partnerId: number, content: Buffer): Promise<string> {
        const type = detectImageType(content);
        if (!type || !LOGO_CONTENT_TYPES.includes(type.contentType)) {
            throw fieldError('logo', PARTNER_MESSAGES.LOGO_TYPE, 'PARTNER_LOGO_TYPE');
        }
        const fileName = newFileName(type.extension);
        await this.fileStorage.save(logoPath(partnerId, fileName), content);
        return fileName;
    }

    async discardLogo(partnerId: number, fileName: string): Promise<void> {
        await this.fileStorage.remove(logoPath(partnerId, fileName)).catch(() => undefined);
    }

    async discardReplacedLogo(row: PartnerRow, logo: string | null): Promise<void> {
        if (row.logo && row.logo !== logo) await this.discardLogo(row.id, row.logo);
    }

    async readLogo(row: PartnerRow): Promise<PartnerLogo> {
        if (!row.logo) throw logoNotFound();
        try {
            const content = await this.fileStorage.read(logoPath(row.id, row.logo));
            return { content, contentType: imageContentTypeOf(row.logo) ?? 'application/octet-stream' };
        } catch (error) {
            if (error instanceof StoredFileNotFoundError) throw logoNotFound();
            throw error;
        }
    }
}
