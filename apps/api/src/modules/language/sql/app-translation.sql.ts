type ListShape = {
    readonly status: boolean;
    readonly search: boolean;
    readonly missing: string | undefined;
};

const searchOver = (columns: readonly string[]): string =>
    ['en_text', ...columns].map((column) => `${column} LIKE ?`).join(' OR ');

const listWhere = (shape: ListShape, columns: readonly string[]): string =>
    [
        'WHERE status <> ?',
        shape.status ? ' AND status = ?' : '',
        shape.search ? ` AND (${searchOver(columns)})` : '',
        shape.missing ? ` AND ${shape.missing} = ''` : '',
    ].join('');

const columnsOf = (columns: readonly string[]): string =>
    ['id', 'en_text', ...columns, 'status', 'updated_at'].join(', ');

export const AppTranslationSQL = {
    textColumns: `
        SELECT column_name AS column_name
        FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'app_translation'
        ORDER BY ordinal_position`,

    list: (shape: ListShape, columns: readonly string[]) => `
        SELECT ${columnsOf(columns)}
        FROM app_translation
        ${listWhere(shape, columns)}
        ORDER BY en_text, id
        LIMIT ? OFFSET ?`,

    count: (shape: ListShape, columns: readonly string[]) => `
        SELECT COUNT(*) AS total
        FROM app_translation
        ${listWhere(shape, columns)}`,

    listActive: (columns: readonly string[]) => `
        SELECT ${columnsOf(columns)}
        FROM app_translation
        WHERE status = ?
        ORDER BY en_text, id`,

    findById: (columns: readonly string[]) => `
        SELECT ${columnsOf(columns)}
        FROM app_translation
        WHERE id = ? AND status <> ?`,

    findOtherByEnglish: (columns: readonly string[]) => `
        SELECT ${columnsOf(columns)}
        FROM app_translation
        WHERE en_text = ? AND id <> ?
        LIMIT 1`,

    listAll: (columns: readonly string[]) => `
        SELECT ${columnsOf(columns)}
        FROM app_translation
        WHERE status <> ?`,

    insert: (columns: readonly string[]) => `
        INSERT INTO app_translation (en_text, ${[...columns, 'status', 'created_by', 'updated_by'].join(', ')})
        VALUES (?, ${[...columns, 'status', 'created_by', 'updated_by'].map(() => '?').join(', ')})`,

    update: (columns: readonly string[]) => `
        UPDATE app_translation
        SET ${['en_text', ...columns, 'updated_by'].map((column) => `${column} = ?`).join(', ')}
        WHERE id = ? AND status <> ?`,

    updateTexts: (columns: readonly string[]) => `
        UPDATE app_translation
        SET ${[...columns, 'updated_by'].map((column) => `${column} = ?`).join(', ')}
        WHERE id = ? AND status <> ?`,

    addTextColumn: (column: string) => `
        ALTER TABLE app_translation
        ADD COLUMN ${column} VARCHAR(500) NOT NULL DEFAULT ''`,

    updateStatus: `
        UPDATE app_translation
        SET status = ?, updated_by = ?
        WHERE id = ? AND status <> ?`,
} as const;
