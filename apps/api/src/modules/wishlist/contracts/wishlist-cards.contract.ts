import type { WebsiteCardDto } from '../../package';
import type { SafariCardDto } from '../../shared-safari';

export type WishlistPackageDto = WebsiteCardDto & { readonly savedAt: string };

export type WishlistSafariDto = SafariCardDto & { readonly savedAt: string };
