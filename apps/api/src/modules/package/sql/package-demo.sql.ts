const placeholders = (count: number): string => Array.from({ length: count }, () => '?').join(', ');

const OF_VERSIONS = (count: number) =>
    `package_version_id IN (SELECT id FROM package_version WHERE package_id IN (${placeholders(count)}))`;

export const PackageDemoSQL = {
    deleteChildren: (table: string, count: number) => `DELETE FROM ${table} WHERE ${OF_VERSIONS(count)}`,
    deleteVersions: (count: number) => `DELETE FROM package_version WHERE package_id IN (${placeholders(count)})`,
    deletePackages: (count: number) => `DELETE FROM package WHERE id IN (${placeholders(count)})`,
} as const;

export const DEMO_CHILD_TABLES = [
    'package_version_photo',
    'package_version_day',
    'package_version_faq',
    'package_version_inclusion',
    'package_version_feature',
    'package_version_park',
] as const;
