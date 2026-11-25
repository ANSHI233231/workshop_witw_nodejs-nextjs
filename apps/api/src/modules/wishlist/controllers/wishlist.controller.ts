import type { Request, Response } from 'express';

import { ok } from '../../../core/http';
import type { IWishlistService } from '../contracts/wishlist-service.contract';
import { WISHLIST_MESSAGES, type WishlistItemParams, type WishlistPageQuery } from '../validators/wishlist.validators';

const signedInUserId = (res: Response): number => (res.locals['authUser'] as { readonly id: number }).id;

const itemIdOf = (req: Request): number => (req.params as unknown as WishlistItemParams).id;

const pageOf = (req: Request): number => (req.query as unknown as WishlistPageQuery).page;

export class WishlistController {
    constructor(private readonly service: IWishlistService) {}

    ids = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.savedIds(signedInUserId(res)));
    };

    packages = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.packages(signedInUserId(res), pageOf(req)));
    };

    sharedSafaris = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.sharedSafaris(signedInUserId(res), pageOf(req)));
    };

    addPackage = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.addPackage(signedInUserId(res), itemIdOf(req)), WISHLIST_MESSAGES.PACKAGE_ADDED);
    };

    removePackage = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.removePackage(signedInUserId(res), itemIdOf(req)), WISHLIST_MESSAGES.PACKAGE_REMOVED);
    };

    addSharedSafari = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.addSharedSafari(signedInUserId(res), itemIdOf(req)), WISHLIST_MESSAGES.SAFARI_ADDED);
    };

    removeSharedSafari = async (req: Request, res: Response): Promise<void> => {
        ok(
            res,
            await this.service.removeSharedSafari(signedInUserId(res), itemIdOf(req)),
            WISHLIST_MESSAGES.SAFARI_REMOVED,
        );
    };
}
