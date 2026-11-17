const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

export const FlagReasonTestDataSQL = {
    marked: `
        SELECT master_flag_reason.id, master_flag_reason.name, master_flag_reason.status
        FROM master_flag_reason
        WHERE master_flag_reason.name LIKE ?
        ORDER BY master_flag_reason.id`,

    referencesIn: (count: number) => `
        SELECT shared_safari_comment_flag.id, shared_safari_comment_flag.master_flag_reason_id
        FROM shared_safari_comment_flag
        WHERE shared_safari_comment_flag.master_flag_reason_id IN (${inList(count)})
        ORDER BY shared_safari_comment_flag.id`,

    deleteReasons: (count: number) => `
        DELETE FROM master_flag_reason
        WHERE id IN (${inList(count)})`,
} as const;
