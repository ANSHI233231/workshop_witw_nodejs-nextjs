import type { SafariCardDto, UserSafariPage, WishlistSafariState } from '../dto/shared-safari.dto';

export interface ISharedSafariService {
    wishlistState(id: number): Promise<WishlistSafariState | null>;
    cardsOfIds(ids: readonly number[], viewerId: number): Promise<SafariCardDto[]>;
    activeOfUser(userId: number, page: number, viewerId: number): Promise<UserSafariPage>;
}
