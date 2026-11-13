import type { SeedNote } from '../contracts/shared-safari-seed-module.contract';
import type { CoverImage } from './shared-safari.dto';

export type SeedFlag = {
    readonly userId: number;
    readonly reasonName: string;
    readonly details: string;
    readonly at: Date;
};

export type SeedComment = {
    readonly userId: number;
    readonly at: Date;
    readonly text: string;
    readonly replies: readonly SeedComment[];
    readonly flags: readonly SeedFlag[];
};

export type SeedSafari = {
    readonly slug: string;
    readonly title: string;
    readonly parkName: string;
    readonly theme: number;
    readonly startDate: string;
    readonly endDate: string;
    readonly safariCount: number;
    readonly totalSeats: number;
    readonly sharedSeats: number;
    readonly pricePerPersonMin: number;
    readonly pricePerPersonMax: number;
    readonly stayCategory: number | null;
    readonly safariPlan: string;
    readonly hostId: number;
    readonly status: number;
    readonly isPinned: boolean;
    readonly deleteReason: number | null;
    readonly deleteDetails: string | null;
    readonly deletedAt: Date | null;
    readonly deletedById: number | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly cover: CoverImage | null;
    readonly joined: readonly { readonly userId: number; readonly at: Date }[];
    readonly left: readonly { readonly userId: number; readonly joinedAt: Date; readonly leftAt: Date }[];
    readonly comments: readonly SeedComment[];
    readonly notes: readonly SeedNote[];
};

export type SeedOutcome = { readonly slug: string; readonly created: boolean };

export type SeedRemoval = { readonly slugs: readonly string[]; readonly userIds: readonly number[] };

export type SeedRemovalCounts = {
    readonly safaris: number;
    readonly members: number;
    readonly comments: number;
    readonly flags: number;
    readonly notifications: number;
    readonly covers: number;
};
