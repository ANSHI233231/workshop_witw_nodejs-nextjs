import type {
    DeletedDraft,
    GalleryDetailDto,
    GalleryDraft,
    GalleryPhotoFile,
    GalleryTabList,
    IncomingPhoto,
    NewGallery,
} from '../dto/gallery.dto';
import type { GalleryTabKey } from '../types/gallery.types';

export interface IGalleryPortalService {
    list(userId: number, tab: GalleryTabKey): Promise<GalleryTabList>;
    detail(userId: number, id: number): Promise<GalleryDetailDto>;
    create(userId: number, gallery: NewGallery): Promise<GalleryDetailDto>;
    saveDraft(userId: number, id: number, draft: GalleryDraft): Promise<GalleryDetailDto>;
    addPhotos(userId: number, id: number, photos: readonly IncomingPhoto[]): Promise<GalleryDetailDto>;
    replacePhoto(userId: number, id: number, photoId: number, photo: IncomingPhoto): Promise<GalleryDetailDto>;
    removePhoto(userId: number, id: number, photoId: number): Promise<GalleryDetailDto>;
    send(userId: number, id: number): Promise<GalleryDetailDto>;
    moveBack(userId: number, id: number): Promise<GalleryDetailDto>;
    startEdit(userId: number, id: number): Promise<GalleryDetailDto>;
    deleteDraft(userId: number, id: number): Promise<DeletedDraft>;
    photoFile(userId: number, id: number, photoId: number): Promise<GalleryPhotoFile>;
}
