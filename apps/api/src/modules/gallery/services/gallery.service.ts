import type { Database } from '../../../database/connection';
import type { IGalleryRepository } from '../contracts/gallery-repository.contract';
import type { IGalleryService } from '../contracts/gallery-service.contract';
import type { ApprovedGalleryOption, GalleryCopy } from '../dto/gallery.dto';
import { toApprovedOption } from '../mappers/gallery.mapper';
import { GalleryPhotoSet, IN_USE_STATUSES } from '../types/gallery.types';
import { galleryNotFound, type GalleryRecords } from './gallery-records';

export class GalleryService implements IGalleryService {
    constructor(
        private readonly db: Database,
        private readonly repository: IGalleryRepository,
        private readonly records: GalleryRecords,
    ) {}

    async approvedGalleriesOf(partnerId: number): Promise<ApprovedGalleryOption[]> {
        const rows = await this.repository.approvedOfPartner(this.db, partnerId);
        return rows.map(toApprovedOption).sort((a, b) => a.title.localeCompare(b.title));
    }

    async approvedCopyOf(partnerId: number, galleryId: number): Promise<GalleryCopy> {
        const row = await this.repository.findById(this.db, galleryId);
        if (!row || row.partner_id !== partnerId || row.has_approved_set !== 1 || !IN_USE_STATUSES.includes(row.status)) {
            throw galleryNotFound();
        }
        const photos = (await this.repository.photosOf(this.db, galleryId)).filter(
            (photo) => photo.photo_set === GalleryPhotoSet.APPROVED,
        );
        return {
            galleryId,
            title: row.approved_title ?? row.title,
            photos: photos.map((photo) => ({
                fileName: photo.file_name,
                title: photo.title,
                caption: photo.caption,
                sortOrder: photo.sort_order,
                isThumbnail: photo.is_thumbnail === 1,
            })),
        };
    }

    async photoContent(galleryId: number, fileName: string): Promise<Buffer> {
        return (await this.records.readPhoto(galleryId, fileName)).content;
    }
}
