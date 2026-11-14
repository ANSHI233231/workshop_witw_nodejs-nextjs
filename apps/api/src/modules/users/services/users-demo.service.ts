import bcrypt from 'bcryptjs';

import { BadRequestException, ConflictException, ForbiddenException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, AuditEntity, type IAuditService } from '../../audit';
import type { IUsersDemoService } from '../contracts/users-demo-service.contract';
import type { IUsersRepository } from '../contracts/users-repository.contract';
import type { DemoAccount, DemoAccountState } from '../dto/users-demo.dto';
import type { UsersDemoRepository } from '../repositories/users-demo.repository';
import { PASSWORD_HASH_ROUNDS, USER_EDIT_LIMITS } from '../types/users.types';

const sameEmail = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

export class UsersDemoService implements IUsersDemoService {
    constructor(
        private readonly db: Database,
        private readonly usersRepository: IUsersRepository,
        private readonly demoRepository: UsersDemoRepository,
        private readonly auditService: IAuditService,
        private readonly isProduction: boolean,
    ) {}

    async findAccounts(emails: readonly string[]): Promise<DemoAccountState[]> {
        this.refuseInProduction();
        const rows = await this.demoRepository.findByEmails(this.db, emails);
        return rows.map((row) => ({ id: row.id, email: row.email, created: false }));
    }

    async addAccounts(accounts: readonly DemoAccount[], password: string): Promise<DemoAccountState[]> {
        this.refuseInProduction();
        if (password.length < USER_EDIT_LIMITS.PASSWORD_MIN || password.length > USER_EDIT_LIMITS.PASSWORD_MAX) {
            throw new BadRequestException(
                `The password must be ${USER_EDIT_LIMITS.PASSWORD_MIN} to ${USER_EDIT_LIMITS.PASSWORD_MAX} characters.`,
                'DEMO_PASSWORD_LENGTH',
            );
        }
        const event = { action: AuditAction.USER_CREATED, entityType: AuditEntity.USER } as const;
        try {
            const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
            return await this.db.transaction(async () => {
                const existing = await this.findAccounts(accounts.map((account) => account.email));
                const states: DemoAccountState[] = [];
                for (const account of accounts) {
                    const found = existing.find((row) => sameEmail(row.email, account.email));
                    if (found) {
                        states.push(found);
                        continue;
                    }
                    const id = await this.usersRepository.insertUser(this.db, {
                        name: account.name,
                        username: null,
                        email: account.email,
                        mobile: account.mobile,
                        passwordHash,
                    });
                    await this.auditService.record({ ...event, entityId: id, details: { email: account.email, demo: true } });
                    states.push({ id, email: account.email, created: true });
                }
                return states;
            });
        } catch (error) {
            await this.auditService.recordFailure({ ...event, action: AuditAction.USER_CREATE_FAILED, details: { demo: true } }, error);
            throw error;
        }
    }

    async removeAccounts(emails: readonly string[]): Promise<number> {
        this.refuseInProduction();
        const event = { action: AuditAction.USER_DEMO_REMOVED, entityType: AuditEntity.USER, details: { emails } } as const;
        try {
            return await this.db.transaction(async () => {
                const found = await this.demoRepository.findByEmails(this.db, emails);
                const admins = found.filter((row) => Number(row.super_admin_roles) > 0);
                if (admins.length > 0) {
                    throw new ConflictException(
                        `These accounts have the Super Admin role and are not demo accounts: ${admins.map((row) => row.email).join(', ')}.`,
                        'DEMO_ACCOUNT_IS_ADMIN',
                    );
                }
                const removed = await this.demoRepository.deleteUsers(
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
            await this.auditService.recordFailure({ ...event, action: AuditAction.USER_DEMO_REMOVE_FAILED }, error);
            throw error;
        }
    }

    private refuseInProduction(): void {
        if (this.isProduction) {
            throw new ForbiddenException('Demo data is never written in production.', 'DEMO_NOT_ALLOWED');
        }
    }
}
