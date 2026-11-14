const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

export const PARK_REFERENCING_TABLES = ['partner_park', 'gallery', 'package_version_park', 'shared_safari'] as const;

export type ParkReferencingTable = (typeof PARK_REFERENCING_TABLES)[number];

export const ParkTestDataSQL = {
    marked: `
        SELECT master_park.id, master_park.name, master_park.slug, master_park.status
        FROM master_park
        WHERE master_park.name LIKE ? OR master_park.slug LIKE ?
        ORDER BY master_park.id`,

    referencesIn: (table: ParkReferencingTable, count: number) => `
        SELECT ${table}.id, ${table}.master_park_id
        FROM ${table}
        WHERE ${table}.master_park_id IN (${inList(count)})
        ORDER BY ${table}.id`,

    translationsOf: (count: number) => `
        SELECT data_translation.id, data_translation.entity_id AS master_park_id
        FROM data_translation
        WHERE data_translation.entity_table = 'master_park' AND data_translation.entity_id IN (${inList(count)})
        ORDER BY data_translation.id`,

    deleteParks: (count: number) => `
        DELETE FROM master_park
        WHERE id IN (${inList(count)})`,
} as const;
