import { NotFoundException, ValidationException } from '../../../core/exceptions';
import { type GenderCode, PERSON_MESSAGES } from '../../../core/validation';
import type { Database } from '../../../database/connection';
import { AuditAction, type AuditActionCode, AuditEntity, type IAuditService } from '../../audit';
import type { SignUpProfile } from '../../auth';
import type { IPartnerService } from '../../partner';
import type { ISharedSafariService } from '../../shared-safari';
import type { IUsersService, UserSummary } from '../../users';
import type { IProfileRepository } from '../contracts/profile-repository.contract';
import type { IProfileService } from '../contracts/profile-service.contract';
import type {
    GeneralInformation,
    MyProfileDto,
    ProfileImage,
    UserProfileViewDto,
    UserSafarisPage,
} from '../dto/profile.dto';
import { generalOf, toContent, toHeader, toMyProfile } from '../mappers/profile.mapper';
import { ProfileImageKind, type ProfileImageKindCode } from '../types/profile.types';
import { PROFILE_MESSAGES } from '../validators/profile.validators';
import type { ProfileFiles } from './profile-files';

type AuditPair = { readonly done: AuditActionCode; readonly failed: AuditActionCode };

const SAVED: AuditPair = { done: AuditAction.PROFILE_SAVED, failed: AuditAction.PROFILE_SAVE_FAILED };

const IMAGE_ACTIONS: Readonly<Record<ProfileImageKindCode, { readonly saved: AuditPair; readonly removed: AuditPair }>> = {
    [ProfileImageKind.PHOTO]: {
        saved: { done: AuditAction.PROFILE_PHOTO_SAVED, failed: AuditAction.PROFILE_PHOTO_SAVE_FAILED },
        removed: { done: AuditAction.PROFILE_PHOTO_REMOVED, failed: AuditAction.PROFILE_PHOTO_REMOVE_FAILED },
    },
    [ProfileImageKind.COVER_PHOTO]: {
        saved: { done: AuditAction.PROFILE_COVER_SAVED, failed: AuditAction.PROFILE_COVER_SAVE_FAILED },
        removed: { done: AuditAction.PROFILE_COVER_REMOVED, failed: AuditAction.PROFILE_COVER_REMOVE_FAILED },
    },
};

const userNotFound = (): NotFoundException =>
    new NotFoundException(PROFILE_MESSAGES.USER_NOT_FOUND, 'USER_PROFILE_NOT_FOUND');

const accountNotFound = (): NotFoundException =>
    new NotFoundException(PROFILE_MESSAGES.ACCOUNT_NOT_FOUND, 'USER_NOT_FOUND');

const requiredAgain = (field: 'dateOfBirth' | 'gender'): ValidationException => {
    const message = field === 'dateOfBirth' ? PERSON_MESSAGES.DATE_OF_BIRTH_EMPTY : PERSON_MESSAGES.GENDER_EMPTY;
    return new ValidationException(message, [{ field, message }], 'VALIDATION_FAILED');
};

const changesBetween = (
    before: GeneralInformation,
    after: GeneralInformation,
): Record<string, { from: unknown; to: unknown }> =>
    Object.fromEntries(
        (Object.keys(after) as Array<keyof GeneralInformation>)
            .filter((field) => before[field] !== after[field])
            .map((field) => [field, { from: before[field], to: after[field] }]),
    );

export class ProfileService implements IProfileService {
    constructor(
        private readonly db: Database,
        private readonly repository: IProfileRepository,
        private readonly auditService: IAuditService,
        private readonly usersService: IUsersService,
        private readonly partnerService: IPartnerService,
        private readonly sharedSafariService: ISharedSafariService,
        private readonly files: ProfileFiles,
    ) {}

    async mine(userId: number): Promise<MyProfileDto> {
        const user = await this.activeAccount(userId);
        return toMyProfile(userId, user.name, await this.repository.findByUserId(this.db, userId));
    }

    async saveGeneral(userId: number, general: GeneralInformation): Promise<MyProfileDto> {
        await this.audited(SAVED, userId, { ...general }, async () => {
            const user = await this.activeAccount(userId);
            const row = await this.repository.findByUserId(this.db, userId);
            if (row?.date_of_birth && general.dateOfBirth === null) throw requiredAgain('dateOfBirth');
            if (row?.gender && general.gender === null) throw requiredAgain('gender');
            await this.usersService.rename(userId, general.name, userId);
            await this.repository.saveGeneral(this.db, userId, general, userId);
            return changesBetween(generalOf(user.name, row), general);
        });
        return this.mine(userId);
    }

    async saveAtSignUp(userId: number, profile: SignUpProfile): Promise<void> {
        await this.audited(SAVED, userId, { ...profile, atSignUp: true }, async () => {
            await this.repository.saveBirthAndGender(this.db, userId, profile.dateOfBirth, profile.gender, userId);
            return {
                dateOfBirth: { from: null, to: profile.dateOfBirth },
                gender: { from: null, to: profile.gender satisfies GenderCode },
            };
        });
    }

    async setImage(userId: number, kind: ProfileImageKindCode, content: Buffer): Promise<MyProfileDto> {
        await this.activeAccount(userId);
        const fileName = await this.storeOrRecord(userId, kind, content);
        try {
            await this.changeImage(userId, kind, fileName, IMAGE_ACTIONS[kind].saved);
        } catch (error) {
            await this.files.discard(userId, kind, fileName);
            throw error;
        }
        return this.mine(userId);
    }

    async removeImage(userId: number, kind: ProfileImageKindCode): Promise<MyProfileDto> {
        await this.activeAccount(userId);
        await this.changeImage(userId, kind, null, IMAGE_ACTIONS[kind].removed);
        return this.mine(userId);
    }

    async view(userId: number, viewerId: number | null): Promise<UserProfileViewDto> {
        const user = await this.usersService.findActiveById(userId);
        if (!user) throw userNotFound();
        const partner = await this.partnerService.partnerOf(userId);
        if (partner) {
            const active = await this.partnerService.activePartnerOf(userId);
            if (!active) throw userNotFound();
            return { kind: 'partner', partnerId: active.id };
        }
        const row = await this.repository.findByUserId(this.db, userId);
        const isOwn = viewerId === userId;
        const viewerIsPartner = viewerId !== null && (await this.partnerService.partnerOf(viewerId)) !== null;
        return {
            kind: 'user',
            user: toHeader(userId, user.name, row),
            profile: viewerId === null ? null : toContent(row),
            isOwn,
            canMessage: viewerId !== null && !isOwn && !viewerIsPartner,
        };
    }

    async safaris(userId: number, page: number, viewerId: number): Promise<UserSafarisPage> {
        const user = await this.usersService.findActiveById(userId);
        if (!user || (await this.partnerService.partnerOf(userId))) throw userNotFound();
        return this.sharedSafariService.activeOfUser(userId, page, viewerId);
    }

    async image(userId: number, kind: ProfileImageKindCode): Promise<ProfileImage> {
        const user = await this.usersService.findActiveById(userId);
        if (!user) throw userNotFound();
        const row = await this.repository.findByUserId(this.db, userId);
        return this.files.read(userId, kind, kind === ProfileImageKind.PHOTO ? (row?.photo ?? null) : (row?.cover_photo ?? null));
    }

    private async storeOrRecord(userId: number, kind: ProfileImageKindCode, content: Buffer): Promise<string> {
        try {
            return await this.files.store(userId, kind, content);
        } catch (error) {
            await this.auditService.recordFailure(
                {
                    action: IMAGE_ACTIONS[kind].saved.failed,
                    entityType: AuditEntity.USER_PROFILE,
                    details: { userId, kind, bytes: content.length },
                },
                error,
            );
            throw error;
        }
    }

    private async changeImage(
        userId: number,
        kind: ProfileImageKindCode,
        fileName: string | null,
        actions: AuditPair,
    ): Promise<void> {
        let replaced: string | null = null;
        await this.audited(actions, userId, { kind, fileName }, async () => {
            const row = await this.repository.findByUserId(this.db, userId);
            replaced = (kind === ProfileImageKind.PHOTO ? row?.photo : row?.cover_photo) ?? null;
            if (kind === ProfileImageKind.PHOTO) await this.repository.savePhoto(this.db, userId, fileName, userId);
            else await this.repository.saveCoverPhoto(this.db, userId, fileName, userId);
            return { [kind]: { from: replaced, to: fileName } };
        });
        if (replaced !== fileName) await this.files.discard(userId, kind, replaced);
    }

    private async activeAccount(userId: number): Promise<UserSummary> {
        const user = await this.usersService.findActiveById(userId);
        if (!user) throw accountNotFound();
        return user;
    }

    private async audited(
        actions: AuditPair,
        userId: number,
        input: Readonly<Record<string, unknown>>,
        work: () => Promise<Readonly<Record<string, unknown>>>,
    ): Promise<void> {
        try {
            await this.db.transaction(async () => {
                const changes = await work();
                const row = await this.repository.findByUserId(this.db, userId);
                await this.auditService.record({
                    action: actions.done,
                    entityType: AuditEntity.USER_PROFILE,
                    entityId: row?.id,
                    changes,
                    details: { userId },
                });
            });
        } catch (error) {
            await this.auditService.recordFailure(
                { action: actions.failed, entityType: AuditEntity.USER_PROFILE, details: { userId, input } },
                error,
            );
            throw error;
        }
    }
}
