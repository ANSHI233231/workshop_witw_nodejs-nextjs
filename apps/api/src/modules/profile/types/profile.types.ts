import type { GenderCode } from '../../../core/validation';
import type { RowDataPacket } from '../../../database/connection';

export const PROFILE_LIMITS = {
    NAME_MAX: 100,
    URL_MAX: 1000,
    PHOTO_MAX_BYTES: 250 * 1024,
    COVER_PHOTO_MAX_BYTES: 500 * 1024,
    PAGE_SIZE: 12,
} as const;

export const PROFILE_IMAGE_TYPES: readonly string[] = ['image/jpeg', 'image/png'];

export const ProfileImageKind = { PHOTO: 'photo', COVER_PHOTO: 'cover_photo' } as const;

export type ProfileImageKindCode = (typeof ProfileImageKind)[keyof typeof ProfileImageKind];

export const PROFILE_FOLDER = 'user_profile';

export interface UserProfileRow extends RowDataPacket {
    id: number;
    user_id: number;
    date_of_birth: string | null;
    gender: GenderCode | null;
    bio: string | null;
    about: string | null;
    facebook_url: string | null;
    x_url: string | null;
    instagram_url: string | null;
    youtube_url: string | null;
    photo: string | null;
    cover_photo: string | null;
}

export interface TestProfileRow extends RowDataPacket {
    id: number;
    user_id: number;
    photo: string | null;
    cover_photo: string | null;
}
