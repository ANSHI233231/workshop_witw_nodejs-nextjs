import { ConflictException } from '../../../core/exceptions';
import type { PaginationQuery } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import { AuditAction } from '../../audit';
import { type IUsersService, MetaRole } from '../../users';
import type { IPartnerConsoleService } from '../contracts/partner-console-service.contract';
import type { IPartnerRepository } from '../contracts/partner-repository.contract';
import type { BusinessDetails, PartnerDto, PartnerFilters, PartnerLogo, PartnerPage } from '../dto/partner.dto';
import {
    PARTNER_STATUSES,
    PartnerStatus,
    type PartnerStatusCode,
    type PartnerRow,
    REQUEST_STATUSES,
} from '../types/partner.types';
import type { PartnerListScope } from '../types/partner-repository.types';
import { PARTNER_MESSAGES } from '../validators/partner.validators';
import { type AuditPair, changesBetween, partnerNotFound, type PartnerRecords } from './partner-records';

const ALL_STATUSES: readonly PartnerStatusCode[] = [...REQUEST_STATUSES, ...PARTNER_STATUSES];

const notPending = (): ConflictException => new ConflictException(PARTNER_MESSAGES.NOT_PENDING, 'PARTNER_REQUEST_NOT_PENDING');

const STATUS_ACTIONS: Readonly<Record<number, AuditPair>> = {
    [PartnerStatus.ACTIVE]: { done: AuditAction.PARTNER_ACTIVATED, failed: AuditAction.PARTNER_ACTIVATE_FAILED },
    [PartnerStatus.INACTIVE]: { done: AuditAction.PARTNER_DEACTIVATED, failed: AuditAction.PARTNER_DEACTIVATE_FAILED },
};

const PHONE_ACTIONS = {
    shown: { done: AuditAction.PARTNER_PHONES_SHOWN, failed: AuditAction.PARTNER_PHONES_SHOW_FAILED },
    hidden: { done: AuditAction.PARTNER_PHONES_HIDDEN, failed: AuditAction.PARTNER_PHONES_HIDE_FAILED },
} as const;

const LOGO_ACTIONS = { done: AuditAction.PARTNER_LOGO_CHANGED, failed: AuditAction.PARTNER_LOGO_CHANGE_FAILED };

const OTHER_STATUS: Readonly<Record<number, PartnerStatusCode>> = {
    [PartnerStatus.ACTIVE]: PartnerStatus.INACTIVE,
    [PartnerStatus.INACTIVE]: PartnerStatus.ACTIVE,
};

const detailsOf = (partner: PartnerDto): Record<string, unknown> => ({
    businessName: partner.businessName,
    ownerName: partner.ownerName,
    businessPhone: partner.businessPhone,
    businessEmail: partner.businessEmail,
    about: partner.about,
    masterParkIds: partner.parks.map((park) => park.id),
});

export class PartnerConsoleService implements IPartnerConsoleService {
    constructor(
        private readonly db: Database,
        private readonly repository: IPartnerRepository,
        private readonly records: PartnerRecords,
        private readonly usersService: IUsersService,
    ) {}

    listRequests(filters: PartnerFilters, pagination: PaginationQuery): Promise<PartnerPage> {
        return this.page({ statuses: this.statusesOf(REQUEST_STATUSES, filters), search: filters.search, order: 'requests' }, pagination);
    }

    listPartners(filters: PartnerFilters, pagination: PaginationQuery): Promise<PartnerPage> {
        return this.page({ statuses: this.statusesOf(PARTNER_STATUSES, filters), search: filters.search, order: 'partners' }, pagination);
    }

    async requestDetail(id: number): Promise<PartnerDto> {
        return this.records.detail(await this.rowIn(id, REQUEST_STATUSES));
    }

    async partnerDetail(id: number): Promise<PartnerDto> {
        return this.records.detail(await this.rowIn(id, PARTNER_STATUSES));
    }

    async approve(id: number, actorId: number): Promise<PartnerDto> {
        const actions = { done: AuditAction.PARTNER_REQUEST_APPROVED, failed: AuditAction.PARTNER_REQUEST_APPROVE_FAILED };
        return this.records.audited(actions, id, {}, async () => {
            const before = await this.rowIn(id, ALL_STATUSES);
            if (before.status !== PartnerStatus.PENDING || !(await this.repository.approve(this.db, id, actorId))) {
                throw notPending();
            }
            await this.usersService.grantRole(before.user_id, MetaRole.PARTNER, actorId);
            return {
                result: await this.records.byId(id),
                id,
                changes: { status: { from: before.status, to: PartnerStatus.ACTIVE } },
            };
        });
    }

    async reject(id: number, reason: string, actorId: number): Promise<PartnerDto> {
        const actions = { done: AuditAction.PARTNER_REQUEST_REJECTED, failed: AuditAction.PARTNER_REQUEST_REJECT_FAILED };
        return this.records.audited(actions, id, { reason }, async () => {
            const before = await this.rowIn(id, ALL_STATUSES);
            if (before.status !== PartnerStatus.PENDING || !(await this.repository.reject(this.db, id, reason, actorId))) {
                throw notPending();
            }
            return {
                result: await this.records.byId(id),
                id,
                changes: {
                    status: { from: before.status, to: PartnerStatus.REJECTED },
                    rejectReason: { from: before.reject_reason, to: reason },
                },
            };
        });
    }

    async edit(id: number, details: BusinessDetails, actorId: number): Promise<PartnerDto> {
        const actions = { done: AuditAction.PARTNER_EDITED, failed: AuditAction.PARTNER_EDIT_FAILED };
        return this.records.audited(actions, id, { ...details }, async () => {
            const before = await this.records.detail(await this.rowIn(id, PARTNER_STATUSES));
            await this.records.checkParks(
                details.masterParkIds,
                before.parks.map((park) => park.id),
            );
            await this.repository.updateDetails(this.db, id, details, actorId);
            await this.repository.setParks(this.db, id, details.masterParkIds, actorId);
            const after = await this.records.byId(id);
            return { result: after, id, changes: changesBetween(detailsOf(before), detailsOf(after)) };
        });
    }

    async logo(id: number): Promise<PartnerLogo> {
        const row = await this.repository.findById(this.db, id);
        if (!row) throw partnerNotFound();
        return this.records.readLogo(row);
    }

    async setLogo(id: number, content: Buffer, actorId: number): Promise<PartnerDto> {
        const row = await this.rowIn(id, PARTNER_STATUSES);
        const fileName = await this.records.storeLogo(id, content);
        try {
            return await this.changeLogo(row, fileName, actorId);
        } catch (error) {
            await this.records.discardLogo(id, fileName);
            throw error;
        }
    }

    async removeLogo(id: number, actorId: number): Promise<PartnerDto> {
        return this.changeLogo(await this.rowIn(id, PARTNER_STATUSES), null, actorId);
    }

    async setPhoneShown(id: number, isPhoneShown: boolean, actorId: number): Promise<PartnerDto> {
        const actions = isPhoneShown ? PHONE_ACTIONS.shown : PHONE_ACTIONS.hidden;
        return this.records.audited(actions, id, { isPhoneShown }, async () => {
            const before = await this.rowIn(id, PARTNER_STATUSES);
            await this.repository.updatePhoneShown(this.db, id, isPhoneShown, actorId);
            return {
                result: await this.records.byId(id),
                id,
                changes: changesBetween({ isPhoneShown: before.is_phone_shown === 1 }, { isPhoneShown }),
            };
        });
    }

    async setStatus(id: number, status: PartnerStatusCode, actorId: number): Promise<PartnerDto> {
        const actions = STATUS_ACTIONS[status];
        if (!actions) throw new ConflictException(PARTNER_MESSAGES.STATUS_UNCHANGED, 'PARTNER_STATUS_UNCHANGED');
        return this.records.audited(actions, id, { status }, async () => {
            const before = await this.rowIn(id, PARTNER_STATUSES);
            const changed =
                OTHER_STATUS[before.status] === status &&
                (await this.repository.updateStatus(this.db, id, before.status, status, actorId));
            if (!changed) throw new ConflictException(PARTNER_MESSAGES.STATUS_UNCHANGED, 'PARTNER_STATUS_UNCHANGED');
            return { result: await this.records.byId(id), id, changes: { status: { from: before.status, to: status } } };
        });
    }

    private async changeLogo(row: PartnerRow, logo: string | null, actorId: number): Promise<PartnerDto> {
        return this.records.audited(LOGO_ACTIONS, row.id, { logo }, async () => {
            await this.repository.updateLogo(this.db, row.id, logo, actorId);
            return { result: await this.records.byId(row.id), id: row.id, changes: { logo: { from: row.logo, to: logo } } };
        });
    }

    private async page(scope: PartnerListScope, pagination: PaginationQuery): Promise<PartnerPage> {
        const [rows, total] = await Promise.all([
            this.repository.list(this.db, scope, pagination),
            this.repository.count(this.db, scope),
        ]);
        return { items: await this.records.withParks(rows), total };
    }

    private statusesOf(allowed: readonly PartnerStatusCode[], filters: PartnerFilters): readonly PartnerStatusCode[] {
        return filters.status !== undefined && allowed.includes(filters.status) ? [filters.status] : allowed;
    }

    private async rowIn(id: number, statuses: readonly PartnerStatusCode[]): Promise<PartnerRow> {
        const row = await this.repository.findById(this.db, id);
        if (!row || !statuses.includes(row.status)) throw partnerNotFound();
        return row;
    }
}
