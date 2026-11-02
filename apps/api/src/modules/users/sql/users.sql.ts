const placeholders = (count: number): string => Array.from({ length: count }, () => '?').join(', ');

const LISTED_USERS = 'FROM user WHERE status <> ?';
const STATUS_FILTER = ' AND status = ?';
const SEARCH_FILTER = ' AND (name LIKE ? OR username LIKE ? OR email LIKE ? OR mobile LIKE ?)';
const ROLE_FILTER = ' AND id IN (SELECT ur.user_id FROM user_role ur WHERE ur.status = ? AND ur.meta_role_id = ?)';

type UserListShape = {
    readonly status: boolean;
    readonly search: boolean;
    readonly role: boolean;
};

const listFilters = (filters: UserListShape): string =>
    `${LISTED_USERS}${filters.status ? STATUS_FILTER : ''}${filters.search ? SEARCH_FILTER : ''}${filters.role ? ROLE_FILTER : ''}`;

const LISTED_ROLES = 'FROM meta_role WHERE 1 = 1';
const ROLE_SEARCH_FILTER = `
        AND (name LIKE ? OR EXISTS (
            SELECT 1 FROM data_translation
            WHERE data_translation.entity_table = 'meta_role' AND data_translation.entity_id = meta_role.id
                AND data_translation.entity_column = 'name' AND data_translation.status = 1
                AND data_translation.translated_text LIKE ?
        ))`;

type RoleListShape = { readonly search: boolean };

const roleListFilters = (filters: RoleListShape): string =>
    `${LISTED_ROLES}${filters.search ? ROLE_SEARCH_FILTER : ''}`;

const pickWhere = (search: boolean): string =>
    `WHERE status = ?${search ? ' AND (name LIKE ? OR username LIKE ? OR email LIKE ? OR mobile LIKE ?)' : ''}`;

const SIGN_IN_COLUMNS =
    'id, name, username, email, mobile, password_hash AS passwordHash, password_changed_at AS passwordChangedAt, status';

export const UsersSQL = {
    insertUser: `
        INSERT INTO user (name, username, email, mobile, password_hash, status)
        VALUES (?, ?, ?, ?, ?, ?)`,

    updatePasswordHash: `
        UPDATE user
        SET password_hash = ?, password_changed_at = UTC_TIMESTAMP(), updated_by = ?
        WHERE id = ? AND status = ?`,

    findIdentifierHolders: `
        SELECT username, email, mobile
        FROM user
        WHERE username = ? OR email = ? OR (? IS NOT NULL AND mobile = ?)`,

    findSignInUserByEmail: `
        SELECT ${SIGN_IN_COLUMNS}
        FROM user
        WHERE email = ?`,

    findSignInUserByMobile: `
        SELECT ${SIGN_IN_COLUMNS}
        FROM user
        WHERE mobile = ?`,

    findSignInUserByUsername: `
        SELECT ${SIGN_IN_COLUMNS}
        FROM user
        WHERE username = ?`,

    listActiveRoles: (roleCount: number) => `
        SELECT m.id, m.name
        FROM user_role ur
        JOIN user u ON u.id = ur.user_id
        JOIN meta_role m ON m.id = ur.meta_role_id
        WHERE ur.user_id = ?
          AND ur.meta_role_id IN (${placeholders(roleCount)})
          AND ur.status = ? AND u.status = ?
        ORDER BY m.id`,

    listActiveUserIdsWithRole: `
        SELECT u.id
        FROM user_role ur
        JOIN user u ON u.id = ur.user_id
        WHERE ur.meta_role_id = ? AND ur.status = ? AND u.status = ?
        ORDER BY u.id`,

    findPasswordHashById: `
        SELECT password_hash AS passwordHash
        FROM user
        WHERE id = ? AND status = ?`,

    findUserDetail: `
        SELECT id, name, username, email, mobile, status
        FROM user
        WHERE id = ? AND status <> ?`,

    findIdentifierClashes: `
        SELECT id, username, email, mobile
        FROM user
        WHERE id <> ? AND (LOWER(username) = LOWER(?) OR email = ? OR mobile = ?)`,

    listSystemRoles: (roleCount: number) => `
        SELECT meta_role_id AS metaRoleId, status
        FROM user_role
        WHERE user_id = ? AND meta_role_id IN (${placeholders(roleCount)})`,

    updateUser: `
        UPDATE user
        SET name = ?, username = ?, email = ?, mobile = ?, updated_by = ?
        WHERE id = ? AND status <> ?`,

    updateStatus: `
        UPDATE user
        SET status = ?, updated_by = ?
        WHERE id = ? AND status <> ?`,

    setUserRoleStatus: `
        INSERT INTO user_role (user_id, meta_role_id, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?) AS incoming
        ON DUPLICATE KEY UPDATE status = incoming.status, updated_by = incoming.updated_by`,

    findUserById: `
        SELECT id, name, username, email, mobile, password_changed_at AS passwordChangedAt, status
        FROM user
        WHERE id = ?`,

    pickUsers: (search: boolean) => `
        SELECT id, name, username, email, mobile
        FROM user
        ${pickWhere(search)}
        ORDER BY name, id
        LIMIT ? OFFSET ?`,

    countPickUsers: (search: boolean) => `
        SELECT COUNT(*) AS total
        FROM user
        ${pickWhere(search)}`,

    listUsers: (filters: UserListShape) => `
        SELECT id, name, username, email, mobile, status
        ${listFilters(filters)}
        ORDER BY id DESC
        LIMIT ? OFFSET ?`,

    countUsers: (filters: UserListShape) => `
        SELECT COUNT(*) AS total
        ${listFilters(filters)}`,

    listRoleNamesOfUsers: (userCount: number) => `
        SELECT ur.user_id AS userId, ur.meta_role_id AS metaRoleId, m.name
        FROM user_role ur
        JOIN meta_role m ON m.id = ur.meta_role_id
        WHERE ur.status = ? AND ur.user_id IN (${placeholders(userCount)})
        ORDER BY ur.user_id, m.id`,

    listRoles: (filters: RoleListShape) => `
        SELECT id, name, status
        ${roleListFilters(filters)}
        ORDER BY id
        LIMIT ? OFFSET ?`,

    countRoles: (filters: RoleListShape) => `
        SELECT COUNT(*) AS total
        ${roleListFilters(filters)}`,
} as const;
