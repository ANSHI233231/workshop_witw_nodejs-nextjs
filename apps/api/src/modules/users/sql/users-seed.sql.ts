const placeholders = (count: number): string => Array.from({ length: count }, () => '?').join(', ');

export const UsersSeedSQL = {
    findByEmails: (count: number) => `
        SELECT u.id, u.email,
               (SELECT COUNT(*) FROM user_role r WHERE r.user_id = u.id) AS roleCount
        FROM user u
        WHERE u.email IN (${placeholders(count)})`,

    deleteRoles: (count: number) => `
        DELETE FROM user_role WHERE user_id IN (${placeholders(count)})`,

    deleteUsers: (count: number) => `
        DELETE FROM user WHERE id IN (${placeholders(count)})`,
} as const;
