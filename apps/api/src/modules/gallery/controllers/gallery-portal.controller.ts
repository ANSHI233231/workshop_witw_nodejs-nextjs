import type { Request, Response } from 'express';

import { ValidationException } from '../../../core/exceptions';
import { created, ok, sendInline, uploadedFiles } from '../../../core/http';
import type { IGalleryPortalService } from '../contracts/gallery-portal-service.contract';
import type { IncomingPhoto, NewGallery } from '../dto/gallery.dto';
import {
    GALLERY_MESSAGES,
    type GalleryParams,
    type GalleryPhotoParams,
    type ListTabQuery,
    type SaveDraftBody,
} from '../validators/gallery.validators';

type SignedInUser = { readonly id: number };

const signedInUserId = (res: Response): number => (res.locals['authUser'] as SignedInUser).id;

const idOf = (req: Request): number => (req.params as unknown as GalleryParams).id;

const photoIdOf = (req: Request): number => (req.params as unknown as GalleryPhotoParams).photoId;

const SAVED = 'Gallery saved as a draft.';

const photosOf = (req: Request): IncomingPhoto[] =>
    uploadedFiles(req).map((file) => ({ originalName: file.originalName, content: file.content }));

const onePhotoOf = (req: Request): IncomingPhoto => {
    const photo = photosOf(req)[0];
    if (!photo) {
        const message = GALLERY_MESSAGES.PHOTO_MISSING;
        throw new ValidationException(message, [{ field: 'photo', message }], 'GALLERY_PHOTO_MISSING');
    }
    return photo;
};

export class GalleryPortalController {
    constructor(private readonly service: IGalleryPortalService) {}

    list = async (req: Request, res: Response): Promise<void> => {
        const { tab } = req.query as unknown as ListTabQuery;
        ok(res, await this.service.list(signedInUserId(res), tab));
    };

    detail = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.detail(signedInUserId(res), idOf(req)));
    };

    create = async (req: Request, res: Response): Promise<void> => {
        created(res, await this.service.create(signedInUserId(res), req.body as NewGallery), SAVED);
    };

    saveDraft = async (req: Request, res: Response): Promise<void> => {
        const body = req.body as SaveDraftBody;
        ok(res, await this.service.saveDraft(signedInUserId(res), idOf(req), body), SAVED);
    };

    addPhotos = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.addPhotos(signedInUserId(res), idOf(req), photosOf(req)), 'Photos added.');
    };

    replacePhoto = async (req: Request, res: Response): Promise<void> => {
        const gallery = await this.service.replacePhoto(signedInUserId(res), idOf(req), photoIdOf(req), onePhotoOf(req));
        ok(res, gallery, 'Photo replaced.');
    };

    removePhoto = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.removePhoto(signedInUserId(res), idOf(req), photoIdOf(req)), 'Photo removed.');
    };

    send = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.send(signedInUserId(res), idOf(req)), 'Gallery sent for approval.');
    };

    moveBack = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.moveBack(signedInUserId(res), idOf(req)), 'The gallery is back in draft.');
    };

    startEdit = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.startEdit(signedInUserId(res), idOf(req)), 'A draft is made. The approved photos stay in use.');
    };

    deleteDraft = async (req: Request, res: Response): Promise<void> => {
        const outcome = await this.service.deleteDraft(signedInUserId(res), idOf(req));
        ok(res, outcome, outcome.restoredApproved ? 'Draft discarded. The approved photos are back.' : 'Draft discarded.');
    };

    photoFile = async (req: Request, res: Response): Promise<void> => {
        const file = await this.service.photoFile(signedInUserId(res), idOf(req), photoIdOf(req));
        sendInline(res, { ...file, isPublic: false });
    };
}
