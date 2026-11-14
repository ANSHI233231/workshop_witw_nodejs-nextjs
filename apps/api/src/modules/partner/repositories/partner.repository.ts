import { type PaginationQuery, toOffset } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { IPartnerRepository } from '../contracts/partner-repository.contract';
import type { BusinessDetails } from '../dto/partner.dto';
import { PartnerSQL } from '../sql/partner.sql';
import type { DemoPartnerRow, PartnerListScope } from '../types/partner-repository.types';
import {
    type CountRow,
    PartnerParkStatus,
    type PartnerParkRow,
    type PartnerRow,
    PartnerStatus,
    type PartnerStatusCode,
    SHOWN_PACKAGE_WEBSITE_STATUS,
} from '../types/partner.types';

const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

const shapeOf = (scope: PartnerListScope) => ({ statusCount: scope.statuses.length, search: scope.search !== undefined });

const whereValues = (scope: PartnerListScope): unknown[] => [
    ...scope.statuses,
    ...(scope.search !== undefined ? [likeAnywhere(scope.search), likeAnywhere(scope.search)] : []),
];

const LIVE_COUNT_VALUES: readonly unknown[] = [PartnerStatus.ACTIVE, SHOWN_PACKAGE_WEBSITE_STATUS];

const detailValues = (details: BusinessDetails): unknown[] => [
    details.businessName,
    details.ownerName,
    details.businessPhone,
    details.businessEmail,
    details.about,
];

export class PartnerRepository implements IPartnerRepository {
    async list(db: DbExecutor, scope: PartnerListScope, pagination: PaginationQuery): Promise<PartnerRow[]> {
        return db.query<PartnerRow>(PartnerSQL.list(shapeOf(scope), scope.order), [
            ...LIVE_COUNT_VALUES,
            ...whereValues(scope),
            ...(scope.order === 'requests' ? [PartnerStatus.PENDING] : []),
            pagination.limit,
            toOffset(pagination),
        ]);
    }

    async count(db: DbExecutor, scope: PartnerListScope): Promise<number> {
        const rows = await db.query<CountRow>(PartnerSQL.count(shapeOf(scope)), whereValues(scope));
        return Number(rows[0]?.total ?? 0);
    }

    async findById(db: DbExecutor, id: number): Promise<PartnerRow | undefined> {
        return (await db.query<PartnerRow>(PartnerSQL.findById, [...LIVE_COUNT_VALUES, id]))[0];
    }

    async findByUserId(db: DbExecutor, userId: number): Promise<PartnerRow | undefined> {
        return (await db.query<PartnerRow>(PartnerSQL.findByUserId, [...LIVE_COUNT_VALUES, userId]))[0];
    }

    async findByUserIds(db: DbExecutor, userIds: readonly number[]): Promise<PartnerRow[]> {
        if (userIds.length === 0) return [];
        return db.query<PartnerRow>(PartnerSQL.findByUserIds(userIds.length), [...LIVE_COUNT_VALUES, ...userIds]);
    }

    async parksOf(db: DbExecutor, partnerIds: readonly number[]): Promise<PartnerParkRow[]> {
        if (partnerIds.length === 0) return [];
        return db.query<PartnerParkRow>(PartnerSQL.parksOf(partnerIds.length), [
            ...partnerIds,
            PartnerParkStatus.ACTIVE,
        ]);
    }

    async insert(db: DbExecutor, userId: number, details: BusinessDetails, actorId: number): Promise<number> {
        const result = await db.execute(PartnerSQL.insert, [
            userId,
            ...detailValues(details),
            PartnerStatus.PENDING,
            actorId,
            actorId,
        ]);
        return result.insertId;
    }

    async insertDecided(db: DbExecutor, row: DemoPartnerRow): Promise<number> {
        const result = await db.execute(PartnerSQL.insertDecided, [
            row.userId,
            row.businessName,
            row.ownerName,
            row.businessPhone,
            row.businessEmail,
            row.about,
            row.isPhoneShown ? 1 : 0,
            row.status,
            row.rejectReason,
            row.requestedAt,
            row.decidedAt,
            row.decidedBy,
            row.approvedAt,
            row.userId,
            row.decidedBy ?? row.userId,
        ]);
        return result.insertId;
    }

    async sendAgain(db: DbExecutor, id: number, details: BusinessDetails, actorId: number): Promise<boolean> {
        const result = await db.execute(PartnerSQL.sendAgain, [
            ...detailValues(details),
            PartnerStatus.PENDING,
            actorId,
            id,
            PartnerStatus.REJECTED,
        ]);
        return result.affectedRows > 0;
    }

    async updateDetails(db: DbExecutor, id: number, details: BusinessDetails, actorId: number): Promise<void> {
        await db.execute(PartnerSQL.updateDetails, [...detailValues(details), actorId, id]);
    }

    async approve(db: DbExecutor, id: number, actorId: number): Promise<boolean> {
        const result = await db.execute(PartnerSQL.approve, [
            PartnerStatus.ACTIVE,
            actorId,
            actorId,
            id,
            PartnerStatus.PENDING,
        ]);
        return result.affectedRows > 0;
    }

    async reject(db: DbExecutor, id: number, reason: string, actorId: number): Promise<boolean> {
        const result = await db.execute(PartnerSQL.reject, [
            PartnerStatus.REJECTED,
            reason,
            actorId,
            actorId,
            id,
            PartnerStatus.PENDING,
        ]);
        return result.affectedRows > 0;
    }

    async updateStatus(
        db: DbExecutor,
        id: number,
        from: PartnerStatusCode,
        to: PartnerStatusCode,
        actorId: number,
    ): Promise<boolean> {
        const result = await db.execute(PartnerSQL.updateStatus, [to, actorId, id, from]);
        return result.affectedRows > 0;
    }

    async updatePhoneShown(db: DbExecutor, id: number, isPhoneShown: boolean, actorId: number): Promise<void> {
        await db.execute(PartnerSQL.updatePhoneShown, [isPhoneShown ? 1 : 0, actorId, id]);
    }

    async updateLogo(db: DbExecutor, id: number, logo: string | null, actorId: number): Promise<void> {
        await db.execute(PartnerSQL.updateLogo, [logo, actorId, id]);
    }

    async setParks(db: DbExecutor, id: number, masterParkIds: readonly number[], actorId: number | null): Promise<void> {
        for (const masterParkId of masterParkIds) {
            await db.execute(PartnerSQL.upsertPark, [id, masterParkId, PartnerParkStatus.ACTIVE, actorId, actorId]);
        }
        await db.execute(PartnerSQL.removeParksExcept(masterParkIds.length), [
            PartnerParkStatus.REMOVED,
            actorId,
            id,
            PartnerParkStatus.ACTIVE,
            ...masterParkIds,
        ]);
    }

    async deletePartners(db: DbExecutor, ids: readonly number[]): Promise<number> {
        if (ids.length === 0) return 0;
        await db.execute(PartnerSQL.deleteParksOfPartners(ids.length), ids);
        return (await db.execute(PartnerSQL.deletePartners(ids.length), ids)).affectedRows;
    }
}
