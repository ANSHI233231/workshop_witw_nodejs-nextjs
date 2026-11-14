const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

export const SharedSafariTestDataSQL = {
    markedSafaris: (userCount: number) => `
        SELECT shared_safari.id, shared_safari.user_id, shared_safari.title, shared_safari.status
        FROM shared_safari
        WHERE shared_safari.user_id IN (${inList(userCount)})
            OR shared_safari.title LIKE ?
            OR shared_safari.slug LIKE ?
        ORDER BY shared_safari.id`,

    safarisNotIn: (count: number) => `
        SELECT shared_safari.id, shared_safari.user_id, shared_safari.title, shared_safari.status
        FROM shared_safari
        WHERE shared_safari.id NOT IN (${inList(count)})
        ORDER BY shared_safari.id`,

    members: (safariCount: number, userCount: number) => `
        SELECT shared_safari_member.id, shared_safari_member.shared_safari_id, shared_safari_member.user_id,
            shared_safari_member.status
        FROM shared_safari_member
        WHERE shared_safari_member.shared_safari_id IN (${inList(safariCount)})
            OR shared_safari_member.user_id IN (${inList(userCount)})
        ORDER BY shared_safari_member.id`,

    comments: (safariCount: number, userCount: number) => `
        SELECT shared_safari_comment.id, shared_safari_comment.shared_safari_id, shared_safari_comment.user_id,
            LEFT(shared_safari_comment.comment_text, 40) AS text_start
        FROM shared_safari_comment
        WHERE shared_safari_comment.shared_safari_id IN (${inList(safariCount)})
            OR shared_safari_comment.user_id IN (${inList(userCount)})
            OR shared_safari_comment.comment_text LIKE ?
        ORDER BY shared_safari_comment.id`,

    repliesTo: (count: number) => `
        SELECT shared_safari_comment.id, shared_safari_comment.shared_safari_id, shared_safari_comment.user_id,
            LEFT(shared_safari_comment.comment_text, 40) AS text_start
        FROM shared_safari_comment
        WHERE shared_safari_comment.shared_safari_comment_id IN (${inList(count)})
        ORDER BY shared_safari_comment.id`,

    flags: (commentCount: number, userCount: number) => `
        SELECT shared_safari_comment_flag.id, shared_safari_comment_flag.shared_safari_comment_id,
            shared_safari_comment_flag.user_id
        FROM shared_safari_comment_flag
        WHERE shared_safari_comment_flag.shared_safari_comment_id IN (${inList(commentCount)})
            OR shared_safari_comment_flag.user_id IN (${inList(userCount)})
        ORDER BY shared_safari_comment_flag.id`,

    deleteFlags: (count: number) => `
        DELETE FROM shared_safari_comment_flag
        WHERE id IN (${inList(count)})`,

    deleteComments: (count: number) => `
        DELETE FROM shared_safari_comment
        WHERE id IN (${inList(count)})`,

    deleteMembers: (count: number) => `
        DELETE FROM shared_safari_member
        WHERE id IN (${inList(count)})`,

    deleteSafaris: (count: number) => `
        DELETE FROM shared_safari
        WHERE id IN (${inList(count)})`,
} as const;
