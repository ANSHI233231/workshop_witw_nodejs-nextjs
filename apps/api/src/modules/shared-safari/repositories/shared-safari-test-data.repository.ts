import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import { SharedSafariTestDataSQL } from '../sql/shared-safari-test-data.sql';

const startsWith = (text: string): string => `${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

export interface TestSafariRow extends RowDataPacket {
    id: number;
    user_id: number;
    title: string;
    status: number;
}

export interface TestMemberRow extends RowDataPacket {
    id: number;
    shared_safari_id: number;
    user_id: number;
    status: number;
}

export interface TestCommentRow extends RowDataPacket {
    id: number;
    shared_safari_id: number;
    user_id: number;
    text_start: string;
}

export interface TestFlagRow extends RowDataPacket {
    id: number;
    shared_safari_comment_id: number;
    user_id: number;
}

export class SharedSafariTestDataRepository {
    async markedSafaris(db: DbExecutor, userIds: readonly number[], textPrefix: string, slugPrefix: string): Promise<TestSafariRow[]> {
        return db.query<TestSafariRow>(SharedSafariTestDataSQL.markedSafaris(userIds.length), [
            ...userIds,
            startsWith(textPrefix),
            startsWith(slugPrefix),
        ]);
    }

    async safarisNotIn(db: DbExecutor, safariIds: readonly number[]): Promise<TestSafariRow[]> {
        return db.query<TestSafariRow>(SharedSafariTestDataSQL.safarisNotIn(safariIds.length), safariIds);
    }

    async members(db: DbExecutor, safariIds: readonly number[], userIds: readonly number[]): Promise<TestMemberRow[]> {
        return db.query<TestMemberRow>(SharedSafariTestDataSQL.members(safariIds.length, userIds.length), [...safariIds, ...userIds]);
    }

    async comments(
        db: DbExecutor,
        safariIds: readonly number[],
        userIds: readonly number[],
        textPrefix: string,
    ): Promise<TestCommentRow[]> {
        return db.query<TestCommentRow>(SharedSafariTestDataSQL.comments(safariIds.length, userIds.length), [
            ...safariIds,
            ...userIds,
            startsWith(textPrefix),
        ]);
    }

    async repliesTo(db: DbExecutor, commentIds: readonly number[]): Promise<TestCommentRow[]> {
        if (commentIds.length === 0) return [];
        return db.query<TestCommentRow>(SharedSafariTestDataSQL.repliesTo(commentIds.length), commentIds);
    }

    async flags(db: DbExecutor, commentIds: readonly number[], userIds: readonly number[]): Promise<TestFlagRow[]> {
        return db.query<TestFlagRow>(SharedSafariTestDataSQL.flags(commentIds.length, userIds.length), [...commentIds, ...userIds]);
    }

    async deleteAll(
        db: DbExecutor,
        ids: { readonly flagIds: readonly number[]; readonly commentIds: readonly number[]; readonly memberIds: readonly number[]; readonly safariIds: readonly number[] },
    ): Promise<number> {
        if (ids.flagIds.length > 0) await db.execute(SharedSafariTestDataSQL.deleteFlags(ids.flagIds.length), ids.flagIds);
        if (ids.commentIds.length > 0) await db.execute(SharedSafariTestDataSQL.deleteComments(ids.commentIds.length), ids.commentIds);
        if (ids.memberIds.length > 0) await db.execute(SharedSafariTestDataSQL.deleteMembers(ids.memberIds.length), ids.memberIds);
        if (ids.safariIds.length === 0) return 0;
        return (await db.execute(SharedSafariTestDataSQL.deleteSafaris(ids.safariIds.length), ids.safariIds)).affectedRows;
    }
}
