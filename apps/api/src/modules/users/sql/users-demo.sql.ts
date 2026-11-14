const placeholders = (count: number): string => Array.from({ length: count }, () => '?').join(', ');

export const UsersDemoSQL = {
    findByEmails: (count: number) => `
        SELECT user.id, user.email,
            (SELECT COUNT(*)
                FROM user_role
                WHERE user_role.user_id = user.id AND user_role.meta_role_id = ?) AS super_admin_roles
        FROM user
        WHERE user.email IN (${placeholders(count)})`,

    deleteRoles: (count: number) => `
        DELETE FROM user_role
        WHERE user_id IN (${placeholders(count)})`,

    deleteUsers: (count: number) => `
        DELETE FROM user
        WHERE id IN (${placeholders(count)})`,
} as const;
