import { ConflictException, NotFoundException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction } from '../../audit';
import type { SignedInSession } from '../../auth';
import type { PartnerAccountDetails } from '../contracts/partner-account.contract';
import type { PartnerAccountSignUp } from '../contracts/partner-module.contract';
import type { IPartnerRepository } from '../contracts/partner-repository.contract';
import type { IPartnerRequestService } from '../contracts/partner-request-service.contract';
import type { BusinessDetails, MyPartnerRequestDto, PartnerLogo, SignedUpPartner } from '../dto/partner.dto';
import { toMyRequest } from '../mappers/partner.mapper';
import { PARTNER_STATUSES, PartnerStatus, type PartnerRow, REQUEST_STATUSES } from '../types/partner.types';
import { PARTNER_MESSAGES } from '../validators/partner.validators';
import { changesBetween, type PartnerRecords } from './partner-records';

const partnerLogoMissing = (): NotFoundException =>
    new NotFoundException('This partner has no logo.', 'PARTNER_LOGO_NOT_FOUND');

const requestNotFound = (): NotFoundException =>
    new NotFoundException(PARTNER_MESSAGES.REQUEST_NOT_FOUND, 'PARTNER_REQUEST_NOT_FOUND');

const requestExists = (): ConflictException =>
    new ConflictException(PARTNER_MESSAGES.REQUEST_EXISTS, 'PARTNER_REQUEST_EXISTS');

const detailsOf = (request: MyPartnerRequestDto): Record<string, unknown> => ({
    businessName: request.businessName,
    ownerName: request.ownerName,
    businessPhone: request.businessPhone,
    businessEmail: request.businessEmail,
    about: request.about,
    masterParkIds: request.parks.map((park) => park.id),
});

const createdChanges = (details: BusinessDetails): Record<string, unknown> =>
    changesBetween({}, { ...details, status: PartnerStatus.PENDING });

export class PartnerRequestService implements IPartnerRequestService {
    constructor(
        private readonly db: Database,
        private readonly repository: IPartnerRepository,
        private readonly records: PartnerRecords,
        private readonly accountSignUp: PartnerAccountSignUp,
    ) {}

    async mine(userId: number): Promise<MyPartnerRequestDto | null> {
        const row = await this.repository.findByUserId(this.db, userId);
        return row ? this.toRequest(row) : null;
    }

    async send(userId: number, details: BusinessDetails): Promise<MyPartnerRequestDto> {
        const actions = { done: AuditAction.PARTNER_REQUEST_SENT, failed: AuditAction.PARTNER_REQUEST_SEND_FAILED };
        return this.records.audited(actions, undefined, { ...details }, async () => {
            if (await this.repository.findByUserId(this.db, userId)) throw requestExists();
            const id = await this.insertRequest(userId, details);
            return { result: await this.current(userId), id, changes: createdChanges(details) };
        });
    }

    async sendWithAccount(
        account: PartnerAccountDetails,
        details: BusinessDetails,
    ): Promise<SignedUpPartner<SignedInSession>> {
        const actions = { done: AuditAction.PARTNER_REQUEST_SENT, failed: AuditAction.PARTNER_REQUEST_SEND_FAILED };
        const input = { ...details, account: { email: account.email, mobile: account.mobile } };
        return this.records.audited(actions, undefined, input, async () => {
            await this.records.checkParks(details.masterParkIds, []);
            const { session, created } = await this.accountSignUp.signUpWith(account, async (user) => ({
                userId: user.id,
                id: await this.insertRequest(user.id, details),
            }));
            const request = await this.current(created.userId);
            return { result: { session, request }, id: created.id, changes: createdChanges(details) };
        });
    }

    async sendAgain(userId: number, details: BusinessDetails): Promise<MyPartnerRequestDto> {
        const actions = {
            done: AuditAction.PARTNER_REQUEST_SENT_AGAIN,
            failed: AuditAction.PARTNER_REQUEST_SEND_AGAIN_FAILED,
        };
        return this.records.audited(actions, undefined, { ...details }, async () => {
            const before = await this.current(userId);
            if (before.status !== PartnerStatus.REJECTED) {
                throw new ConflictException(PARTNER_MESSAGES.REQUEST_NOT_REJECTED, 'PARTNER_REQUEST_NOT_REJECTED');
            }
            await this.records.checkParks(
                details.masterParkIds,
                before.parks.map((park) => park.id),
            );
            if (!(await this.repository.sendAgain(this.db, before.id, details, userId))) {
                throw new ConflictException(PARTNER_MESSAGES.REQUEST_NOT_REJECTED, 'PARTNER_REQUEST_NOT_REJECTED');
            }
            await this.repository.setParks(this.db, before.id, details.masterParkIds, userId);
            const after = await this.current(userId);
            return {
                result: after,
                id: before.id,
                changes: {
                    ...changesBetween(detailsOf(before), detailsOf(after)),
                    status: { from: before.status, to: after.status },
                    rejectReason: { from: before.rejectReason, to: null },
                },
            };
        });
    }

    async myLogo(userId: number): Promise<PartnerLogo> {
        const row = await this.repository.findByUserId(this.db, userId);
        if (!row) throw requestNotFound();
        return this.records.readLogo(row);
    }

    async partnerLogo(partnerId: number): Promise<PartnerLogo> {
        const row = await this.repository.findById(this.db, partnerId);
        if (!row || !PARTNER_STATUSES.includes(row.status)) throw partnerLogoMissing();
        return this.records.readLogo(row);
    }

    async setMyLogo(userId: number, content: Buffer): Promise<MyPartnerRequestDto> {
        const row = await this.editableRequest(userId);
        const fileName = await this.records.storeLogo(row.id, content);
        try {
            return await this.changeLogo(row, fileName, userId);
        } catch (error) {
            await this.records.discardLogo(row.id, fileName);
            throw error;
        }
    }

    async removeMyLogo(userId: number): Promise<MyPartnerRequestDto> {
        return this.changeLogo(await this.editableRequest(userId), null, userId);
    }

    private async changeLogo(row: PartnerRow, logo: string | null, userId: number): Promise<MyPartnerRequestDto> {
        const actions = { done: AuditAction.PARTNER_LOGO_CHANGED, failed: AuditAction.PARTNER_LOGO_CHANGE_FAILED };
        return this.records.audited(actions, row.id, { logo }, async () => {
            await this.editableRequest(userId);
            await this.repository.updateLogo(this.db, row.id, logo, userId);
            return { result: await this.current(userId), id: row.id, changes: { logo: { from: row.logo, to: logo } } };
        });
    }

    private async editableRequest(userId: number): Promise<PartnerRow> {
        const row = await this.repository.findByUserId(this.db, userId);
        if (!row) throw requestNotFound();
        if (!REQUEST_STATUSES.includes(row.status)) {
            throw new ConflictException(PARTNER_MESSAGES.REQUEST_LOCKED, 'PARTNER_REQUEST_LOCKED');
        }
        return row;
    }

    private async insertRequest(userId: number, details: BusinessDetails): Promise<number> {
        await this.records.checkParks(details.masterParkIds, []);
        const id = await this.repository.insert(this.db, userId, details, userId);
        await this.repository.setParks(this.db, id, details.masterParkIds, userId);
        return id;
    }

    private async current(userId: number): Promise<MyPartnerRequestDto> {
        const row = await this.repository.findByUserId(this.db, userId);
        if (!row) throw requestNotFound();
        return this.toRequest(row);
    }

    private async toRequest(row: PartnerRow): Promise<MyPartnerRequestDto> {
        return toMyRequest(row, (await this.records.detail(row)).parks);
    }
}
