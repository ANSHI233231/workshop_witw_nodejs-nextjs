const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

export const SharedSafariSeedSQL = {
    parkIdByName: `
        SELECT id FROM master_park WHERE name = ? AND status <> -1 ORDER BY id LIMIT 1`,

    flagReasonByName: `
        SELECT id, name FROM master_flag_reason WHERE name = ? AND status <> -1 ORDER BY id LIMIT 1`,

    takenSlugs: (count: number) => `
        SELECT slug FROM shared_safari WHERE slug IN (${inList(count)})`,

    insertSafari: `
        INSERT INTO shared_safari
            (user_id, master_park_id, slug, title, theme, start_date, end_date, safari_count, total_seats,
             shared_seats, price_per_person_min, price_per_person_max, stay_category, safari_plan, is_pinned,
             delete_reason, delete_details, status, created_at, updated_at, created_by, updated_by, deleted_at,
             deleted_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    insertMember: `
        INSERT INTO shared_safari_member
            (shared_safari_id, user_id, first_joined_at, joined_at, left_at, status, created_at, updated_at,
             created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    insertComment: `
        INSERT INTO shared_safari_comment
            (shared_safari_id, shared_safari_comment_id, user_id, comment_text, status, created_at, updated_at,
             created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    insertFlag: `
        INSERT INTO shared_safari_comment_flag
            (shared_safari_comment_id, user_id, master_flag_reason_id, reason_name, details, status, created_at,
             updated_at, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    setCover: `
        UPDATE shared_safari SET cover_image = ?, updated_at = updated_at WHERE id = ?`,

    seededSafaris: (slugs: number, users: number) => `
        SELECT id, slug, cover_image AS coverImage FROM shared_safari
        WHERE slug IN (${inList(slugs)}) AND user_id IN (${inList(users)})`,

    otherHosted: (slugs: number, users: number) => `
        SELECT slug FROM shared_safari
        WHERE user_id IN (${inList(users)}) AND slug NOT IN (${inList(slugs)})`,

    commentIds: (safaris: number, users: number) => `
        SELECT id FROM shared_safari_comment
        WHERE shared_safari_id IN (${inList(safaris)}) OR user_id IN (${inList(users)})`,

    countFlags: (comments: number, users: number) => `
        SELECT COUNT(*) AS total FROM shared_safari_comment_flag
        WHERE shared_safari_comment_id IN (${inList(comments)}) OR user_id IN (${inList(users)})`,

    countComments: (comments: number) => `
        SELECT COUNT(*) AS total FROM shared_safari_comment
        WHERE id IN (${inList(comments)}) OR shared_safari_comment_id IN (${inList(comments)})`,

    countMembers: (safaris: number, users: number) => `
        SELECT COUNT(*) AS total FROM shared_safari_member
        WHERE shared_safari_id IN (${inList(safaris)}) OR user_id IN (${inList(users)})`,

    deleteFlags: (comments: number, users: number) => `
        DELETE FROM shared_safari_comment_flag
        WHERE shared_safari_comment_id IN (${inList(comments)}) OR user_id IN (${inList(users)})`,

    deleteComments: (comments: number) => `
        DELETE FROM shared_safari_comment
        WHERE id IN (${inList(comments)}) OR shared_safari_comment_id IN (${inList(comments)})`,

    deleteMembers: (safaris: number, users: number) => `
        DELETE FROM shared_safari_member
        WHERE shared_safari_id IN (${inList(safaris)}) OR user_id IN (${inList(users)})`,

    deleteSafaris: (safaris: number) => `
        DELETE FROM shared_safari WHERE id IN (${inList(safaris)})`,
} as const;
