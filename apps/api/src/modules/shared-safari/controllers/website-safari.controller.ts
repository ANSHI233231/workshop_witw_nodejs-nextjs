import type { Request, Response } from 'express';

import { ValidationException } from '../../../core/exceptions';
import { created, ok, sendInline, uploadedFiles } from '../../../core/http';
import { detectImageType } from '../../../core/validation';
import type { IDiscussionService } from '../contracts/discussion-service.contract';
import type { IWebsiteSafariService } from '../contracts/website-safari-service.contract';
import type { CommentInput, FlagInput, PublicFilters, SafariInput, Viewer } from '../dto/shared-safari.dto';
import { IMAGE_TYPES, type MyTabCode, type SortKeyCode } from '../types/shared-safari.types';
import type { PublicListQuery } from '../validators/shared-safari.validators';

type SignedInUser = { readonly id: number };

const viewerOf = (res: Response): Viewer => {
    const user = res.locals['authUser'] as SignedInUser | undefined;
    return user ? { id: user.id } : null;
};

const signedIn = (res: Response): SignedInUser => ({ id: (res.locals['authUser'] as SignedInUser).id });

const idOf = (req: Request): number => (req.params as unknown as { id: number }).id;

const imageRule = (message: string): ValidationException =>
    new ValidationException(message, [{ field: 'image', message }], 'SHARED_SAFARI_IMAGE_TYPE');

export class WebsiteSafariController {
    constructor(
        private readonly safaris: IWebsiteSafariService,
        private readonly discussion: IDiscussionService,
    ) {}

    list = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as PublicListQuery;
        const filters: PublicFilters = {
            parkId: query.parkId,
            month: query.month,
            priceMin: query.priceMin,
            priceMax: query.priceMax,
            safarisMin: query.safarisMin,
            safarisMax: query.safarisMax,
            themes: query.themes,
            stays: query.stays,
            sort: query.sort as SortKeyCode,
        };
        ok(res, await this.safaris.list(filters, query.page, viewerOf(res)));
    };

    mine = async (req: Request, res: Response): Promise<void> => {
        const { tab } = req.query as unknown as { tab: MyTabCode };
        ok(res, await this.safaris.mine(tab, signedIn(res)));
    };

    view = async (req: Request, res: Response): Promise<void> => {
        const { ref } = req.params as unknown as { ref: string };
        ok(res, await this.safaris.view(ref, viewerOf(res)));
    };

    editForm = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.safaris.editForm(idOf(req), signedIn(res)));
    };

    create = async (req: Request, res: Response): Promise<void> => {
        created(res, await this.safaris.create(req.body as SafariInput, signedIn(res)), 'Your safari is live.');
    };

    update = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.safaris.update(idOf(req), req.body as SafariInput, signedIn(res)), 'Safari updated.');
    };

    uploadCover = async (req: Request, res: Response): Promise<void> => {
        const file = uploadedFiles(req)[0];
        if (!file) throw imageRule('Choose an image.');
        const type = detectImageType(file.content);
        if (!type || !IMAGE_TYPES.includes(type.contentType)) throw imageRule('Use a PNG, JPG or JPEG image.');
        ok(
            res,
            await this.safaris.setCover(idOf(req), { content: file.content, contentType: type.contentType }, signedIn(res)),
        );
    };

    cover = async (req: Request, res: Response): Promise<void> => {
        const image = await this.safaris.cover(idOf(req), viewerOf(res));
        sendInline(res, { ...image, isPublic: true });
    };

    setStatus = async (req: Request, res: Response): Promise<void> => {
        const { status } = req.body as { status: number };
        await this.safaris.setStatus(idOf(req), status, signedIn(res));
        ok(res, null, 'Status updated.');
    };

    remove = async (req: Request, res: Response): Promise<void> => {
        await this.safaris.remove(idOf(req), signedIn(res));
        ok(res, null, 'Safari deleted.');
    };

    join = async (req: Request, res: Response): Promise<void> => {
        await this.safaris.join(idOf(req), signedIn(res));
        ok(res, null, "You've joined this safari.");
    };

    leave = async (req: Request, res: Response): Promise<void> => {
        await this.safaris.leave(idOf(req), signedIn(res));
        ok(res, null, "You've left this safari.");
    };

    postComment = async (req: Request, res: Response): Promise<void> => {
        created(res, await this.discussion.post(idOf(req), req.body as CommentInput, signedIn(res)), 'Comment posted.');
    };

    editComment = async (req: Request, res: Response): Promise<void> => {
        await this.discussion.edit(idOf(req), (req.body as { text: string }).text, signedIn(res));
        ok(res, null, 'Comment updated.');
    };

    removeComment = async (req: Request, res: Response): Promise<void> => {
        await this.discussion.remove(idOf(req), signedIn(res));
        ok(res, null, 'Comment deleted.');
    };

    flag = async (req: Request, res: Response): Promise<void> => {
        await this.discussion.flag(idOf(req), req.body as FlagInput, signedIn(res));
        ok(res, null, "Thanks, we'll review this comment.");
    };
}
