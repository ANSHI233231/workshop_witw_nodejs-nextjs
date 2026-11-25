const PROFILE_COLUMNS = `id, user_id, DATE_FORMAT(date_of_birth, '%Y-%m-%d') AS date_of_birth, gender, bio, about,
            facebook_url, x_url, instagram_url, youtube_url, photo, cover_photo`;

export const UserProfileSQL = {
    findByUserId: `
        SELECT ${PROFILE_COLUMNS}
        FROM user_profile
        WHERE user_id = ?`,

    saveGeneral: `
        INSERT INTO user_profile
            (user_id, date_of_birth, gender, bio, about, facebook_url, x_url, instagram_url, youtube_url, created_by,
             updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) AS incoming
        ON DUPLICATE KEY UPDATE
            date_of_birth = incoming.date_of_birth,
            gender = incoming.gender,
            bio = incoming.bio,
            about = incoming.about,
            facebook_url = incoming.facebook_url,
            x_url = incoming.x_url,
            instagram_url = incoming.instagram_url,
            youtube_url = incoming.youtube_url,
            updated_by = incoming.updated_by`,

    saveBirthAndGender: `
        INSERT INTO user_profile (user_id, date_of_birth, gender, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?) AS incoming
        ON DUPLICATE KEY UPDATE
            date_of_birth = incoming.date_of_birth,
            gender = incoming.gender,
            updated_by = incoming.updated_by`,

    savePhoto: `
        INSERT INTO user_profile (user_id, photo, created_by, updated_by)
        VALUES (?, ?, ?, ?) AS incoming
        ON DUPLICATE KEY UPDATE photo = incoming.photo, updated_by = incoming.updated_by`,

    saveCoverPhoto: `
        INSERT INTO user_profile (user_id, cover_photo, created_by, updated_by)
        VALUES (?, ?, ?, ?) AS incoming
        ON DUPLICATE KEY UPDATE cover_photo = incoming.cover_photo, updated_by = incoming.updated_by`,
} as const;
