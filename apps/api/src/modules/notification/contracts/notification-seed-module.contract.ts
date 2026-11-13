import type { Database } from '../../../database/connection';

export type NotificationSeedModuleDependencies = { readonly db: Database; readonly isProduction: boolean };
