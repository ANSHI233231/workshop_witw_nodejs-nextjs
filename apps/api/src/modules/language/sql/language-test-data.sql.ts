const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

export const LanguageTestDataSQL = {
    markedLanguages: `
        SELECT master_language.code, master_language.name, master_language.status
        FROM master_language
        WHERE master_language.name LIKE ? AND master_language.code <> ?
        ORDER BY master_language.code`,

    sitesOf: (count: number) => `
        SELECT master_language_site.master_language_code, master_language_site.site
        FROM master_language_site
        WHERE master_language_site.master_language_code IN (${inList(count)})
        ORDER BY master_language_site.master_language_code, master_language_site.site`,

    dataTranslationsOf: (count: number) => `
        SELECT data_translation.id, data_translation.entity_table, data_translation.entity_id,
               data_translation.entity_column, data_translation.master_language_code
        FROM data_translation
        WHERE data_translation.master_language_code IN (${inList(count)})
        ORDER BY data_translation.id`,

    markedAppTranslations: `
        SELECT app_translation.id, app_translation.en_text
        FROM app_translation
        WHERE app_translation.en_text LIKE ?
        ORDER BY app_translation.id`,

    filledValues: (column: string) => `
        SELECT COUNT(*) AS total
        FROM app_translation
        WHERE ${column} <> ''`,

    deleteAppTranslations: (count: number) => `
        DELETE FROM app_translation
        WHERE id IN (${inList(count)})`,

    deleteDataTranslations: (count: number) => `
        DELETE FROM data_translation
        WHERE master_language_code IN (${inList(count)})`,

    deleteSites: (count: number) => `
        DELETE FROM master_language_site
        WHERE master_language_code IN (${inList(count)})`,

    deleteLanguages: (count: number) => `
        DELETE FROM master_language
        WHERE code IN (${inList(count)}) AND code <> ?`,

    clearTextColumn: (column: string) => `
        UPDATE app_translation
        SET ${column} = ''`,
} as const;
