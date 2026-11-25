const CONVERSATION_COLUMNS = `c.id, c.first_user_id, c.second_user_id, c.last_message_at,
            other.id AS other_user_id, other.name AS other_name, other.status AS other_status,
            other_profile.photo AS other_photo,
            lm.user_id AS last_sender_id, lm.message_text AS last_text, lm.created_at AS last_sent_at,
            (SELECT COUNT(*) FROM chat_message um
                WHERE um.chat_conversation_id = c.id AND um.user_id <> ? AND um.read_at IS NULL) AS unread_count`;

const CONVERSATION_FROM = `
        FROM chat_conversation c
        JOIN user other ON other.id = IF(c.first_user_id = ?, c.second_user_id, c.first_user_id)
        LEFT JOIN user_profile other_profile ON other_profile.user_id = other.id
        JOIN chat_message lm ON lm.id =
            (SELECT MAX(m.id) FROM chat_message m WHERE m.chat_conversation_id = c.id)`;

export const ChatSQL = {
    conversationsOf: `
        SELECT ${CONVERSATION_COLUMNS}
        ${CONVERSATION_FROM}
        WHERE c.first_user_id = ? OR c.second_user_id = ?
        ORDER BY c.last_message_at DESC, c.id DESC`,

    conversationOf: `
        SELECT ${CONVERSATION_COLUMNS}
        ${CONVERSATION_FROM}
        WHERE c.id = ? AND (c.first_user_id = ? OR c.second_user_id = ?)`,

    findPair: `
        SELECT id
        FROM chat_conversation
        WHERE first_user_id = ? AND second_user_id = ?`,

    openPair: `
        INSERT INTO chat_conversation (first_user_id, second_user_id, last_message_at, created_by, updated_by)
        VALUES (?, ?, UTC_TIMESTAMP(), ?, ?) AS incoming
        ON DUPLICATE KEY UPDATE
            id = LAST_INSERT_ID(chat_conversation.id),
            last_message_at = incoming.last_message_at,
            updated_by = incoming.updated_by`,

    insertMessage: `
        INSERT INTO chat_message (chat_conversation_id, user_id, message_text, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?)`,

    touchConversation: `
        UPDATE chat_conversation
        SET last_message_at = (SELECT created_at FROM chat_message WHERE id = ?), updated_by = ?
        WHERE id = ?`,

    messagesOf: `
        SELECT id, chat_conversation_id, user_id, message_text, read_at, created_at
        FROM chat_message
        WHERE chat_conversation_id = ?
        ORDER BY id ASC`,

    messageById: `
        SELECT id, chat_conversation_id, user_id, message_text, read_at, created_at
        FROM chat_message
        WHERE id = ?`,

    markRead: `
        UPDATE chat_message
        SET read_at = UTC_TIMESTAMP(), updated_by = ?
        WHERE chat_conversation_id = ? AND user_id <> ? AND read_at IS NULL`,

    unreadCountOf: `
        SELECT COUNT(*) AS total
        FROM chat_message m
        JOIN chat_conversation c ON c.id = m.chat_conversation_id
        WHERE (c.first_user_id = ? OR c.second_user_id = ?) AND m.user_id <> ? AND m.read_at IS NULL`,

    chatUser: `
        SELECT u.id, u.name, u.status, up.photo
        FROM user u
        LEFT JOIN user_profile up ON up.user_id = u.id
        WHERE u.id = ?`,
} as const;
