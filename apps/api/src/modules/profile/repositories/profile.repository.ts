import type { GenderCode } from '../../../core/validation';
import type { DbExecutor } from '../../../database/connection';
import type { IProfileRepository } from '../contracts/profile-repository.contract';
import type { GeneralInformation } from '../dto/profile.dto';
import { UserProfileSQL } from '../sql/user-profile.sql';
import type { UserProfileRow } from '../types/profile.types';

export class ProfileRepository implements IProfileRepository {
    async findByUserId(db: DbExecutor, userId: number): Promise<UserProfileRow | undefined> {
        return (await db.query<UserProfileRow>(UserProfileSQL.findByUserId, [userId]))[0];
    }

    async saveGeneral(db: DbExecutor, userId: number, general: GeneralInformation, actorId: number): Promise<void> {
        await db.execute(UserProfileSQL.saveGeneral, [
            userId,
            general.dateOfBirth,
            general.gender,
            general.bio,
            general.about,
            general.facebookUrl,
            general.xUrl,
            general.instagramUrl,
            general.youtubeUrl,
            actorId,
            actorId,
        ]);
    }

    async saveBirthAndGender(
        db: DbExecutor,
        userId: number,
        dateOfBirth: string,
        gender: GenderCode,
        actorId: number,
    ): Promise<void> {
        await db.execute(UserProfileSQL.saveBirthAndGender, [userId, dateOfBirth, gender, actorId, actorId]);
    }

    async savePhoto(db: DbExecutor, userId: number, photo: string | null, actorId: number): Promise<void> {
        await db.execute(UserProfileSQL.savePhoto, [userId, photo, actorId, actorId]);
    }

    async saveCoverPhoto(db: DbExecutor, userId: number, coverPhoto: string | null, actorId: number): Promise<void> {
        await db.execute(UserProfileSQL.saveCoverPhoto, [userId, coverPhoto, actorId, actorId]);
    }
}
