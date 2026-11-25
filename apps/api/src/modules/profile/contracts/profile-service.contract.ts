import type { ISignUpProfileWriter } from '../../auth';
import type {
    GeneralInformation,
    MyProfileDto,
    ProfileImage,
    UserProfileViewDto,
    UserSafarisPage,
} from '../dto/profile.dto';
import type { ProfileImageKindCode } from '../types/profile.types';

export interface IProfileService extends ISignUpProfileWriter {
    mine(userId: number): Promise<MyProfileDto>;
    saveGeneral(userId: number, general: GeneralInformation): Promise<MyProfileDto>;
    setImage(userId: number, kind: ProfileImageKindCode, content: Buffer): Promise<MyProfileDto>;
    removeImage(userId: number, kind: ProfileImageKindCode): Promise<MyProfileDto>;
    view(userId: number, viewerId: number | null): Promise<UserProfileViewDto>;
    safaris(userId: number, page: number, viewerId: number): Promise<UserSafarisPage>;
    image(userId: number, kind: ProfileImageKindCode): Promise<ProfileImage>;
}
