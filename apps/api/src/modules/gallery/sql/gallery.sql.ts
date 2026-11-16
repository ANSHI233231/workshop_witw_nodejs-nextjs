const placeholders = (count: number): string => Array.from({ length: count }, () => '?').join(', ');

const GALLERY_COLUMNS = `gallery.id, gallery.partner_id, gallery.master_park_id, master_park.name AS park_name,
            partner.business_name, gallery.title, gallery.approved_title, gallery.has_approved_set,
            gallery.reject_reason, gallery.delete_reason, gallery.sent_at, gallery.decided_at, gallery.created_at,
            gallery.status`;

const SET_SUMMARY = `
            (SELECT COUNT(*)
                FROM gallery_photo
                WHERE gallery_photo.gallery_id = gallery.id AND gallery_photo.photo_set = ? AND gallery_photo.status = ?)
                AS photo_count,
            (SELECT gallery_photo.id
                FROM gallery_photo
                WHERE gallery_photo.gallery_id = gallery.id AND gallery_photo.photo_set = ? AND gallery_photo.status = ?
                ORDER BY gallery_photo.is_thumbnail DESC, gallery_photo.sort_order, gallery_photo.id
                LIMIT 1) AS thumbnail_photo_id,
            (SELECT gallery_photo.file_name
                FROM gallery_photo
                WHERE gallery_photo.gallery_id = gallery.id AND gallery_photo.photo_set = ? AND gallery_photo.status = ?
                ORDER BY gallery_photo.is_thumbnail DESC, gallery_photo.sort_order, gallery_photo.id
                LIMIT 1) AS thumbnail_file_name`;

const FROM_GALLERY = `
        FROM gallery
        LEFT JOIN master_park ON master_park.id = gallery.master_park_id
        LEFT JOIN partner ON partner.id = gallery.partner_id`;

export type GalleryListWhere = 'approved' | 'status';

const consoleWhere = (where: GalleryListWhere, statusCount: number, search: boolean): string =>
    [
        where === 'approved'
            ? `WHERE gallery.has_approved_set = 1 AND gallery.status IN (${placeholders(statusCount)})`
            : `WHERE gallery.status IN (${placeholders(statusCount)})`,
        search ? ' AND (gallery.title LIKE ? OR gallery.approved_title LIKE ? OR partner.business_name LIKE ?)' : '',
    ].join('');

export const GallerySQL = {
    listOfPartner: (where: GalleryListWhere, statusCount: number) => `
        SELECT ${GALLERY_COLUMNS}, ${SET_SUMMARY}
        ${FROM_GALLERY}
        ${consoleWhere(where, statusCount, false)} AND gallery.partner_id = ?
        ORDER BY gallery.updated_at DESC, gallery.id DESC`,

    tabCountsOfPartner: (statusCount: number) => `
        SELECT
            SUM(gallery.has_approved_set = 1) AS approved,
            SUM(gallery.status = ?) AS draft,
            SUM(gallery.status = ?) AS waiting
        FROM gallery
        WHERE gallery.partner_id = ? AND gallery.status IN (${placeholders(statusCount)})`,

    listForConsole: (where: GalleryListWhere, statusCount: number, search: boolean) => `
        SELECT ${GALLERY_COLUMNS}, ${SET_SUMMARY}
        ${FROM_GALLERY}
        ${consoleWhere(where, statusCount, search)}
        ORDER BY ${where === 'approved' ? 'gallery.decided_at DESC, gallery.id DESC' : 'gallery.sent_at, gallery.id'}
        LIMIT ? OFFSET ?`,

    countForConsole: (where: GalleryListWhere, statusCount: number, search: boolean) => `
        SELECT COUNT(*) AS total
        ${FROM_GALLERY}
        ${consoleWhere(where, statusCount, search)}`,

    findById: `
        SELECT ${GALLERY_COLUMNS}
        ${FROM_GALLERY}
        WHERE gallery.id = ?`,

    findByPartnerAndTitle: `
        SELECT ${GALLERY_COLUMNS}
        ${FROM_GALLERY}
        WHERE gallery.partner_id = ? AND gallery.title = ? AND gallery.status <> ?
        LIMIT 1`,

    photosOf: `
        SELECT id, gallery_id, photo_set, file_name, title, caption, sort_order, is_thumbnail
        FROM gallery_photo
        WHERE gallery_id = ? AND status = ?
        ORDER BY photo_set, sort_order, id`,

    insert: `
        INSERT INTO gallery (partner_id, master_park_id, title, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?)`,

    insertDemo: `
        INSERT INTO gallery
            (partner_id, master_park_id, title, approved_title, has_approved_set, reject_reason, sent_at, decided_at,
             decided_by, status, created_at, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    updateDraft: `
        UPDATE gallery
        SET title = ?, master_park_id = ?, updated_by = ?
        WHERE id = ? AND status = ?`,

    send: `
        UPDATE gallery
        SET status = ?, sent_at = UTC_TIMESTAMP(), updated_by = ?
        WHERE id = ? AND status = ?`,

    moveBack: `
        UPDATE gallery
        SET status = ?, updated_by = ?
        WHERE id = ? AND status = ?`,

    startEdit: `
        UPDATE gallery
        SET status = ?, reject_reason = NULL, approved_title = COALESCE(approved_title, title), updated_by = ?
        WHERE id = ? AND status = ? AND has_approved_set = 1`,

    restoreApproved: `
        UPDATE gallery
        SET status = ?, title = COALESCE(approved_title, title), reject_reason = NULL, updated_by = ?
        WHERE id = ? AND status = ? AND has_approved_set = 1`,

    discard: `
        UPDATE gallery
        SET status = ?, deleted_at = UTC_TIMESTAMP(), deleted_by = ?, updated_by = ?
        WHERE id = ? AND status = ? AND has_approved_set = 0`,

    approve: `
        UPDATE gallery
        SET status = ?, has_approved_set = 1, approved_title = title, reject_reason = NULL,
            decided_at = UTC_TIMESTAMP(), decided_by = ?, updated_by = ?
        WHERE id = ? AND status = ?`,

    reject: `
        UPDATE gallery
        SET status = ?, reject_reason = ?,
            decided_at = IF(has_approved_set = 1, decided_at, UTC_TIMESTAMP()),
            decided_by = IF(has_approved_set = 1, decided_by, ?), updated_by = ?
        WHERE id = ? AND status = ?`,

    deleteByAdmin: (statusCount: number) => `
        UPDATE gallery
        SET status = ?, delete_reason = ?, deleted_at = UTC_TIMESTAMP(), deleted_by = ?, updated_by = ?
        WHERE id = ? AND has_approved_set = 1 AND status IN (${placeholders(statusCount)})`,

    insertPhoto: `
        INSERT INTO gallery_photo
            (gallery_id, photo_set, file_name, title, caption, sort_order, is_thumbnail, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    updatePhoto: `
        UPDATE gallery_photo
        SET title = ?, caption = ?, sort_order = ?, is_thumbnail = ?, updated_by = ?
        WHERE id = ? AND gallery_id = ? AND photo_set = ? AND status = ?`,

    replacePhotoFile: `
        UPDATE gallery_photo
        SET file_name = ?, updated_by = ?
        WHERE id = ? AND gallery_id = ? AND photo_set = ? AND status = ?`,

    removePhotos: (count: number) => `
        UPDATE gallery_photo
        SET status = ?, updated_by = ?
        WHERE gallery_id = ? AND photo_set = ? AND status = ? AND id IN (${placeholders(count)})`,

    removeSet: `
        UPDATE gallery_photo
        SET status = ?, updated_by = ?
        WHERE gallery_id = ? AND photo_set = ? AND status = ?`,

    copyApprovedToDraft: `
        INSERT INTO gallery_photo
            (gallery_id, photo_set, file_name, title, caption, sort_order, is_thumbnail, status, created_by, updated_by)
        SELECT gallery_id, ?, file_name, title, caption, sort_order, is_thumbnail, status, ?, ?
        FROM gallery_photo
        WHERE gallery_id = ? AND photo_set = ? AND status = ?
        ORDER BY sort_order, id`,

    promoteDraftSet: `
        UPDATE gallery_photo
        SET photo_set = ?, updated_by = ?
        WHERE gallery_id = ? AND photo_set = ? AND status = ?`,

    nextSortOrder: `
        SELECT COALESCE(MAX(sort_order) + 1, 0) AS total
        FROM gallery_photo
        WHERE gallery_id = ? AND photo_set = ? AND status = ?`,

    thumbnailCount: `
        SELECT COUNT(*) AS total
        FROM gallery_photo
        WHERE gallery_id = ? AND photo_set = ? AND status = ? AND is_thumbnail = 1`,

    galleriesOfPartners: (count: number) => `
        SELECT ${GALLERY_COLUMNS}
        ${FROM_GALLERY}
        WHERE gallery.partner_id IN (${placeholders(count)})`,

    deletePhotosOfGalleries: (count: number) => `
        DELETE FROM gallery_photo
        WHERE gallery_id IN (${placeholders(count)})`,

    deleteGalleries: (count: number) => `
        DELETE FROM gallery
        WHERE id IN (${placeholders(count)})`,
} as const;
