import { z } from 'zod';

export const WISHLIST_MESSAGES = {
    PARTNER: "Partners don't have a wishlist.",
    PACKAGE_NOT_AVAILABLE: 'This package is not on the website now.',
    SAFARI_NOT_AVAILABLE: "This shared safari can't be saved now.",
    NOT_IN_WISHLIST: 'This item is not in your wishlist.',
    PACKAGE_ADDED: 'You added the Package to your wishlist!',
    PACKAGE_REMOVED: 'You removed the Package from your wishlist!',
    SAFARI_ADDED: 'You added the Shared Safari to your wishlist!',
    SAFARI_REMOVED: 'You removed the Shared Safari from your wishlist!',
    ACCOUNT_NOT_FOUND: 'Your account was not found.',
} as const;

const positiveId = (message: string) =>
    z.coerce.number({ required_error: message, invalid_type_error: message }).int(message).positive(message);

const packageParams = z.object({ id: positiveId(WISHLIST_MESSAGES.PACKAGE_NOT_AVAILABLE) });

const safariParams = z.object({ id: positiveId(WISHLIST_MESSAGES.SAFARI_NOT_AVAILABLE) });

export type WishlistItemParams = { readonly id: number };

export const packageItemSchema = z.object({ params: packageParams });

export const safariItemSchema = z.object({ params: safariParams });

export const wishlistPageSchema = z.object({
    query: z.object({ page: z.coerce.number().int().positive().optional().default(1) }),
});

export type WishlistPageQuery = z.infer<typeof wishlistPageSchema>['query'];
