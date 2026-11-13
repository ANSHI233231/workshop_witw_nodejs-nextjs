import type { FoundSeedAccount, SeedAccount, SeededAccount } from '../dto/users-seed.dto';

export interface IUsersSeedService {
    findAccounts(emails: readonly string[]): Promise<FoundSeedAccount[]>;
    seedAccounts(accounts: readonly SeedAccount[], password: string): Promise<SeededAccount[]>;
    removeAccounts(emails: readonly string[]): Promise<number>;
}
