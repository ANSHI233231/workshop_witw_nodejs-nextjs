import type { PackageCard } from './package.types';
import type { ParkCard } from './park.types';
import type { SafariCard } from './shared-safari.types';

export const Gender = { MALE: 1, FEMALE: 2, OTHER: 3 } as const;

export type GenderCode = (typeof Gender)[keyof typeof Gender];

export const GENDER_OPTIONS: ReadonlyArray<{ readonly value: GenderCode; readonly label: string }> = [
    { value: Gender.MALE, label: 'Male' },
    { value: Gender.FEMALE, label: 'Female' },
    { value: Gender.OTHER, label: 'Other' },
];

export const PROFILE_LIMITS = {
    NAME_MAX: 100,
    LINK_MAX: 1000,
    MIN_AGE: 18,
    PHOTO_MAX_BYTES: 250 * 1024,
    COVER_MAX_BYTES: 500 * 1024,
    PAGE_SIZE: 12,
} as const;

export const PROFILE_IMAGE_ACCEPT = '.jpg,.jpeg,.png';

export type MyProfile = {
    readonly userId: number;
    readonly name: string;
    readonly dateOfBirth: string | null;
    readonly gender: GenderCode | null;
    readonly bio: string | null;
    readonly about: string | null;
    readonly facebookUrl: string | null;
    readonly xUrl: string | null;
    readonly instagramUrl: string | null;
    readonly youtubeUrl: string | null;
    readonly photoVersion: string | null;
    readonly coverPhotoVersion: string | null;
};

export type MyProfileInput = {
    readonly name: string;
    readonly dateOfBirth: string | null;
    readonly gender: GenderCode | null;
    readonly bio: string;
    readonly about: string;
    readonly facebookUrl: string;
    readonly xUrl: string;
    readonly instagramUrl: string;
    readonly youtubeUrl: string;
};

export type ProfileDetails = {
    readonly bio: string | null;
    readonly about: string | null;
    readonly facebookUrl: string | null;
    readonly xUrl: string | null;
    readonly instagramUrl: string | null;
    readonly youtubeUrl: string | null;
};

export type UserProfileAnswer =
    | {
          readonly kind: 'user';
          readonly user: {
              readonly id: number;
              readonly name: string;
              readonly photoVersion: string | null;
              readonly coverPhotoVersion: string | null;
          };
          readonly profile: ProfileDetails | null;
          readonly isOwn: boolean;
          readonly canMessage: boolean;
      }
    | { readonly kind: 'partner'; readonly partnerId: number };

export type ProfilePage<T> = {
    readonly items: readonly T[];
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
    readonly hasMore: boolean;
};

export type PartnerProfile = {
    readonly id: number;
    readonly businessName: string;
    readonly about: string | null;
    readonly logoVersion: string | null;
    readonly packageCount: number;
    readonly parkCount: number;
};

export type PartnerPackagePage = ProfilePage<PackageCard>;

export type PartnerParkPage = ProfilePage<ParkCard>;

export type UserSafariPage = ProfilePage<SafariCard>;
