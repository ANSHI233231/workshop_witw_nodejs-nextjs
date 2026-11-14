const inList = (count: number): string =>
    count === 0 ? 'NULL' : Array.from({ length: count }, () => '?').join(', ');

export const GalleryTestDataSQL = {
    marked: (partnerCount: number) => `
        SELECT gallery.id, gallery.partner_id, gallery.title, gallery.status
        FROM gallery
        WHERE gallery.partner_id IN (${inList(partnerCount)})
            OR gallery.title LIKE ?
            OR gallery.approved_title LIKE ?
        ORDER BY gallery.id`,

    galleriesNotIn: (count: number) => `
        SELECT gallery.id, gallery.partner_id, gallery.title, gallery.status
        FROM gallery
        WHERE gallery.id NOT IN (${inList(count)})
        ORDER BY gallery.id`,

    photosOf: (count: number) => `
        SELECT gallery_photo.id, gallery_photo.gallery_id, gallery_photo.file_name
        FROM gallery_photo
        WHERE gallery_photo.gallery_id IN (${inList(count)})
        ORDER BY gallery_photo.id`,

    usedByOtherPackages: (galleryCount: number, packageCount: number) => `
        SELECT package_version.package_id, package_version.gallery_id
        FROM package_version
        WHERE package_version.gallery_id IN (${inList(galleryCount)})
            AND package_version.package_id NOT IN (${inList(packageCount)})
        UNION
        SELECT package_version.package_id, package_version_day.gallery_id
        FROM package_version_day
        INNER JOIN package_version ON package_version.id = package_version_day.package_version_id
        WHERE package_version_day.gallery_id IN (${inList(galleryCount)})
            AND package_version.package_id NOT IN (${inList(packageCount)})`,

    deletePhotos: (count: number) => `
        DELETE FROM gallery_photo
        WHERE id IN (${inList(count)})`,

    deleteGalleries: (count: number) => `
        DELETE FROM gallery
        WHERE id IN (${inList(count)})`,
} as const;
