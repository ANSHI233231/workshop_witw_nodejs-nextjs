const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

export const UsersTestDataSQL = {
    findMarked: (keptCount: number) => `
        SELECT user.id, user.name, user.email,
            (SELECT COUNT(*)
                FROM user_role
                WHERE user_role.user_id = user.id AND user_role.meta_role_id = ?) AS super_admin_roles
        FROM user
        WHERE (user.email LIKE ? OR user.username LIKE ?)
            AND user.email NOT IN (${inList(keptCount)})
        ORDER BY user.id`,

    rolesOf: (count: number) => `
        SELECT user_role.id, user_role.user_id, user_role.meta_role_id
        FROM user_role
        WHERE user_role.user_id IN (${inList(count)})
        ORDER BY user_role.id`,

    withEmailEnding: `
        SELECT user.id, user.name, user.email
        FROM user
        WHERE user.email LIKE ?
        ORDER BY user.id`,

    withEmails: (count: number) => `
        SELECT user.id, user.name, user.email
        FROM user
        WHERE user.email IN (${inList(count)})
        ORDER BY user.id`,

    deleteRoles: (count: number) => `
        DELETE FROM user_role
        WHERE user_id IN (${inList(count)})`,

    deleteUsers: (count: number) => `
        DELETE FROM user
        WHERE id IN (${inList(count)})`,
} as const;
