import { ConflictException, ForbiddenException, NotFoundException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import type { IFileStorage } from '../../../infrastructure/storage';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IParkService } from '../../park';
import { type IUsersDemoService, type IUsersService, MetaRole } from '../../users';
import type { IPartnerDemoService } from '../contracts/partner-demo-service.contract';
import type { IPartnerRepository } from '../contracts/partner-repository.contract';
import type { DemoPartner, DemoPartnerOutcome, DemoPartnerState } from '../dto/partner-demo.dto';
import { LOGO_FOLDER, PARTNER_STATUSES, PartnerStatus } from '../types/partner.types';
import type { PartnerRecords } from './partner-records';

const DAY_MS = 24 * 60 * 60 * 1000;

const daysAgo = (days: number): Date => {
    const date = new Date(Date.now() - days * DAY_MS);
    date.setUTCSeconds(0, 0);
    return date;
};

const sameEmail = (a: string | null, b: string): boolean => a !== null && a.toLowerCase() === b.toLowerCase();


export class PartnerDemoService implements IPartnerDemoService {
    constructor(
        private readonly db: Database,
        private readonly repository: IPartnerRepository,
        private readonly records: PartnerRecords,
        private readonly usersService: IUsersService,
        private readonly usersDemoService: IUsersDemoService,
        private readonly parkService: IParkService,
        private readonly auditService: IAuditService,
        private readonly fileStorage: IFileStorage,
        private readonly isProduction: boolean,
    ) {}

    async states(partners: readonly DemoPartner[]): Promise<DemoPartnerState[]> {
        this.refuseInProduction();
        const accounts = await this.usersDemoService.findAccounts(partners.map((partner) => partner.account.email));
        const rows = await this.repository.findByUserIds(
            this.db,
            accounts.map((account) => account.id),
        );
        return partners.map((partner) => {
            const account = accounts.find((row) => sameEmail(row.email, partner.account.email));
            const row = account === undefined ? undefined : rows.find((candidate) => candidate.user_id === account.id);
            return {
                email: partner.account.email,
                hasAccount: account !== undefined,
                hasPartner: row !== undefined,
                userId: account?.id ?? null,
                partnerId: row?.id ?? null,
                businessName: row?.business_name ?? null,
            };
        });
    }

    async add(partners: readonly DemoPartner[], password: string): Promise<DemoPartnerOutcome[]> {
        this.refuseInProduction();
        const event = { action: AuditAction.PARTNER_DEMO_ADDED, entityType: AuditEntity.PARTNER } as const;
        try {
            const accounts = await this.usersDemoService.addAccounts(
                partners.map((partner) => partner.account),
                password,
            );
            const parkIdOf = new Map((await this.parkService.listActive()).map((park) => [park.name, park.id]));
            const adminId = (await this.usersService.activeUserIdsWithRole(MetaRole.SUPER_ADMIN))[0] ?? null;
            return await this.db.transaction(async () => {
                const outcomes: DemoPartnerOutcome[] = [];
                for (const partner of partners) {
                    const account = accounts.find((row) => sameEmail(row.email, partner.account.email));
                    if (!account) continue;
                    outcomes.push(await this.addPartner(partner, account.id, account.created, parkIdOf, adminId));
                }
                const created = outcomes.filter((outcome) => outcome.partnerCreated);
                if (created.length > 0) {
                    await this.auditService.record({
                        ...event,
                        details: { created: created.map((outcome) => ({ id: outcome.partnerId, email: outcome.email })) },
                    });
                }
                return outcomes;
            });
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.PARTNER_DEMO_ADD_FAILED }, error);
            throw error;
        }
    }

    async setLogo(partnerId: number, content: Buffer): Promise<boolean> {
        this.refuseInProduction();
        const row = await this.repository.findById(this.db, partnerId);
        if (!row) throw new NotFoundException('This partner was not found.', 'PARTNER_NOT_FOUND');
        if (row.logo) return false;
        const fileName = await this.records.storeLogo(partnerId, content);
        const actions = { done: AuditAction.PARTNER_LOGO_CHANGED, failed: AuditAction.PARTNER_LOGO_CHANGE_FAILED };
        try {
            return await this.records.audited(actions, partnerId, { logo: fileName, demo: true }, async () => {
                await this.repository.updateLogo(this.db, partnerId, fileName, row.user_id);
                return { result: true, id: partnerId, changes: { logo: { from: null, to: fileName } } };
            });
        } catch (error) {
            await this.records.discardLogo(partnerId, fileName);
            throw error;
        }
    }

    async remove(
        target: { readonly partnerIds: readonly number[]; readonly accountEmails: readonly string[] },
        write: boolean,
    ): Promise<{ partners: number; accounts: number }> {
        this.refuseInProduction();
        const accounts = await this.usersDemoService.findAccounts(target.accountEmails);
        if (!write) return { partners: target.partnerIds.length, accounts: accounts.length };
        const event = { action: AuditAction.PARTNER_DEMO_REMOVED, entityType: AuditEntity.PARTNER } as const;
        try {
            const rows = (await Promise.all(target.partnerIds.map((id) => this.repository.findById(this.db, id)))).flatMap(
                (row) => (row ? [row] : []),
            );
            const partners = await this.db.transaction(async () => {
                for (const row of rows) await this.usersService.revokeRole(row.user_id, MetaRole.PARTNER, null);
                const removed = await this.repository.deletePartners(
                    this.db,
                    rows.map((row) => row.id),
                );
                if (removed > 0) {
                    await this.auditService.record({
                        ...event,
                        details: { removed: rows.map((row) => ({ id: row.id, userId: row.user_id })) },
                    });
                }
                return removed;
            });
            const removedAccounts = await this.usersDemoService.removeAccounts(target.accountEmails);
            for (const row of rows) await this.fileStorage.removeFolder(`${LOGO_FOLDER.PARENT}/${row.id}`);
            return { partners, accounts: removedAccounts };
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.PARTNER_DEMO_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private async addPartner(
        partner: DemoPartner,
        userId: number,
        accountCreated: boolean,
        parkIdOf: ReadonlyMap<string, number>,
        adminId: number | null,
    ): Promise<DemoPartnerOutcome> {
        const outcome = { email: partner.account.email, userId, accountCreated };
        const business = partner.business;
        if (!business) return { ...outcome, partnerId: null, partnerCreated: false, missingParks: [] };
        const existing = await this.repository.findByUserId(this.db, userId);
        const missingParks = business.parkNames.filter((name) => !parkIdOf.has(name));
        if (existing && existing.business_name !== business.businessName) {
            throw new ConflictException(
                `${partner.account.email} already has the partner "${existing.business_name}", not "${business.businessName}". Remove it first.`,
                'DEMO_PARTNER_TAKEN',
            );
        }
        if (existing) return { ...outcome, partnerId: existing.id, partnerCreated: false, missingParks };
        const decided = business.status !== PartnerStatus.PENDING && business.decidedDaysAgo !== null;
        const decidedAt = decided && business.decidedDaysAgo !== null ? daysAgo(business.decidedDaysAgo) : null;
        const isPartner = PARTNER_STATUSES.includes(business.status);
        const partnerId = await this.repository.insertDecided(this.db, {
            userId,
            businessName: business.businessName,
            ownerName: business.ownerName,
            businessPhone: business.businessPhone,
            businessEmail: business.businessEmail,
            about: business.about,
            isPhoneShown: business.isPhoneShown,
            status: business.status,
            rejectReason: business.rejectReason,
            requestedAt: daysAgo(business.requestedDaysAgo),
            decidedAt,
            decidedBy: decided ? adminId : null,
            approvedAt: isPartner ? decidedAt : null,
        });
        const parkIds = business.parkNames.flatMap((name) => {
            const id = parkIdOf.get(name);
            return id === undefined ? [] : [id];
        });
        await this.repository.setParks(this.db, partnerId, parkIds, userId);
        if (isPartner) await this.usersService.grantRole(userId, MetaRole.PARTNER, adminId);
        return { ...outcome, partnerId, partnerCreated: true, missingParks };
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Demo data is never written in production.', 'DEMO_NOT_ALLOWED');
        }
    }
}
