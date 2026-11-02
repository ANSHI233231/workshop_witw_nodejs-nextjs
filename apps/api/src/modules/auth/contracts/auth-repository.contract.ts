import type { DbExecutor } from '../../../database/connection';
import type { PasswordResetRow, RefreshTokenRow, RetiredRefreshTokenRow } from '../types/auth.types';

export interface IAuthRepository {
    insertRefreshToken(
        db: DbExecutor,
        userId: number,
        clientApp: number,
        tokenHash: string,
        expiresAt: string,
    ): Promise<number>;
    findActiveRefreshToken(db: DbExecutor, tokenHash: string): Promise<RefreshTokenRow | undefined>;
    findRefreshTokenRetiredWithin(
        db: DbExecutor,
        tokenHash: string,
        seconds: number,
    ): Promise<RetiredRefreshTokenRow | undefined>;
    retireRefreshToken(db: DbExecutor, id: number, userId: number): Promise<boolean>;
    retireRefreshTokensEverywhere(db: DbExecutor, userId: number, actorId: number): Promise<number>;
    insertPasswordReset(db: DbExecutor, userId: number, clientApp: number, tokenHash: string): Promise<number>;
    retireIssuedPasswordResets(db: DbExecutor, userId: number, clientApp: number): Promise<void>;
    findPasswordReset(db: DbExecutor, tokenHash: string): Promise<PasswordResetRow | undefined>;
    markPasswordResetUsed(db: DbExecutor, id: number, userId: number): Promise<boolean>;
}
