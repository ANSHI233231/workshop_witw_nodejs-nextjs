import type { ParkFeatureImage, WebsiteParkList, WebsiteParkPageDto, WebsiteParkQuery } from '../dto/park.dto';

export interface IParkWebsiteService {
    list(query: WebsiteParkQuery): Promise<WebsiteParkList>;
    page(slug: string): Promise<WebsiteParkPageDto>;
    featureImage(slug: string): Promise<ParkFeatureImage>;
}
