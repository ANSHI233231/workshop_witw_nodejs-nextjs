import type { PaginationQuery } from '../../../core/validation';
import type {
    GalleryConsoleFilters,
    GalleryConsolePage,
    GalleryDetailDto,
    GalleryPhotoFile,
} from '../dto/gallery.dto';

export interface IGalleryConsoleService {
    listWaiting(filters: GalleryConsoleFilters, pagination: PaginationQuery): Promise<GalleryConsolePage>;
    listApproved(filters: GalleryConsoleFilters, pagination: PaginationQuery): Promise<GalleryConsolePage>;
    detail(id: number): Promise<GalleryDetailDto>;
    approve(id: number, actorId: number): Promise<GalleryDetailDto>;
    reject(id: number, reason: string, actorId: number): Promise<GalleryDetailDto>;
    remove(id: number, reason: string, actorId: number): Promise<GalleryDetailDto>;
    photoFile(id: number, photoId: number): Promise<GalleryPhotoFile>;
}
