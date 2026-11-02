import type { DbExecutor } from '../../../database/connection';
import type { IAuthRepository } from '../contracts/auth-repository.contract';
import { UserPasswordResetSQL } from '../sql/user-password-reset.sql';
import { UserRefreshTokenSQL } from '../sql/user-refresh-token.sql';
import {
    PASSWORD_RESET_LIFETIME_MINUTES,
    type PasswordResetRow,
    PasswordResetStatus,
    RefreshTokenStatus,
    type RefreshTokenRow,
    type RetiredRefreshTokenRow,
} from '../types/auth.types';

export class AuthRepository implements IAuthRepository {
    async insertRefreshToken(
        db: DbExecutor,
        userId: number,
        clientApp: number,
        tokenHash: string,
        expiresAt: string,
    ): Promise<number> {
        const result = await db.execute(UserRefreshTokenSQL.insert, [
            userId,
            clientApp,
            tokenHash,
            expiresAt,
            RefreshTokenStatus.ACTIVE,
            userId,
            userId,
        ]);
        return result.insertId;
    }

    async findActiveRefreshToken(db: DbExecutor, tokenHash: string): Promise<RefreshTokenRow | undefined> {
        const rows = await db.query<RefreshTokenRow>(UserRefreshTokenSQL.findActiveByHash, [
            tokenHash,
            RefreshTokenStatus.ACTIVE,
        ]);
        return rows[0];
    }

    async findRefreshTokenRetiredWithin(
        db: DbExecutor,
        tokenHash: string,
        seconds: number,
    ): Promise<RetiredRefreshTokenRow | undefined> {
        const rows = await db.query<RetiredRefreshTokenRow>(UserRefreshTokenSQL.findRetiredSinceByHash, [
            tokenHash,
            RefreshTokenStatus.RETIRED,
            seconds,
        ]);
        return rows[0];
    }

    async retireRefreshToken(db: DbExecutor, id: number, userId: number): Promise<boolean> {
        const result = await db.execute(UserRefreshTokenSQL.retireById, [
            RefreshTokenStatus.RETIRED,
            userId,
            id,
            RefreshTokenStatus.ACTIVE,
        ]);
        return result.affectedRows === 1;
    }

    async retireRefreshTokensEverywhere(db: DbExecutor, userId: number, actorId: number): Promise<number> {
        const result = await db.execute(UserRefreshTokenSQL.retireAllActiveOfUserEverywhere, [
            RefreshTokenStatus.RETIRED,
            actorId,
            userId,
            RefreshTokenStatus.ACTIVE,
        ]);
        return result.affectedRows;
    }

    async insertPasswordReset(db: DbExecutor, userId: number, clientApp: number, tokenHash: string): Promise<number> {
        const result = await db.execute(UserPasswordResetSQL.insert, [
            userId,
            clientApp,
            tokenHash,
            PASSWORD_RESET_LIFETIME_MINUTES,
            PasswordResetStatus.ISSUED,
            userId,
            userId,
        ]);
        return result.insertId;
    }

    async retireIssuedPasswordResets(db: DbExecutor, userId: number, clientApp: number): Promise<void> {
        await db.execute(UserPasswordResetSQL.retireIssuedOfUser, [
            PasswordResetStatus.RETIRED,
            userId,
            userId,
            clientApp,
            PasswordResetStatus.ISSUED,
        ]);
    }

    async findPasswordReset(db: DbExecutor, tokenHash: string): Promise<PasswordResetRow | undefined> {
        const rows = await db.query<PasswordResetRow>(UserPasswordResetSQL.findByTokenHash, [tokenHash]);
        return rows[0];
    }

    async markPasswordResetUsed(db: DbExecutor, id: number, userId: number): Promise<boolean> {
        const result = await db.execute(UserPasswordResetSQL.markUsed, [
            PasswordResetStatus.USED,
            userId,
            id,
            PasswordResetStatus.ISSUED,
        ]);
        return result.affectedRows === 1;
    }
}
