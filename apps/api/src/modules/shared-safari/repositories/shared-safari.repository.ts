import type { DbExecutor } from '../../../database/connection';
import type { ConsoleFilters, PublicFilters, SafariInput } from '../dto/shared-safari.dto';
import { DiscussionSQL } from '../sql/discussion.sql';
import { type ConsoleListShape, type PublicListShape, SharedSafariSQL } from '../sql/shared-safari.sql';
import {
    type CommentRow,
    CommentFlagStatus,
    type CountRow,
    type FaceRow,
    type FlaggedRow,
    type FlagRow,
    type HostOptionRow,
    type IdRow,
    type MemberRow,
    type SafariRow,
    ACTIVE_USER as UserActive,
    SharedSafariCommentStatus,
    SharedSafariMemberStatus,
    SharedSafariStatus,
    SortKey,
    type SortKeyCode,
} from '../types/shared-safari.types';

const likeAnywhere = (text: string): string => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

const ORDER_OF: Readonly<Record<SortKeyCode, string>> = {
    [SortKey.NEWEST]: 's.created_at DESC, s.id DESC',
    [SortKey.MOST_SAFARIS]: 's.safari_count DESC, s.created_at DESC, s.id DESC',
    [SortKey.FEWEST_SAFARIS]: 's.safari_count ASC, s.created_at DESC, s.id DESC',
    [SortKey.PRICE_LOW]: 's.price_per_person_min ASC, s.created_at DESC, s.id DESC',
    [SortKey.STARTING_SOONEST]: 's.start_date ASC, s.id ASC',
    [SortKey.STARTING_LATEST]: 's.start_date DESC, s.id DESC',
};

const COUNT_PARAMS: readonly unknown[] = [
    SharedSafariMemberStatus.JOINED,
    UserActive,
    SharedSafariMemberStatus.LEFT,
    SharedSafariCommentStatus.ACTIVE,
    UserActive,
];

const FLAG_COUNT_PARAMS: readonly unknown[] = [CommentFlagStatus.OPEN, UserActive];

const publicShape = (filters: PublicFilters): PublicListShape => ({
    park: filters.parkId !== undefined,
    month: filters.month !== undefined,
    priceMin: filters.priceMin !== undefined,
    priceMax: filters.priceMax !== undefined,
    safarisMin: filters.safarisMin !== undefined,
    safarisMax: filters.safarisMax !== undefined,
    themes: filters.themes.length,
    stays: filters.stays.length,
    order: ORDER_OF[filters.sort],
});

const publicValues = (filters: PublicFilters, today: string): unknown[] => [
    SharedSafariStatus.ACTIVE,
    SharedSafariStatus.SEAT_FULL,
    today,
    UserActive,
    ...(filters.parkId !== undefined ? [filters.parkId] : []),
    ...(filters.month !== undefined ? [filters.month] : []),
    ...(filters.priceMin !== undefined ? [filters.priceMin] : []),
    ...(filters.priceMax !== undefined ? [filters.priceMax] : []),
    ...(filters.safarisMin !== undefined ? [filters.safarisMin] : []),
    ...(filters.safarisMax !== undefined ? [filters.safarisMax] : []),
    ...filters.themes,
    ...filters.stays,
];

const consoleShape = (filters: ConsoleFilters): ConsoleListShape => ({
    search: filters.search !== undefined,
    status: filters.status !== undefined,
    host: filters.hostId !== undefined,
});

const consoleValues = (filters: ConsoleFilters): unknown[] => [
    ...(filters.search !== undefined ? [likeAnywhere(filters.search), likeAnywhere(filters.search)] : []),
    ...(filters.status !== undefined ? [filters.status] : []),
    ...(filters.hostId !== undefined ? [filters.hostId] : []),
];

const safariValues = (input: SafariInput): unknown[] => [
    input.masterParkId,
    input.title,
    input.theme,
    input.startDate,
    input.endDate,
    input.safariCount,
    input.totalSeats,
    input.sharedSeats,
    input.pricePerPersonMin,
    input.pricePerPersonMax,
    input.stayCategory,
    input.safariPlan,
];

export class SharedSafariRepository {
    async publicList(
        db: DbExecutor,
        filters: PublicFilters,
        today: string,
        limit: number,
        offset: number,
    ): Promise<SafariRow[]> {
        return db.query<SafariRow>(SharedSafariSQL.publicList(publicShape(filters)), [
            ...COUNT_PARAMS,
            ...publicValues(filters, today),
            limit,
            offset,
        ]);
    }

    async publicCount(db: DbExecutor, filters: PublicFilters, today: string): Promise<number> {
        const rows = await db.query<CountRow>(
            SharedSafariSQL.publicCount(publicShape(filters)),
            publicValues(filters, today),
        );
        return Number(rows[0]?.total ?? 0);
    }

    async publicTotal(db: DbExecutor, today: string): Promise<number> {
        const rows = await db.query<CountRow>(SharedSafariSQL.publicTotal, [
            SharedSafariStatus.ACTIVE,
            SharedSafariStatus.SEAT_FULL,
            today,
            UserActive,
        ]);
        return Number(rows[0]?.total ?? 0);
    }

    async findById(db: DbExecutor, id: number): Promise<SafariRow | undefined> {
        return (await db.query<SafariRow>(SharedSafariSQL.findById, [...COUNT_PARAMS, id]))[0];
    }

    async findBySlug(db: DbExecutor, slug: string): Promise<SafariRow | undefined> {
        return (await db.query<SafariRow>(SharedSafariSQL.findBySlug, [...COUNT_PARAMS, slug]))[0];
    }

    async slugTaken(db: DbExecutor, slug: string): Promise<boolean> {
        return (await db.query<IdRow>(SharedSafariSQL.slugTaken, [slug])).length > 0;
    }

    async organisedBy(db: DbExecutor, userId: number): Promise<SafariRow[]> {
        return db.query<SafariRow>(SharedSafariSQL.organisedBy, [
            ...COUNT_PARAMS,
            userId,
            SharedSafariStatus.ACTIVE,
            SharedSafariStatus.SEAT_FULL,
            SharedSafariStatus.INACTIVE,
            UserActive,
        ]);
    }

    async joinedBy(db: DbExecutor, userId: number): Promise<SafariRow[]> {
        return db.query<SafariRow>(SharedSafariSQL.joinedBy, [
            ...COUNT_PARAMS,
            userId,
            SharedSafariMemberStatus.JOINED,
            SharedSafariStatus.ACTIVE,
            SharedSafariStatus.SEAT_FULL,
            UserActive,
        ]);
    }

    async consoleList(db: DbExecutor, filters: ConsoleFilters, limit: number, offset: number): Promise<SafariRow[]> {
        return db.query<SafariRow>(SharedSafariSQL.consoleList(consoleShape(filters)), [
            ...COUNT_PARAMS,
            ...consoleValues(filters),
            limit,
            offset,
        ]);
    }

    async consoleCount(db: DbExecutor, filters: ConsoleFilters): Promise<number> {
        const rows = await db.query<CountRow>(
            SharedSafariSQL.consoleCount(consoleShape(filters)),
            consoleValues(filters),
        );
        return Number(rows[0]?.total ?? 0);
    }

    async hostOptions(db: DbExecutor): Promise<HostOptionRow[]> {
        return db.query<HostOptionRow>(SharedSafariSQL.hostOptions);
    }

    async insert(db: DbExecutor, userId: number, slug: string, input: SafariInput): Promise<number> {
        const result = await db.execute(SharedSafariSQL.insert, [
            userId,
            input.masterParkId,
            slug,
            input.title,
            input.theme,
            input.startDate,
            input.endDate,
            input.safariCount,
            input.totalSeats,
            input.sharedSeats,
            input.pricePerPersonMin,
            input.pricePerPersonMax,
            input.stayCategory,
            input.safariPlan,
            SharedSafariStatus.ACTIVE,
            userId,
            userId,
        ]);
        return result.insertId;
    }

    async update(db: DbExecutor, id: number, input: SafariInput, actorId: number): Promise<void> {
        await db.execute(SharedSafariSQL.update, [...safariValues(input), actorId, id]);
    }

    async setCover(db: DbExecutor, id: number, fileName: string, actorId: number): Promise<void> {
        await db.execute(SharedSafariSQL.setCover, [fileName, actorId, id]);
    }

    async setStatus(db: DbExecutor, id: number, status: number, actorId: number): Promise<void> {
        await db.execute(SharedSafariSQL.setStatus, [status, actorId, id]);
    }

    async deleteByHost(db: DbExecutor, id: number, actorId: number): Promise<void> {
        await db.execute(SharedSafariSQL.deleteByHost, [SharedSafariStatus.DELETED_BY_HOST, actorId, actorId, id]);
    }

    async deleteByAdmin(db: DbExecutor, id: number, reason: number, details: string, actorId: number): Promise<void> {
        await db.execute(SharedSafariSQL.deleteByAdmin, [
            SharedSafariStatus.DELETED_BY_ADMIN,
            reason,
            details,
            actorId,
            actorId,
            id,
        ]);
    }

    async makeActive(db: DbExecutor, id: number, actorId: number): Promise<void> {
        await db.execute(SharedSafariSQL.makeActive, [SharedSafariStatus.ACTIVE, actorId, id]);
    }

    async setPinned(db: DbExecutor, id: number, pinned: boolean, actorId: number): Promise<void> {
        await db.execute(SharedSafariSQL.setPinned, [pinned ? 1 : 0, actorId, id]);
    }

    async currentMembers(db: DbExecutor, safariIds: readonly number[]): Promise<FaceRow[]> {
        if (safariIds.length === 0) return [];
        return db.query<FaceRow>(SharedSafariSQL.faces(safariIds.length), [
            ...safariIds,
            SharedSafariMemberStatus.JOINED,
            UserActive,
        ]);
    }

    async joinedMembers(db: DbExecutor, safariId: number): Promise<FaceRow[]> {
        return db.query<FaceRow>(SharedSafariSQL.allMembers, [safariId, SharedSafariMemberStatus.JOINED]);
    }

    async leftMembers(db: DbExecutor, safariId: number): Promise<FaceRow[]> {
        return db.query<FaceRow>(SharedSafariSQL.leftMembers, [safariId, SharedSafariMemberStatus.LEFT]);
    }

    async viewerMemberships(db: DbExecutor, userId: number, safariIds: readonly number[]): Promise<MemberRow[]> {
        if (safariIds.length === 0) return [];
        return db.query<MemberRow>(SharedSafariSQL.viewerMemberships(safariIds.length), [userId, ...safariIds]);
    }

    async findMember(db: DbExecutor, safariId: number, userId: number): Promise<MemberRow | undefined> {
        return (await db.query<MemberRow>(SharedSafariSQL.findMember, [safariId, userId]))[0];
    }

    async insertMember(db: DbExecutor, safariId: number, userId: number): Promise<void> {
        await db.execute(SharedSafariSQL.insertMember, [
            safariId,
            userId,
            SharedSafariMemberStatus.JOINED,
            userId,
            userId,
        ]);
    }

    async rejoin(db: DbExecutor, memberId: number, userId: number): Promise<void> {
        await db.execute(SharedSafariSQL.rejoin, [SharedSafariMemberStatus.JOINED, userId, memberId]);
    }

    async leave(db: DbExecutor, memberId: number, userId: number): Promise<void> {
        await db.execute(SharedSafariSQL.leave, [SharedSafariMemberStatus.LEFT, userId, memberId]);
    }

    async commentsOf(db: DbExecutor, safariId: number): Promise<CommentRow[]> {
        return db.query<CommentRow>(DiscussionSQL.listForSafari, [
            ...FLAG_COUNT_PARAMS,
            safariId,
            SharedSafariCommentStatus.ACTIVE,
            UserActive,
        ]);
    }

    async findComment(db: DbExecutor, id: number): Promise<CommentRow | undefined> {
        return (await db.query<CommentRow>(DiscussionSQL.findById, [...FLAG_COUNT_PARAMS, id]))[0];
    }

    async insertComment(
        db: DbExecutor,
        safariId: number,
        parentId: number | null,
        userId: number,
        text: string,
    ): Promise<number> {
        const result = await db.execute(DiscussionSQL.insert, [
            safariId,
            parentId,
            userId,
            text,
            SharedSafariCommentStatus.ACTIVE,
            userId,
            userId,
        ]);
        return result.insertId;
    }

    async updateCommentText(db: DbExecutor, id: number, text: string, actorId: number): Promise<void> {
        await db.execute(DiscussionSQL.updateText, [text, actorId, id]);
    }

    async deleteCommentWithReplies(db: DbExecutor, id: number, actorId: number): Promise<number> {
        const result = await db.execute(DiscussionSQL.deleteWithReplies, [
            SharedSafariCommentStatus.DELETED,
            actorId,
            actorId,
            id,
            id,
            SharedSafariCommentStatus.ACTIVE,
        ]);
        return result.affectedRows;
    }

    async deleteSingleComment(db: DbExecutor, id: number, actorId: number): Promise<void> {
        await db.execute(DiscussionSQL.deleteOne, [
            SharedSafariCommentStatus.DELETED,
            actorId,
            actorId,
            id,
            SharedSafariCommentStatus.ACTIVE,
        ]);
    }

    async closeFlagsOf(db: DbExecutor, commentId: number, actorId: number): Promise<number> {
        const result = await db.execute(DiscussionSQL.closeFlagsOf, [
            CommentFlagStatus.CLOSED,
            actorId,
            commentId,
            commentId,
            CommentFlagStatus.OPEN,
        ]);
        return result.affectedRows;
    }

    async ignoreFlagsOf(db: DbExecutor, commentId: number, actorId: number): Promise<number> {
        const result = await db.execute(DiscussionSQL.ignoreFlagsOf, [
            CommentFlagStatus.IGNORED,
            actorId,
            commentId,
            CommentFlagStatus.OPEN,
        ]);
        return result.affectedRows;
    }

    async insertFlag(
        db: DbExecutor,
        commentId: number,
        userId: number,
        reason: { readonly id: number; readonly name: string },
        details: string,
    ): Promise<number> {
        const result = await db.execute(DiscussionSQL.insertFlag, [
            commentId,
            userId,
            reason.id,
            reason.name,
            details,
            CommentFlagStatus.OPEN,
            userId,
            userId,
        ]);
        return result.insertId;
    }

    async flagged(db: DbExecutor, search: string | undefined, limit: number, offset: number): Promise<FlaggedRow[]> {
        return db.query<FlaggedRow>(DiscussionSQL.flagged(search !== undefined), [
            ...FLAG_COUNT_PARAMS,
            ...FLAG_COUNT_PARAMS,
            CommentFlagStatus.OPEN,
            ...this.flaggedValues(search),
            limit,
            offset,
        ]);
    }

    async flaggedCount(db: DbExecutor, search: string | undefined): Promise<number> {
        const rows = await db.query<CountRow>(
            DiscussionSQL.flaggedCount(search !== undefined),
            this.flaggedValues(search),
        );
        return Number(rows[0]?.total ?? 0);
    }

    async openFlagsOf(db: DbExecutor, commentId: number): Promise<FlagRow[]> {
        return db.query<FlagRow>(DiscussionSQL.openFlagsOf, [commentId, CommentFlagStatus.OPEN, UserActive]);
    }

    private flaggedValues(search: string | undefined): unknown[] {
        return [
            SharedSafariCommentStatus.ACTIVE,
            UserActive,
            SharedSafariCommentStatus.ACTIVE,
            CommentFlagStatus.OPEN,
            UserActive,
            ...(search !== undefined ? [likeAnywhere(search), likeAnywhere(search)] : []),
        ];
    }
}
