import type { GeneralInformation, MyProfileDto, ProfileContentDto, ProfileHeaderDto } from '../dto/profile.dto';
import type { UserProfileRow } from '../types/profile.types';

const linksOf = (row: UserProfileRow | undefined) => ({
    facebookUrl: row?.facebook_url ?? null,
    xUrl: row?.x_url ?? null,
    instagramUrl: row?.instagram_url ?? null,
    youtubeUrl: row?.youtube_url ?? null,
});

export const toMyProfile = (userId: number, name: string, row: UserProfileRow | undefined): MyProfileDto => ({
    userId,
    name,
    dateOfBirth: row?.date_of_birth ?? null,
    gender: row?.gender ?? null,
    bio: row?.bio ?? null,
    about: row?.about ?? null,
    ...linksOf(row),
    photoVersion: row?.photo ?? null,
    coverPhotoVersion: row?.cover_photo ?? null,
});

export const toHeader = (userId: number, name: string, row: UserProfileRow | undefined): ProfileHeaderDto => ({
    id: userId,
    name,
    photoVersion: row?.photo ?? null,
    coverPhotoVersion: row?.cover_photo ?? null,
});

export const toContent = (row: UserProfileRow | undefined): ProfileContentDto => ({
    bio: row?.bio ?? null,
    about: row?.about ?? null,
    ...linksOf(row),
});

export const generalOf = (name: string, row: UserProfileRow | undefined): GeneralInformation => ({
    name,
    dateOfBirth: row?.date_of_birth ?? null,
    gender: row?.gender ?? null,
    bio: row?.bio ?? null,
    about: row?.about ?? null,
    ...linksOf(row),
});
