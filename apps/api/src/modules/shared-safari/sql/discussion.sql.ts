const COMMENT_COLUMNS = `
    c.id,
    c.shared_safari_id AS sharedSafariId,
    c.shared_safari_comment_id AS sharedSafariCommentId,
    c.user_id AS userId,
    u.name AS writerName,
    u.status AS writerStatus,
    c.comment_text AS commentText,
    c.status,
    c.created_at AS createdAt,
    c.updated_at AS updatedAt,
    (SELECT COUNT(*) FROM shared_safari_comment_flag f JOIN user fu ON fu.id = f.user_id
        WHERE f.shared_safari_comment_id = c.id AND f.status = ? AND fu.status = ?) AS openFlags,
    (SELECT COUNT(*) FROM shared_safari_comment_flag f WHERE f.shared_safari_comment_id = c.id) AS allFlags`;

const flaggedWhere = (search: boolean): string => `
    WHERE c.status = ? AND u.status = ?
      AND (c.shared_safari_comment_id IS NULL OR parent.status = ?)
      AND EXISTS (SELECT 1 FROM shared_safari_comment_flag f JOIN user fu ON fu.id = f.user_id
                  WHERE f.shared_safari_comment_id = c.id AND f.status = ? AND fu.status = ?)
      ${search ? 'AND (c.comment_text LIKE ? OR s.title LIKE ?)' : ''}`;

const FLAGGED_FROM = `
    FROM shared_safari_comment c
    JOIN user u ON u.id = c.user_id
    JOIN shared_safari s ON s.id = c.shared_safari_id
    LEFT JOIN shared_safari_comment parent ON parent.id = c.shared_safari_comment_id`;

export const DiscussionSQL = {
    listForSafari: `
        SELECT ${COMMENT_COLUMNS}
        FROM shared_safari_comment c
        JOIN user u ON u.id = c.user_id
        WHERE c.shared_safari_id = ? AND c.status = ? AND u.status = ?
        ORDER BY c.created_at, c.id`,

    findById: `
        SELECT ${COMMENT_COLUMNS}
        FROM shared_safari_comment c
        JOIN user u ON u.id = c.user_id
        WHERE c.id = ?`,

    insert: `
        INSERT INTO shared_safari_comment
            (shared_safari_id, shared_safari_comment_id, user_id, comment_text, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,

    updateText: `
        UPDATE shared_safari_comment SET comment_text = ?, updated_by = ? WHERE id = ?`,

    deleteWithReplies: `
        UPDATE shared_safari_comment
        SET status = ?, deleted_at = UTC_TIMESTAMP(), deleted_by = ?, updated_by = ?
        WHERE (id = ? OR shared_safari_comment_id = ?) AND status = ?`,

    deleteOne: `
        UPDATE shared_safari_comment
        SET status = ?, deleted_at = UTC_TIMESTAMP(), deleted_by = ?, updated_by = ?
        WHERE id = ? AND status = ?`,

    closeFlagsOf: `
        UPDATE shared_safari_comment_flag f
        JOIN shared_safari_comment c ON c.id = f.shared_safari_comment_id
        SET f.status = ?, f.updated_by = ?
        WHERE (c.id = ? OR c.shared_safari_comment_id = ?) AND f.status = ?`,

    ignoreFlagsOf: `
        UPDATE shared_safari_comment_flag SET status = ?, updated_by = ?
        WHERE shared_safari_comment_id = ? AND status = ?`,

    insertFlag: `
        INSERT INTO shared_safari_comment_flag
            (shared_safari_comment_id, user_id, master_flag_reason_id, reason_name, details, status, created_by,
             updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

    flagged: (search: boolean) => `
        SELECT c.id,
               c.shared_safari_id AS sharedSafariId,
               c.shared_safari_comment_id AS sharedSafariCommentId,
               s.title AS safariTitle,
               s.slug AS safariSlug,
               u.name AS writerName,
               c.comment_text AS commentText,
               (SELECT GROUP_CONCAT(DISTINCT f.reason_name ORDER BY f.reason_name SEPARATOR '\\n')
                FROM shared_safari_comment_flag f JOIN user fu ON fu.id = f.user_id
                WHERE f.shared_safari_comment_id = c.id AND f.status = ? AND fu.status = ?) AS reasons,
               (SELECT COUNT(*) FROM shared_safari_comment_flag f JOIN user fu ON fu.id = f.user_id
                WHERE f.shared_safari_comment_id = c.id AND f.status = ? AND fu.status = ?) AS openFlags,
               (SELECT MAX(f.created_at) FROM shared_safari_comment_flag f
                WHERE f.shared_safari_comment_id = c.id AND f.status = ?) AS lastFlaggedAt
        ${FLAGGED_FROM}
        ${flaggedWhere(search)}
        ORDER BY lastFlaggedAt DESC, c.id DESC
        LIMIT ? OFFSET ?`,

    flaggedCount: (search: boolean) => `
        SELECT COUNT(*) AS total
        ${FLAGGED_FROM}
        ${flaggedWhere(search)}`,

    openFlagsOf: `
        SELECT f.id, f.reason_name AS reasonName, f.details, fu.name AS flaggerName, f.created_at AS createdAt
        FROM shared_safari_comment_flag f
        JOIN user fu ON fu.id = f.user_id
        WHERE f.shared_safari_comment_id = ? AND f.status = ? AND fu.status = ?
        ORDER BY f.created_at DESC, f.id DESC`,
} as const;
