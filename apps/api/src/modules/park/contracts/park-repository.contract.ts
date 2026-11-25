import type { PaginationQuery } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { ParkFilters, ParkInput, ParkUpdate, WebsiteParkQuery } from '../dto/park.dto';
import type {
    FeatureImageRow,
    ParkDetailRow,
    ParkOptionRow,
    ParkRow,
    ParkStateRow,
    ParkStatusCode,
    UpcomingSafariRow,
    WebsiteParkPageRow,
    WebsiteParkRow,
} from '../types/park.types';

export interface IParkRepository {
    list(db: DbExecutor, filters: ParkFilters, pagination: PaginationQuery, today: string): Promise<ParkRow[]>;
    count(db: DbExecutor, filters: ParkFilters): Promise<number>;
    listActive(db: DbExecutor): Promise<ParkOptionRow[]>;
    findState(db: DbExecutor, id: number): Promise<ParkStateRow | undefined>;
    findById(db: DbExecutor, id: number, today: string): Promise<ParkDetailRow | undefined>;
    upcomingSafaris(db: DbExecutor, id: number, today: string): Promise<UpcomingSafariRow[]>;
    findOtherByName(db: DbExecutor, name: string, exceptId: number): Promise<ParkStateRow | undefined>;
    slugTaken(db: DbExecutor, slug: string): Promise<boolean>;
    insert(db: DbExecutor, input: ParkInput, slug: string, actorId: number): Promise<number>;
    update(db: DbExecutor, id: number, input: ParkUpdate, actorId: number): Promise<void>;
    updateStatus(db: DbExecutor, id: number, status: ParkStatusCode, actorId: number): Promise<void>;
    updateFeatureImage(db: DbExecutor, id: number, fileName: string, actorId: number): Promise<void>;
    featureImageById(db: DbExecutor, id: number): Promise<FeatureImageRow | undefined>;
    featureImageOfActive(db: DbExecutor, slug: string): Promise<FeatureImageRow | undefined>;
    websiteList(db: DbExecutor, query: WebsiteParkQuery, limit: number): Promise<WebsiteParkRow[]>;
    websiteCount(db: DbExecutor, query: WebsiteParkQuery): Promise<number>;
    websiteCardsByIds(db: DbExecutor, ids: readonly number[]): Promise<WebsiteParkRow[]>;
    websitePage(db: DbExecutor, slug: string): Promise<WebsiteParkPageRow | undefined>;
}
