import type { PaginationQuery } from '../../../core/validation';
import type {
    DeleteReasonDto,
    DeleteReasonFilters,
    DeleteReasonInput,
    Page,
} from '../dto/package.dto';
import type { DeleteReasonRow, DeleteReasonStatusCode } from '../types/package.types';

export interface IDeleteReasonService {
    list(filters: DeleteReasonFilters, pagination: PaginationQuery): Promise<Page<DeleteReasonDto>>;
    active(): Promise<DeleteReasonDto[]>;
    findActive(id: number): Promise<DeleteReasonRow | undefined>;
    add(actorId: number, name: string): Promise<DeleteReasonDto>;
    update(actorId: number, id: number, input: DeleteReasonInput): Promise<DeleteReasonDto>;
    setStatus(actorId: number, id: number, status: DeleteReasonStatusCode): Promise<DeleteReasonDto>;
}
