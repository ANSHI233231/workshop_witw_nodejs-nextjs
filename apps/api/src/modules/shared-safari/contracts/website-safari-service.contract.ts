import type {
    CoverImage,
    PublicFilters,
    PublicPage,
    SafariCardDto,
    SafariEditDto,
    SafariInput,
    SafariViewDto,
    Viewer,
} from '../dto/shared-safari.dto';
import type { MyTabCode } from '../types/shared-safari.types';

type SignedIn = { readonly id: number };

export interface IWebsiteSafariService {
    list(filters: PublicFilters, page: number, viewer: Viewer): Promise<PublicPage>;
    mine(tab: MyTabCode, viewer: SignedIn): Promise<SafariCardDto[]>;
    view(ref: string, viewer: Viewer): Promise<SafariViewDto>;
    editForm(id: number, viewer: SignedIn): Promise<SafariEditDto>;
    create(input: SafariInput, viewer: SignedIn): Promise<{ id: number; slug: string }>;
    update(id: number, input: SafariInput, viewer: SignedIn): Promise<{ id: number; slug: string }>;
    setCover(id: number, image: CoverImage, viewer: SignedIn): Promise<{ coverVersion: string }>;
    cover(id: number, viewer: Viewer): Promise<CoverImage>;
    setStatus(id: number, status: number, viewer: SignedIn): Promise<void>;
    remove(id: number, viewer: SignedIn): Promise<void>;
    join(id: number, viewer: SignedIn): Promise<void>;
    leave(id: number, viewer: SignedIn): Promise<void>;
}
