import type {
    ActiveFlagReasonDto,
    FlagReasonDto,
    FlagReasonFilters,
    FlagReasonInput,
    FlagReasonListItemDto,
    NewFlagReason,
} from '../dto/flag-reason.dto';
import type { FlagReasonStatusCode } from '../types/flag-reason.types';

export interface IFlagReasonService {
    listActive(): Promise<ActiveFlagReasonDto[]>;
    findActiveById(id: number): Promise<ActiveFlagReasonDto | null>;
    list(filters: FlagReasonFilters): Promise<FlagReasonListItemDto[]>;
    create(reason: NewFlagReason, actorId: number): Promise<FlagReasonDto>;
    update(id: number, input: FlagReasonInput, actorId: number): Promise<FlagReasonDto>;
    setStatus(id: number, status: FlagReasonStatusCode, actorId: number): Promise<FlagReasonDto>;
}
