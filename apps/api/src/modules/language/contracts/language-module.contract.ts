import type { Database } from '../../../database/connection';
import type { IAuditService } from '../../audit';

export type LanguageModuleDependencies = {
    readonly db: Database;
    readonly auditService: IAuditService;
    readonly translationDirectories: Readonly<Record<string, string>>;
};
