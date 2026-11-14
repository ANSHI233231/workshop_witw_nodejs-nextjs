import type { DemoGallery, DemoGalleryOutcome, DemoGalleryRef } from '../dto/gallery-demo.dto';

export interface IGalleryDemoService {
    existing(galleries: readonly DemoGallery[]): Promise<readonly string[]>;
    add(
        galleries: readonly DemoGallery[],
        pictures: ReadonlyMap<string, Buffer>,
        adminId: number | null,
    ): Promise<DemoGalleryOutcome[]>;
    remove(partnerIds: readonly number[], write: boolean): Promise<number>;
    galleryIdsOf(partnerIds: readonly number[]): Promise<DemoGalleryRef[]>;
}
