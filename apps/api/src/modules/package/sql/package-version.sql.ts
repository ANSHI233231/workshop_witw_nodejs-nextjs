import { parkNamesOf } from './package.sql';

const placeholders = (count: number): string => Array.from({ length: count }, () => '?').join(', ');

export const VERSION_COLUMNS = `v.id, v.package_id, v.version_number, v.name, v.day_count, v.safari_count, v.safari_type,
            v.vehicle, v.theme, v.stay, v.start_place, v.end_place, v.price_per_person, v.total_price,
            v.price_before_discount, v.activity_message, v.price_message, v.tag_text, v.tag_background_color,
            v.tag_text_color, v.package_image, v.banner_image, v.gallery_id, v.gallery_title, v.overview,
            v.more_inclusions, v.exclusions, v.getting_there, v.is_itinerary_saved, v.is_inclusions_saved,
            v.is_getting_there_saved, v.is_faqs_saved, v.reject_reason, v.sent_at, v.decided_at, v.replaced_at,
            v.admin_edited_at, v.deleted_at, v.created_at, v.updated_at, v.status`;

const COPIED_COLUMNS = `name, day_count, safari_count, safari_type, vehicle, theme, stay, start_place, end_place,
            price_per_person, total_price, price_before_discount, activity_message, price_message, tag_text,
            tag_background_color, tag_text_color, package_image, banner_image, gallery_id, gallery_title, overview,
            more_inclusions, exclusions, getting_there, is_itinerary_saved, is_inclusions_saved,
            is_getting_there_saved, is_faqs_saved`;

const BASIC_SET = `name = ?, day_count = ?, safari_count = ?, safari_type = ?, vehicle = ?, theme = ?, stay = ?,
            start_place = ?, end_place = ?, price_per_person = ?, total_price = ?, price_before_discount = ?,
            activity_message = ?, price_message = ?, tag_text = ?, tag_background_color = ?, tag_text_color = ?,
            overview = ?`;

export const VersionSQL = {
    findById: `
        SELECT ${VERSION_COLUMNS}
        FROM package_version v
        WHERE v.id = ? AND v.package_id = ?`,

    versionsOf: `
        SELECT ${VERSION_COLUMNS}
        FROM package_version v
        WHERE v.package_id = ?
        ORDER BY v.version_number DESC`,

    byIds: (count: number) => `
        SELECT ${VERSION_COLUMNS}
        FROM package_version v
        WHERE v.id IN (${placeholders(count)})`,

    nextNumber: 'SELECT COALESCE(MAX(version_number), 0) + 1 AS total FROM package_version WHERE package_id = ?',

    parksOf: (count: number) => `
        SELECT pvp.package_version_id, pvp.master_park_id, pvp.sort_order, mp.name, mp.slug, mp.feature_image
        FROM package_version_park pvp
        LEFT JOIN master_park mp ON mp.id = pvp.master_park_id
        WHERE pvp.package_version_id IN (${placeholders(count)}) AND pvp.status = ?
        ORDER BY pvp.sort_order, pvp.id`,

    featuresOf: (count: number) => `
        SELECT package_version_id, feature AS code, 1 AS is_included
        FROM package_version_feature
        WHERE package_version_id IN (${placeholders(count)}) AND status = ?
        ORDER BY feature`,

    inclusionsOf: (count: number) => `
        SELECT package_version_id, inclusion AS code, is_included
        FROM package_version_inclusion
        WHERE package_version_id IN (${placeholders(count)}) AND status = ?
        ORDER BY inclusion`,

    daysOf: `
        SELECT id, package_version_id, day_number, title, description, start_location, end_location, hotel_name,
            has_breakfast, has_lunch, has_dinner, activity, accommodation, note, day_image, gallery_id, gallery_title
        FROM package_version_day
        WHERE package_version_id = ? AND status = ?
        ORDER BY day_number, id`,

    faqsOf: `
        SELECT id, question, answer, sort_order
        FROM package_version_faq
        WHERE package_version_id = ? AND status = ?
        ORDER BY sort_order, id`,

    photosOf: `
        SELECT id, package_version_id, package_version_day_id, file_name, title, caption, sort_order, status
        FROM package_version_photo
        WHERE package_version_id = ?
        ORDER BY sort_order, id`,

    insert: `
        INSERT INTO package_version
            (package_id, version_number, ${BASIC_SET.replace(/ = \?/g, '')}, status, created_by, updated_by)
        VALUES (${placeholders(23)})`,

    copyFrom: `
        INSERT INTO package_version (package_id, version_number, ${COPIED_COLUMNS}, status, created_by, updated_by)
        SELECT package_id, ?, ${COPIED_COLUMNS}, ?, ?, ?
        FROM package_version
        WHERE id = ?`,

    touchByPartner: (statusCount: number) => `
        UPDATE package_version
        SET status = ?, updated_by = ?
        WHERE id = ? AND status IN (${placeholders(statusCount)})`,

    touchByAdmin: (statusCount: number) => `
        UPDATE package_version
        SET admin_edited_at = UTC_TIMESTAMP(), admin_edited_by = ?, updated_by = ?
        WHERE id = ? AND status IN (${placeholders(statusCount)})`,

    updateBasic: `
        UPDATE package_version
        SET ${BASIC_SET}, updated_by = ?
        WHERE id = ?`,

    setGallery: `
        UPDATE package_version
        SET gallery_id = ?, gallery_title = ?, updated_by = ?
        WHERE id = ?`,

    setImage: (column: 'package_image' | 'banner_image') => `
        UPDATE package_version
        SET ${column} = ?, updated_by = ?
        WHERE id = ?`,

    markItinerarySaved: 'UPDATE package_version SET is_itinerary_saved = 1, updated_by = ? WHERE id = ?',

    updateInclusionTexts: `
        UPDATE package_version
        SET more_inclusions = ?, exclusions = ?, is_inclusions_saved = 1, updated_by = ?
        WHERE id = ?`,

    updateGettingThere: `
        UPDATE package_version
        SET getting_there = ?, is_getting_there_saved = 1, updated_by = ?
        WHERE id = ?`,

    markFaqsSaved: 'UPDATE package_version SET is_faqs_saved = 1, updated_by = ? WHERE id = ?',

    send: (statusCount: number) => `
        UPDATE package_version
        SET status = ?, sent_at = UTC_TIMESTAMP(), updated_by = ?
        WHERE id = ? AND status IN (${placeholders(statusCount)})`,

    discard: (statusCount: number) => `
        UPDATE package_version
        SET status = ?, deleted_at = UTC_TIMESTAMP(), deleted_by = ?, updated_by = ?
        WHERE id = ? AND status IN (${placeholders(statusCount)})`,

    replaceLive: `
        UPDATE package_version
        SET status = ?, replaced_at = UTC_TIMESTAMP(), updated_by = ?
        WHERE package_id = ? AND status = ?`,

    approve: `
        UPDATE package_version
        SET status = ?, decided_at = UTC_TIMESTAMP(), decided_by = ?, updated_by = ?
        WHERE id = ? AND status = ?`,

    reject: `
        UPDATE package_version
        SET status = ?, reject_reason = ?, decided_at = UTC_TIMESTAMP(), decided_by = ?, updated_by = ?
        WHERE id = ? AND status = ?`,

    clearParks: 'UPDATE package_version_park SET status = ?, updated_by = ? WHERE package_version_id = ?',

    upsertPark: `
        INSERT INTO package_version_park (package_version_id, master_park_id, sort_order, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?) AS incoming
        ON DUPLICATE KEY UPDATE sort_order = incoming.sort_order, status = incoming.status,
            updated_by = incoming.updated_by`,

    clearFeatures: 'UPDATE package_version_feature SET status = ?, updated_by = ? WHERE package_version_id = ?',

    upsertFeature: `
        INSERT INTO package_version_feature (package_version_id, feature, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?) AS incoming
        ON DUPLICATE KEY UPDATE status = incoming.status, updated_by = incoming.updated_by`,

    clearInclusions: 'UPDATE package_version_inclusion SET status = ?, updated_by = ? WHERE package_version_id = ?',

    upsertInclusion: `
        INSERT INTO package_version_inclusion (package_version_id, inclusion, is_included, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?) AS incoming
        ON DUPLICATE KEY UPDATE is_included = incoming.is_included, status = incoming.status,
            updated_by = incoming.updated_by`,

    insertDay: `
        INSERT INTO package_version_day
            (package_version_id, day_number, title, description, start_location, end_location, hotel_name,
             has_breakfast, has_lunch, has_dinner, activity, accommodation, note, day_image, gallery_id, gallery_title,
             status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    updateDay: `
        UPDATE package_version_day
        SET title = ?, description = ?, start_location = ?, end_location = ?, hotel_name = ?, has_breakfast = ?,
            has_lunch = ?, has_dinner = ?, activity = ?, accommodation = ?, note = ?, gallery_id = ?, gallery_title = ?,
            updated_by = ?
        WHERE id = ? AND package_version_id = ? AND status = ?`,

    setDayImage: `
        UPDATE package_version_day
        SET day_image = ?, updated_by = ?
        WHERE id = ? AND package_version_id = ? AND status = ?`,

    removeDaysAfter: `
        UPDATE package_version_day
        SET status = ?, updated_by = ?
        WHERE package_version_id = ? AND day_number > ? AND status = ?`,

    tickAllMeals: `
        UPDATE package_version_day
        SET has_breakfast = 1, has_lunch = 1, has_dinner = 1, updated_by = ?
        WHERE package_version_id = ? AND status = ?`,

    clearFaqs: 'UPDATE package_version_faq SET status = ?, updated_by = ? WHERE package_version_id = ? AND status = ?',

    insertFaq: `
        INSERT INTO package_version_faq (package_version_id, question, answer, sort_order, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,

    clearVersionPhotos: `
        UPDATE package_version_photo
        SET status = ?, updated_by = ?
        WHERE package_version_id = ? AND package_version_day_id IS NULL AND status = ?`,

    clearDayPhotos: `
        UPDATE package_version_photo
        SET status = ?, updated_by = ?
        WHERE package_version_id = ? AND package_version_day_id = ? AND status = ?`,

    clearPhotosOfRemovedDays: `
        UPDATE package_version_photo ph
        JOIN package_version_day d ON d.id = ph.package_version_day_id
        SET ph.status = ?, ph.updated_by = ?
        WHERE ph.package_version_id = ? AND d.status = ? AND ph.status = ?`,

    insertPhoto: `
        INSERT INTO package_version_photo
            (package_version_id, package_version_day_id, file_name, title, caption, sort_order, status, created_by,
             updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    copyParks: `
        INSERT INTO package_version_park (package_version_id, master_park_id, sort_order, status, created_by, updated_by)
        SELECT ?, master_park_id, sort_order, status, ?, ?
        FROM package_version_park
        WHERE package_version_id = ? AND status = ?`,

    copyFeatures: `
        INSERT INTO package_version_feature (package_version_id, feature, status, created_by, updated_by)
        SELECT ?, feature, status, ?, ?
        FROM package_version_feature
        WHERE package_version_id = ? AND status = ?`,

    copyInclusions: `
        INSERT INTO package_version_inclusion (package_version_id, inclusion, is_included, status, created_by, updated_by)
        SELECT ?, inclusion, is_included, status, ?, ?
        FROM package_version_inclusion
        WHERE package_version_id = ? AND status = ?`,

    copyFaqs: `
        INSERT INTO package_version_faq (package_version_id, question, answer, sort_order, status, created_by, updated_by)
        SELECT ?, question, answer, sort_order, status, ?, ?
        FROM package_version_faq
        WHERE package_version_id = ? AND status = ?`,

    copyPhotos: `
        INSERT INTO package_version_photo
            (package_version_id, package_version_day_id, file_name, title, caption, sort_order, status, created_by,
             updated_by)
        SELECT ?, ?, file_name, title, caption, sort_order, status, ?, ?
        FROM package_version_photo
        WHERE package_version_id = ? AND package_version_day_id <=> ? AND status = ?`,

    waitingList: (search: boolean, statusCount: number) => `
        SELECT v.id AS version_id, v.package_id, v.version_number, v.name, ${parkNamesOf('v.id')} AS park_names,
            v.package_image,
            partner.business_name, p.partner_id, live.version_number AS live_version_number, v.sent_at
        FROM package_version v
        JOIN package p ON p.id = v.package_id
        LEFT JOIN partner ON partner.id = p.partner_id
        LEFT JOIN package_version live ON live.live_version_key = p.id
        WHERE v.status = ? AND p.website_status IN (${placeholders(statusCount)})
            ${search ? 'AND (v.name LIKE ? OR partner.business_name LIKE ?)' : ''}
        ORDER BY v.sent_at, v.id
        LIMIT ? OFFSET ?`,

    waitingCount: (search: boolean, statusCount: number) => `
        SELECT COUNT(*) AS total
        FROM package_version v
        JOIN package p ON p.id = v.package_id
        LEFT JOIN partner ON partner.id = p.partner_id
        WHERE v.status = ? AND p.website_status IN (${placeholders(statusCount)})
            ${search ? 'AND (v.name LIKE ? OR partner.business_name LIKE ?)' : ''}`,

    insertDemo: `
        INSERT INTO package_version
            (package_id, version_number, ${BASIC_SET.replace(/ = \?/g, '')}, package_image, banner_image, gallery_id,
             gallery_title, more_inclusions, exclusions, getting_there, is_itinerary_saved, is_inclusions_saved,
             is_getting_there_saved, is_faqs_saved, reject_reason, sent_at, decided_at, decided_by, replaced_at, status,
             created_at, created_by, updated_by)
        VALUES (${placeholders(40)})`,
} as const;
