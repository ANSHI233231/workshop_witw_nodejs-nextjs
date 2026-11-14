import type { PaginationQuery } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { BusinessDetails } from '../dto/partner.dto';
import type { DemoPartnerRow, PartnerListScope } from '../types/partner-repository.types';
import type { PartnerParkRow, PartnerRow, PartnerStatusCode } from '../types/partner.types';

export interface IPartnerRepository {
    list(db: DbExecutor, scope: PartnerListScope, pagination: PaginationQuery): Promise<PartnerRow[]>;
    count(db: DbExecutor, scope: PartnerListScope): Promise<number>;
    findById(db: DbExecutor, id: number): Promise<PartnerRow | undefined>;
    findByUserId(db: DbExecutor, userId: number): Promise<PartnerRow | undefined>;
    findByUserIds(db: DbExecutor, userIds: readonly number[]): Promise<PartnerRow[]>;
    parksOf(db: DbExecutor, partnerIds: readonly number[]): Promise<PartnerParkRow[]>;
    insert(db: DbExecutor, userId: number, details: BusinessDetails, actorId: number): Promise<number>;
    insertDecided(db: DbExecutor, row: DemoPartnerRow): Promise<number>;
    sendAgain(db: DbExecutor, id: number, details: BusinessDetails, actorId: number): Promise<boolean>;
    updateDetails(db: DbExecutor, id: number, details: BusinessDetails, actorId: number): Promise<void>;
    approve(db: DbExecutor, id: number, actorId: number): Promise<boolean>;
    reject(db: DbExecutor, id: number, reason: string, actorId: number): Promise<boolean>;
    updateStatus(
        db: DbExecutor,
        id: number,
        from: PartnerStatusCode,
        to: PartnerStatusCode,
        actorId: number,
    ): Promise<boolean>;
    updatePhoneShown(db: DbExecutor, id: number, isPhoneShown: boolean, actorId: number): Promise<void>;
    updateLogo(db: DbExecutor, id: number, logo: string | null, actorId: number): Promise<void>;
    setParks(db: DbExecutor, id: number, masterParkIds: readonly number[], actorId: number | null): Promise<void>;
    deletePartners(db: DbExecutor, ids: readonly number[]): Promise<number>;
}
