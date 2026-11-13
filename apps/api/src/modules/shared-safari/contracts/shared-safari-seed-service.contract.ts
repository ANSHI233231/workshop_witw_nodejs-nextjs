import type { SeedOutcome, SeedRemoval, SeedRemovalCounts, SeedSafari } from '../dto/shared-safari-seed.dto';

export interface ISharedSafariSeedService {
    takenSlugs(slugs: readonly string[]): Promise<string[]>;
    seed(safaris: readonly SeedSafari[]): Promise<SeedOutcome[]>;
    remove(removal: SeedRemoval, confirm: boolean): Promise<SeedRemovalCounts>;
}
