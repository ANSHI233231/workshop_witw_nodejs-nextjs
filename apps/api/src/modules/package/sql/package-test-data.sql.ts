const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

export const PACKAGE_VERSION_CHILD_TABLES = [
    'package_version_day',
    'package_version_faq',
    'package_version_feature',
    'package_version_inclusion',
    'package_version_park',
    'package_version_photo',
] as const;

export type PackageVersionChildTable = (typeof PACKAGE_VERSION_CHILD_TABLES)[number];

export const PackageTestDataSQL = {
    marked: (partnerCount: number) => `
        SELECT package.id, package.partner_id, package.slug, package.website_status
        FROM package
        WHERE package.partner_id IN (${inList(partnerCount)})
            OR package.slug LIKE ?
            OR EXISTS (
                SELECT 1 FROM package_version
                WHERE package_version.package_id = package.id AND package_version.name LIKE ?
            )
        ORDER BY package.id`,

    packagesNotIn: (count: number) => `
        SELECT package.id, package.partner_id, package.slug, package.website_status
        FROM package
        WHERE package.id NOT IN (${inList(count)})
        ORDER BY package.id`,

    versionsOf: (count: number) => `
        SELECT package_version.id, package_version.package_id, package_version.version_number, package_version.name
        FROM package_version
        WHERE package_version.package_id IN (${inList(count)})
        ORDER BY package_version.id`,

    markedVersionsOfOthers: (count: number) => `
        SELECT package_version.id, package_version.package_id, package_version.version_number, package_version.name
        FROM package_version
        WHERE package_version.package_id NOT IN (${inList(count)}) AND package_version.name LIKE ?
        ORDER BY package_version.id`,

    childrenOf: (table: PackageVersionChildTable, count: number) => `
        SELECT ${table}.id, ${table}.package_version_id
        FROM ${table}
        WHERE ${table}.package_version_id IN (${inList(count)})
        ORDER BY ${table}.id`,

    markedReasons: `
        SELECT master_package_delete_reason.id, master_package_delete_reason.name
        FROM master_package_delete_reason
        WHERE master_package_delete_reason.name LIKE ?
        ORDER BY master_package_delete_reason.id`,

    reasonsUsedByOthers: (reasonCount: number, packageCount: number) => `
        SELECT package.id, package.master_package_delete_reason_id
        FROM package
        WHERE package.master_package_delete_reason_id IN (${inList(reasonCount)})
            AND package.id NOT IN (${inList(packageCount)})
        ORDER BY package.id`,

    deleteChildren: (table: PackageVersionChildTable, count: number) => `
        DELETE FROM ${table}
        WHERE package_version_id IN (${inList(count)})`,

    deleteVersions: (count: number) => `
        DELETE FROM package_version
        WHERE id IN (${inList(count)})`,

    deletePackages: (count: number) => `
        DELETE FROM package
        WHERE id IN (${inList(count)})`,

    deleteReasons: (count: number) => `
        DELETE FROM master_package_delete_reason
        WHERE id IN (${inList(count)})`,
} as const;
