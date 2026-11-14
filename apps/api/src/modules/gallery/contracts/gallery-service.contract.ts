import type { ApprovedGalleryOption, GalleryCopy } from '../dto/gallery.dto';

export interface IGalleryService {
    approvedGalleriesOf(partnerId: number): Promise<ApprovedGalleryOption[]>;
    approvedCopyOf(partnerId: number, galleryId: number): Promise<GalleryCopy>;
    photoContent(galleryId: number, fileName: string): Promise<Buffer>;
}
