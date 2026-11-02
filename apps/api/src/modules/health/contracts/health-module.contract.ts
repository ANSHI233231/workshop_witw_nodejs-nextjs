// What the module needs from outside itself. All of it is injected: a module never imports
// `config/` and never creates its own database connection.

import type { Database } from '../../../database/connection';

export type HealthModuleDependencies = {
    readonly db: Database;
};
