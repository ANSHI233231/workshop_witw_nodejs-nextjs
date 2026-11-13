import bcrypt from 'bcryptjs';

import { BadRequestException, ConflictException, ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IUsersSeedService } from '../contracts/users-seed-service.contract';
import type { FoundSeedAccount, SeedAccount, SeededAccount } from '../dto/users-seed.dto';
import type { IUsersRepository } from '../contracts/users-repository.contract';
import type { UsersSeedRepository } from '../repositories/users-seed.repository';
import { PASSWORD_HASH_ROUNDS, USER_EDIT_LIMITS } from '../types/users.types';

const sameEmail = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

export class UsersSeedService implements IUsersSeedService {
    constructor(
        private readonly db: Database,
        private readonly usersRepository: IUsersRepository,
        private readonly seedRepository: UsersSeedRepository,
        private readonly auditService: IAuditService,
        private readonly isProduction: boolean,
    ) {}

    async findAccounts(emails: readonly string[]): Promise<FoundSeedAccount[]> {
        this.refuseInProduction();
        const rows = await this.seedRepository.findByEmails(this.db, emails);
        return rows.map((row) => ({ id: row.id, email: row.email, hasRole: Number(row.roleCount) > 0 }));
    }

    async seedAccounts(accounts: readonly SeedAccount[], password: string): Promise<SeededAccount[]> {
        this.refuseInProduction();
        if (password.length < USER_EDIT_LIMITS.PASSWORD_MIN || password.length > USER_EDIT_LIMITS.PASSWORD_MAX) {
            throw new BadRequestException(
                `The password must be ${USER_EDIT_LIMITS.PASSWORD_MIN} to ${USER_EDIT_LIMITS.PASSWORD_MAX} characters.`,
                'SEED_PASSWORD_LENGTH',
            );
        }
        const emails = accounts.map((account) => account.email);
        const event = { action: AuditAction.USER_SEEDED, entityType: AuditEntity.USER, details: { emails } } as const;
        try {
            const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
            return await this.db.transaction(async () => {
                const existing = await this.findAccounts(emails);
                const seeded: SeededAccount[] = [];
                for (const account of accounts) {
                    const found = existing.find((row) => sameEmail(row.email, account.email));
                    if (found) {
                        seeded.push({ id: found.id, email: found.email, created: false });
                        continue;
                    }
                    const id = await this.usersRepository.insertUser(this.db, {
                        name: account.name,
                        username: null,
                        email: account.email,
                        mobile: null,
                        passwordHash,
                    });
                    seeded.push({ id, email: account.email, created: true });
                }
                const created = seeded.filter((row) => row.created);
                if (created.length > 0) {
                    await this.auditService.record({
                        ...event,
                        details: { created: created.map((row) => ({ id: row.id, email: row.email })) },
                    });
                }
                return seeded;
            });
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.USER_SEED_FAILED }, error);
            throw error;
        }
    }

    async removeAccounts(emails: readonly string[]): Promise<number> {
        this.refuseInProduction();
        const event = { action: AuditAction.USER_SEED_REMOVED, entityType: AuditEntity.USER, details: { emails } } as const;
        try {
            return await this.db.transaction(async () => {
                const found = await this.findAccounts(emails);
                const withRole = found.filter((row) => row.hasRole);
                if (withRole.length > 0) {
                    throw new ConflictException(
                        `These accounts have a system role and are not sample accounts: ${withRole.map((row) => row.email).join(', ')}.`,
                        'SEED_ACCOUNT_HAS_ROLE',
                    );
                }
                const removed = await this.seedRepository.deleteUsers(
                    this.db,
                    found.map((row) => row.id),
                );
                if (removed > 0) {
                    await this.auditService.record({
                        ...event,
                        details: { removed: found.map((row) => ({ id: row.id, email: row.email })) },
                    });
                }
                return removed;
            });
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.USER_SEED_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Sample data is never written in production.', 'SEED_NOT_ALLOWED');
        }
    }
}
