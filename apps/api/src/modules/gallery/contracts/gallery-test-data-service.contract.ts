import type { GalleryTestData, GalleryTestDataScope } from '../dto/gallery-test-data.dto';

export interface IGalleryTestDataService {
    find(scope: GalleryTestDataScope): Promise<GalleryTestData>;
    remove(found: GalleryTestData): Promise<number>;
}
