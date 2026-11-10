import type { MyTabCode, SortKeyCode } from '../types/shared-safari.types';

export type Viewer = { readonly id: number } | null;

export type SafariInput = {
    readonly title: string;
    readonly masterParkId: number;
    readonly startDate: string;
    readonly endDate: string;
    readonly safariCount: number;
    readonly theme: number;
    readonly totalSeats: number;
    readonly sharedSeats: number;
    readonly pricePerPersonMin: number;
    readonly pricePerPersonMax: number;
    readonly stayCategory: number | null;
    readonly safariPlan: string;
};

export type PublicFilters = {
    readonly parkId?: number;
    readonly month?: number;
    readonly priceMin?: number;
    readonly priceMax?: number;
    readonly safarisMin?: number;
    readonly safarisMax?: number;
    readonly themes: readonly number[];
    readonly stays: readonly number[];
    readonly sort: SortKeyCode;
};

export type ConsoleFilters = {
    readonly search?: string;
    readonly status?: number;
    readonly hostId?: number;
};

export type PersonDto = { readonly id: number; readonly name: string; readonly initials: string };

export type MemberDto = PersonDto & { readonly joinedAt: string; readonly leftAt: string | null };

export type ViewerStateDto = {
    readonly signedIn: boolean;
    readonly isHost: boolean;
    readonly joined: boolean;
    readonly hasLeft: boolean;
    readonly canJoin: boolean;
    readonly canComment: boolean;
};

export type SafariCardDto = {
    readonly id: number;
    readonly slug: string;
    readonly title: string;
    readonly host: PersonDto;
    readonly park: { readonly id: number; readonly name: string };
    readonly startDate: string;
    readonly endDate: string;
    readonly safariCount: number;
    readonly totalSeats: number;
    readonly sharedSeats: number;
    readonly pricePerPersonMin: number;
    readonly pricePerPersonMax: number;
    readonly theme: number;
    readonly stayCategory: number | null;
    readonly hasCover: boolean;
    readonly coverVersion: string | null;
    readonly status: number;
    readonly isStarted: boolean;
    readonly joinedCount: number;
    readonly faces: readonly PersonDto[];
    readonly createdAt: string;
    readonly viewer: ViewerStateDto;
};

export type CommentDto = {
    readonly id: number;
    readonly writer: PersonDto;
    readonly isHost: boolean;
    readonly text: string;
    readonly createdAt: string;
    readonly isMine: boolean;
    readonly canEdit: boolean;
    readonly canFlag: boolean;
    readonly replies: readonly CommentDto[];
};

export type SafariViewDto = SafariCardDto & {
    readonly safariPlan: string;
    readonly commentCount: number;
    readonly interested: readonly MemberDto[];
    readonly comments: readonly CommentDto[];
};

export type SafariEditDto = SafariInput & {
    readonly id: number;
    readonly slug: string;
    readonly parkName: string;
    readonly parkActive: boolean;
    readonly hasCover: boolean;
    readonly coverVersion: string | null;
};

export type PublicPage = {
    readonly items: SafariCardDto[];
    readonly total: number;
    readonly activeTotal: number;
};

export type MyQuery = { readonly tab: MyTabCode };

export type ConsoleSafariDto = {
    readonly id: number;
    readonly slug: string;
    readonly title: string;
    readonly host: PersonDto & { readonly isActive: boolean };
    readonly park: { readonly id: number; readonly name: string };
    readonly startDate: string;
    readonly endDate: string;
    readonly totalSeats: number;
    readonly sharedSeats: number;
    readonly joinedCount: number;
    readonly leftCount: number;
    readonly status: number;
    readonly isPinned: boolean;
    readonly createdAt: string;
};

export type ConsoleCommentDto = {
    readonly id: number;
    readonly writer: PersonDto;
    readonly isHost: boolean;
    readonly text: string;
    readonly createdAt: string;
    readonly replyCount: number;
    readonly flagCount: number;
    readonly openFlagCount: number;
    readonly replies: readonly ConsoleCommentDto[];
};

export type ConsoleSafariDetailDto = ConsoleSafariDto & {
    readonly hostEmail: string | null;
    readonly updatedAt: string;
    readonly theme: number;
    readonly stayCategory: number | null;
    readonly safariCount: number;
    readonly pricePerPersonMin: number;
    readonly pricePerPersonMax: number;
    readonly safariPlan: string;
    readonly hasCover: boolean;
    readonly coverVersion: string | null;
    readonly deleteReason: number | null;
    readonly deleteDetails: string | null;
    readonly deletedAt: string | null;
    readonly deletedByName: string | null;
    readonly joined: readonly MemberDto[];
    readonly left: readonly MemberDto[];
    readonly comments: readonly ConsoleCommentDto[];
};

export type FlaggedCommentDto = {
    readonly id: number;
    readonly safari: { readonly id: number; readonly title: string; readonly slug: string };
    readonly isReply: boolean;
    readonly writerName: string;
    readonly text: string;
    readonly reasons: readonly string[];
    readonly flagCount: number;
    readonly lastFlaggedAt: string;
};

export type FlagDto = {
    readonly id: number;
    readonly reason: string;
    readonly details: string;
    readonly flaggerName: string;
    readonly createdAt: string;
};

export type Paged<T> = { readonly items: T[]; readonly total: number };

export type CommentInput = { readonly text: string; readonly parentId: number | null };

export type FlagInput = { readonly reasonId: number; readonly details: string };

export type AdminDeleteInput = { readonly reason: number; readonly details: string };

export type CoverImage = { readonly content: Buffer; readonly contentType: string };
