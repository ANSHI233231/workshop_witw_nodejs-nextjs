import type { DemoAccount, DemoAccountState } from '../dto/users-demo.dto';

export interface IUsersDemoService {
    findAccounts(emails: readonly string[]): Promise<DemoAccountState[]>;
    addAccounts(accounts: readonly DemoAccount[], password: string): Promise<DemoAccountState[]>;
    removeAccounts(emails: readonly string[], superAdminEmails?: readonly string[]): Promise<number>;
}
