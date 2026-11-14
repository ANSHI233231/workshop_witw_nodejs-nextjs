import type { PaginationQuery } from '../../../core/validation';
import type {
    ParkDetailDto,
    ParkDto,
    ParkFeatureImage,
    ParkFilters,
    ParkInput,
    ParkOptionDto,
    ParkPage,
    ParkStateDto,
    ParkUpdate,
} from '../dto/park.dto';
import type { ParkStatusCode } from '../types/park.types';

export interface IParkService {
    listActive(): Promise<ParkOptionDto[]>;
    findById(id: number): Promise<ParkStateDto | null>;
    list(filters: ParkFilters, pagination: PaginationQuery): Promise<ParkPage>;
    detail(id: number): Promise<ParkDetailDto>;
    create(input: ParkInput, actorId: number): Promise<ParkDto>;
    update(id: number, input: ParkUpdate, actorId: number): Promise<ParkDto>;
    setStatus(id: number, status: ParkStatusCode, actorId: number): Promise<ParkDto>;
    setFeatureImage(id: number, content: Buffer, actorId: number): Promise<ParkDto>;
    featureImage(id: number): Promise<ParkFeatureImage>;
}
