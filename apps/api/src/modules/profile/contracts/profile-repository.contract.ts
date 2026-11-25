import type { GenderCode } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { GeneralInformation } from '../dto/profile.dto';
import type { UserProfileRow } from '../types/profile.types';

export interface IProfileRepository {
    findByUserId(db: DbExecutor, userId: number): Promise<UserProfileRow | undefined>;
    saveGeneral(db: DbExecutor, userId: number, general: GeneralInformation, actorId: number): Promise<void>;
    saveBirthAndGender(
        db: DbExecutor,
        userId: number,
        dateOfBirth: string,
        gender: GenderCode,
        actorId: number,
    ): Promise<void>;
    savePhoto(db: DbExecutor, userId: number, photo: string | null, actorId: number): Promise<void>;
    saveCoverPhoto(db: DbExecutor, userId: number, coverPhoto: string | null, actorId: number): Promise<void>;
}
