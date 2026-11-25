const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

export const ChatTestDataSQL = {
    conversationsOf: (count: number) => `
        SELECT id, first_user_id, second_user_id
        FROM chat_conversation
        WHERE first_user_id IN (${inList(count)}) OR second_user_id IN (${inList(count)})
        ORDER BY id`,

    messagesOf: (count: number) => `
        SELECT id, chat_conversation_id, user_id
        FROM chat_message
        WHERE chat_conversation_id IN (${inList(count)})
        ORDER BY id`,

    deleteMessages: (count: number) => `
        DELETE FROM chat_message
        WHERE chat_conversation_id IN (${inList(count)})`,

    deleteConversations: (count: number) => `
        DELETE FROM chat_conversation
        WHERE id IN (${inList(count)})`,
} as const;
