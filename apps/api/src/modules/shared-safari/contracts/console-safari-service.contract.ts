import type {
    AdminDeleteInput,
    ConsoleFilters,
    ConsoleSafariDetailDto,
    ConsoleSafariDto,
    CoverImage,
    FlagDto,
    FlaggedCommentDto,
    Paged,
} from '../dto/shared-safari.dto';

export interface IConsoleSafariService {
    list(filters: ConsoleFilters, page: number, limit: number): Promise<Paged<ConsoleSafariDto>>;
    hosts(): Promise<{ id: number; name: string }[]>;
    detail(id: number): Promise<ConsoleSafariDetailDto>;
    cover(id: number): Promise<CoverImage>;
    remove(id: number, input: AdminDeleteInput, actorId: number): Promise<void>;
    makeActive(id: number, actorId: number): Promise<void>;
    setPinned(id: number, pinned: boolean, actorId: number): Promise<void>;
    removeComment(commentId: number, actorId: number): Promise<void>;
    ignoreFlags(commentId: number, actorId: number): Promise<void>;
    flagged(search: string | undefined, page: number, limit: number): Promise<Paged<FlaggedCommentDto>>;
    flagsOf(commentId: number): Promise<{ comment: { id: number; text: string; writer: string }; flags: FlagDto[] }>;
}
