import type { WebsitePageDto } from '../../package';
import type { WebsiteParkCardDto } from '../../park';
import type { UserSafariPage } from '../../shared-safari';

export type PartnerPackagesPage = WebsitePageDto;

export type PartnerParksPage = {
    readonly items: readonly WebsiteParkCardDto[];
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
    readonly hasMore: boolean;
};

export type UserSafarisPage = UserSafariPage;
