const placeholders = (count: number): string => Array.from({ length: count }, () => '?').join(', ');

export type DataTranslationLookupShape = readonly { readonly ids: number; readonly columns: number }[];

const COLUMNS = 'entity_table, entity_id, entity_column, master_language_code, translated_text';

export const DataTranslationSQL = {
    forRows: (shape: DataTranslationLookupShape, languages: number) => `
        SELECT ${COLUMNS}
        FROM data_translation
        WHERE status = ? AND master_language_code IN (${placeholders(languages)})
          AND (${shape
              .map(
                  (target) =>
                      `(entity_table = ? AND entity_id IN (${placeholders(target.ids)}) AND entity_column IN (${placeholders(target.columns)}))`,
              )
              .join(' OR ')})`,

    forEntity: `
        SELECT ${COLUMNS}
        FROM data_translation
        WHERE entity_table = ? AND entity_id = ? AND status = ?`,

    save: `
        INSERT INTO data_translation
            (entity_table, entity_id, entity_column, master_language_code, translated_text, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?) AS incoming
        ON DUPLICATE KEY UPDATE translated_text = incoming.translated_text, status = incoming.status,
            deleted_at = NULL, deleted_by = NULL, updated_by = incoming.updated_by`,

    clear: `
        UPDATE data_translation
        SET status = ?, deleted_at = UTC_TIMESTAMP(), deleted_by = ?, updated_by = ?
        WHERE entity_table = ? AND entity_id = ? AND entity_column = ? AND master_language_code = ? AND status = ?`,
} as const;
