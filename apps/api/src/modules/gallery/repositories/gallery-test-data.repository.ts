import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import { GalleryTestDataSQL } from '../sql/gallery-test-data.sql';

const startsWith = (text: string): string => `${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

export interface TestGalleryRow extends RowDataPacket {
    id: number;
    partner_id: number;
    title: string;
    status: number;
}

export interface TestGalleryPhotoRow extends RowDataPacket {
    id: number;
    gallery_id: number;
    file_name: string;
}

export interface GalleryUseRow extends RowDataPacket {
    package_id: number;
    gallery_id: number;
}

export class GalleryTestDataRepository {
    async marked(db: DbExecutor, partnerIds: readonly number[], textPrefix: string): Promise<TestGalleryRow[]> {
        const pattern = startsWith(textPrefix);
        return db.query<TestGalleryRow>(GalleryTestDataSQL.marked(partnerIds.length), [...partnerIds, pattern, pattern]);
    }

    async galleriesNotIn(db: DbExecutor, galleryIds: readonly number[]): Promise<TestGalleryRow[]> {
        return db.query<TestGalleryRow>(GalleryTestDataSQL.galleriesNotIn(galleryIds.length), galleryIds);
    }

    async photosOf(db: DbExecutor, galleryIds: readonly number[]): Promise<TestGalleryPhotoRow[]> {
        if (galleryIds.length === 0) return [];
        return db.query<TestGalleryPhotoRow>(GalleryTestDataSQL.photosOf(galleryIds.length), galleryIds);
    }

    async usedByOtherPackages(
        db: DbExecutor,
        galleryIds: readonly number[],
        packageIds: readonly number[],
    ): Promise<GalleryUseRow[]> {
        if (galleryIds.length === 0) return [];
        return db.query<GalleryUseRow>(GalleryTestDataSQL.usedByOtherPackages(galleryIds.length, packageIds.length), [
            ...galleryIds,
            ...packageIds,
            ...galleryIds,
            ...packageIds,
        ]);
    }

    async deleteGalleries(db: DbExecutor, galleryIds: readonly number[], photoIds: readonly number[]): Promise<number> {
        if (photoIds.length > 0) await db.execute(GalleryTestDataSQL.deletePhotos(photoIds.length), photoIds);
        if (galleryIds.length === 0) return 0;
        return (await db.execute(GalleryTestDataSQL.deleteGalleries(galleryIds.length), galleryIds)).affectedRows;
    }
}
