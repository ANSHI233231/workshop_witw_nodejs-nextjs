const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

export const ProfileTestDataSQL = {
    ofUsers: (count: number) => `
        SELECT id, user_id, photo, cover_photo
        FROM user_profile
        WHERE user_id IN (${inList(count)})
        ORDER BY id`,

    deleteProfiles: (count: number) => `
        DELETE FROM user_profile
        WHERE id IN (${inList(count)})`,
} as const;
