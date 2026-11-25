import type { Request, Response } from 'express';

import { ValidationException } from '../../../core/exceptions';
import { ok, sendInline, uploadedFiles } from '../../../core/http';
import type { IPartnerProfileService } from '../contracts/partner-profile-service.contract';
import type { IProfileService } from '../contracts/profile-service.contract';
import { ProfileImageKind, type ProfileImageKindCode } from '../types/profile.types';
import { type GeneralBody, type IdParams, type PageQuery, PROFILE_MESSAGES } from '../validators/profile.validators';

type SignedIn = { readonly id: number };

const signedInUserId = (res: Response): number => (res.locals['authUser'] as SignedIn).id;

const viewerIdOf = (res: Response): number | null => (res.locals['authUser'] as SignedIn | undefined)?.id ?? null;

const idOf = (req: Request): number => (req.params as unknown as IdParams).id;

const pageOf = (req: Request): number => (req.query as unknown as PageQuery).page;

const FIELD_OF: Readonly<Record<ProfileImageKindCode, string>> = {
    [ProfileImageKind.PHOTO]: 'photo',
    [ProfileImageKind.COVER_PHOTO]: 'coverPhoto',
};

const SAVED_MESSAGE: Readonly<Record<ProfileImageKindCode, string>> = {
    [ProfileImageKind.PHOTO]: PROFILE_MESSAGES.PHOTO_SAVED,
    [ProfileImageKind.COVER_PHOTO]: PROFILE_MESSAGES.COVER_PHOTO_SAVED,
};

const imageOf = (req: Request, kind: ProfileImageKindCode): Buffer => {
    const file = uploadedFiles(req)[0];
    if (!file) {
        const field = FIELD_OF[kind];
        throw new ValidationException(PROFILE_MESSAGES.IMAGE_TYPE, [{ field, message: PROFILE_MESSAGES.IMAGE_TYPE }], 'PROFILE_IMAGE_TYPE');
    }
    return file.content;
};

export class ProfileController {
    constructor(
        private readonly profiles: IProfileService,
        private readonly partners: IPartnerProfileService,
    ) {}

    mine = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.profiles.mine(signedInUserId(res)));
    };

    saveGeneral = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.profiles.saveGeneral(signedInUserId(res), req.body as GeneralBody), PROFILE_MESSAGES.PROFILE_SAVED);
    };

    setImage = (kind: ProfileImageKindCode) => async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.profiles.setImage(signedInUserId(res), kind, imageOf(req, kind)), SAVED_MESSAGE[kind]);
    };

    removeImage = (kind: ProfileImageKindCode) => async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.profiles.removeImage(signedInUserId(res), kind), SAVED_MESSAGE[kind]);
    };

    view = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.profiles.view(idOf(req), viewerIdOf(res)));
    };

    safaris = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.profiles.safaris(idOf(req), pageOf(req), signedInUserId(res)));
    };

    image = (kind: ProfileImageKindCode) => async (req: Request, res: Response): Promise<void> => {
        sendInline(res, { ...(await this.profiles.image(idOf(req), kind)), isPublic: true });
    };

    partner = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.partners.header(idOf(req)));
    };

    partnerPackages = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.partners.packages(idOf(req), pageOf(req)));
    };

    partnerParks = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.partners.parks(idOf(req), pageOf(req)));
    };
}
