import type { GenderCode } from '../../../core/validation';
export type { PartnerPackagesPage, PartnerParksPage, UserSafarisPage } from '../contracts/profile-cards.contract';

export type SocialLinksDto = {
    readonly facebookUrl: string | null;
    readonly xUrl: string | null;
    readonly instagramUrl: string | null;
    readonly youtubeUrl: string | null;
};

export type MyProfileDto = SocialLinksDto & {
    readonly userId: number;
    readonly name: string;
    readonly dateOfBirth: string | null;
    readonly gender: GenderCode | null;
    readonly bio: string | null;
    readonly about: string | null;
    readonly photoVersion: string | null;
    readonly coverPhotoVersion: string | null;
};

export type GeneralInformation = SocialLinksDto & {
    readonly name: string;
    readonly dateOfBirth: string | null;
    readonly gender: GenderCode | null;
    readonly bio: string | null;
    readonly about: string | null;
};

export type ProfileContentDto = SocialLinksDto & {
    readonly bio: string | null;
    readonly about: string | null;
};

export type ProfileHeaderDto = {
    readonly id: number;
    readonly name: string;
    readonly photoVersion: string | null;
    readonly coverPhotoVersion: string | null;
};

export type UserProfileViewDto =
    | { readonly kind: 'partner'; readonly partnerId: number }
    | {
          readonly kind: 'user';
          readonly user: ProfileHeaderDto;
          readonly profile: ProfileContentDto | null;
          readonly isOwn: boolean;
          readonly canMessage: boolean;
      };

export type ProfileImage = {
    readonly content: Buffer;
    readonly contentType: string;
};

export type PartnerProfileDto = {
    readonly id: number;
    readonly businessName: string;
    readonly about: string | null;
    readonly logoVersion: string | null;
    readonly packageCount: number;
    readonly parkCount: number;
};
