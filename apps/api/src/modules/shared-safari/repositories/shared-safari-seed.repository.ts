import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import type { SeedSafari } from '../dto/shared-safari-seed.dto';
import { SharedSafariSeedSQL } from '../sql/shared-safari-seed.sql';
import {
    CommentFlagStatus,
    type CountRow,
    type IdRow,
    SharedSafariCommentStatus,
    SharedSafariMemberStatus,
} from '../types/shared-safari.types';

interface SlugRow extends RowDataPacket {
    slug: string;
}

interface ReasonRow extends RowDataPacket {
    id: number;
    name: string;
}

export interface SeededSafariRow extends RowDataPacket {
    id: number;
    slug: string;
    coverImage: string | null;
}

export type SeedScope = { readonly safariIds: readonly number[]; readonly userIds: readonly number[] };

const total = (rows: readonly CountRow[]): number => Number(rows[0]?.total ?? 0);

export class SharedSafariSeedRepository {
    async parkIdByName(db: DbExecutor, name: string): Promise<number | undefined> {
        return (await db.query<IdRow>(SharedSafariSeedSQL.parkIdByName, [name]))[0]?.id;
    }

    async flagReasonByName(db: DbExecutor, name: string): Promise<{ id: number; name: string } | undefined> {
        const row = (await db.query<ReasonRow>(SharedSafariSeedSQL.flagReasonByName, [name]))[0];
        return row ? { id: row.id, name: row.name } : undefined;
    }

    async takenSlugs(db: DbExecutor, slugs: readonly string[]): Promise<string[]> {
        const rows = await db.query<SlugRow>(SharedSafariSeedSQL.takenSlugs(slugs.length), slugs);
        return rows.map((row) => row.slug);
    }

    async insertSafari(db: DbExecutor, safari: SeedSafari, parkId: number): Promise<number> {
        const result = await db.execute(SharedSafariSeedSQL.insertSafari, [
            safari.hostId,
            parkId,
            safari.slug,
            safari.title,
            safari.theme,
            safari.startDate,
            safari.endDate,
            safari.safariCount,
            safari.totalSeats,
            safari.sharedSeats,
            safari.pricePerPersonMin,
            safari.pricePerPersonMax,
            safari.stayCategory,
            safari.safariPlan,
            safari.isPinned ? 1 : 0,
            safari.deleteReason,
            safari.deleteDetails,
            safari.status,
            safari.createdAt,
            safari.updatedAt,
            safari.hostId,
            safari.deletedById ?? safari.hostId,
            safari.deletedAt,
            safari.deletedById,
        ]);
        return result.insertId;
    }

    async insertJoined(db: DbExecutor, safariId: number, userId: number, at: Date): Promise<void> {
        await db.execute(SharedSafariSeedSQL.insertMember, [
            safariId,
            userId,
            at,
            at,
            null,
            SharedSafariMemberStatus.JOINED,
            at,
            at,
            userId,
            userId,
        ]);
    }

    async insertLeft(db: DbExecutor, safariId: number, userId: number, joinedAt: Date, leftAt: Date): Promise<void> {
        await db.execute(SharedSafariSeedSQL.insertMember, [
            safariId,
            userId,
            joinedAt,
            joinedAt,
            leftAt,
            SharedSafariMemberStatus.LEFT,
            joinedAt,
            leftAt,
            userId,
            userId,
        ]);
    }

    async insertComment(
        db: DbExecutor,
        safariId: number,
        parentId: number | null,
        userId: number,
        text: string,
        at: Date,
    ): Promise<number> {
        const result = await db.execute(SharedSafariSeedSQL.insertComment, [
            safariId,
            parentId,
            userId,
            text,
            SharedSafariCommentStatus.ACTIVE,
            at,
            at,
            userId,
            userId,
        ]);
        return result.insertId;
    }

    async insertFlag(
        db: DbExecutor,
        commentId: number,
        userId: number,
        reason: { readonly id: number; readonly name: string },
        details: string,
        at: Date,
    ): Promise<void> {
        await db.execute(SharedSafariSeedSQL.insertFlag, [
            commentId,
            userId,
            reason.id,
            reason.name,
            details,
            CommentFlagStatus.OPEN,
            at,
            at,
            userId,
            userId,
        ]);
    }

    async setCover(db: DbExecutor, safariId: number, fileName: string): Promise<void> {
        await db.execute(SharedSafariSeedSQL.setCover, [fileName, safariId]);
    }

    async seededSafaris(db: DbExecutor, slugs: readonly string[], userIds: readonly number[]): Promise<SeededSafariRow[]> {
        return db.query<SeededSafariRow>(SharedSafariSeedSQL.seededSafaris(slugs.length, userIds.length), [
            ...slugs,
            ...userIds,
        ]);
    }

    async otherHosted(db: DbExecutor, slugs: readonly string[], userIds: readonly number[]): Promise<string[]> {
        const rows = await db.query<SlugRow>(SharedSafariSeedSQL.otherHosted(slugs.length, userIds.length), [
            ...userIds,
            ...slugs,
        ]);
        return rows.map((row) => row.slug);
    }

    async commentIds(db: DbExecutor, scope: SeedScope): Promise<number[]> {
        const rows = await db.query<IdRow>(
            SharedSafariSeedSQL.commentIds(scope.safariIds.length, scope.userIds.length),
            [...scope.safariIds, ...scope.userIds],
        );
        return rows.map((row) => row.id);
    }

    async countFlags(db: DbExecutor, commentIds: readonly number[], userIds: readonly number[]): Promise<number> {
        return total(
            await db.query<CountRow>(SharedSafariSeedSQL.countFlags(commentIds.length, userIds.length), [
                ...commentIds,
                ...userIds,
            ]),
        );
    }

    async countComments(db: DbExecutor, commentIds: readonly number[]): Promise<number> {
        return total(
            await db.query<CountRow>(SharedSafariSeedSQL.countComments(commentIds.length), [
                ...commentIds,
                ...commentIds,
            ]),
        );
    }

    async countMembers(db: DbExecutor, scope: SeedScope): Promise<number> {
        return total(
            await db.query<CountRow>(SharedSafariSeedSQL.countMembers(scope.safariIds.length, scope.userIds.length), [
                ...scope.safariIds,
                ...scope.userIds,
            ]),
        );
    }

    async deleteFlags(db: DbExecutor, commentIds: readonly number[], userIds: readonly number[]): Promise<number> {
        const result = await db.execute(SharedSafariSeedSQL.deleteFlags(commentIds.length, userIds.length), [
            ...commentIds,
            ...userIds,
        ]);
        return result.affectedRows;
    }

    async deleteComments(db: DbExecutor, commentIds: readonly number[]): Promise<number> {
        const result = await db.execute(SharedSafariSeedSQL.deleteComments(commentIds.length), [
            ...commentIds,
            ...commentIds,
        ]);
        return result.affectedRows;
    }

    async deleteMembers(db: DbExecutor, scope: SeedScope): Promise<number> {
        const result = await db.execute(
            SharedSafariSeedSQL.deleteMembers(scope.safariIds.length, scope.userIds.length),
            [...scope.safariIds, ...scope.userIds],
        );
        return result.affectedRows;
    }

    async deleteSafaris(db: DbExecutor, safariIds: readonly number[]): Promise<number> {
        const result = await db.execute(SharedSafariSeedSQL.deleteSafaris(safariIds.length), safariIds);
        return result.affectedRows;
    }
}
