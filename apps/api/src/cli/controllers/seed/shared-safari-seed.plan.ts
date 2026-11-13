import { NotificationKind } from '../../../modules/notification';
import {
    AdminDeleteReason,
    type SeedComment,
    type SeedSafari,
    SharedSafariStatus,
    SharedSafariTheme,
    StayCategory,
} from '../../../modules/shared-safari';

import {
    type ProtoComment,
    type ProtoNote,
    type ProtoSafari,
    type ProtoStatus,
    PROTOTYPE_NOTES,
    PROTOTYPE_TODAY,
    type SeedPersonKey,
} from './shared-safari-seed.data';

const DAY_MS = 86_400_000;

const INDIA_OFFSET_MINUTES = 330;

const COVERED_UP_TO_ID = 13;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const THEME_OF: Readonly<Record<ProtoSafari['purpose'], number>> = {
    Photography: SharedSafariTheme.PHOTOGRAPHY,
    'Safari Experience': SharedSafariTheme.SAFARI_EXPERIENCE,
};

const STAY_OF: Readonly<Record<string, number>> = {
    Premium: StayCategory.PREMIUM,
    Standard: StayCategory.STANDARD,
    Economical: StayCategory.ECONOMICAL,
    'Not Included': StayCategory.NOT_INCLUDED,
    'Forest Rest House': StayCategory.FOREST_REST_HOUSE,
    'Home Stay': StayCategory.HOME_STAY,
};

const STATUS_OF: Readonly<Record<ProtoStatus, number>> = {
    active: SharedSafariStatus.ACTIVE,
    seatfull: SharedSafariStatus.SEAT_FULL,
    inactive: SharedSafariStatus.INACTIVE,
    deladmin: SharedSafariStatus.DELETED_BY_ADMIN,
    delhost: SharedSafariStatus.DELETED_BY_HOST,
};

const DELETE_REASON_OF: Readonly<Record<string, number>> = {
    'Abusive or Illegal': AdminDeleteReason.ABUSIVE_OR_ILLEGAL,
    'Commercial or Spam': AdminDeleteReason.COMMERCIAL_OR_SPAM,
    'Dating / Sexually Explicit': AdminDeleteReason.DATING_OR_SEXUALLY_EXPLICIT,
    'Felt Unsafe': AdminDeleteReason.FELT_UNSAFE,
    'Shows My Private Information': AdminDeleteReason.SHOWS_PRIVATE_INFORMATION,
    'Violates Guidelines': AdminDeleteReason.VIOLATES_GUIDELINES,
    'Off Topic': AdminDeleteReason.OFF_TOPIC,
    Other: AdminDeleteReason.OTHER,
};

const NOTE_KIND_OF: Readonly<Record<ProtoNote['kind'], typeof NotificationKind.SHARED_SAFARI_JOINED | typeof NotificationKind.SHARED_SAFARI_COMMENTED>> = {
    joined: NotificationKind.SHARED_SAFARI_JOINED,
    commented: NotificationKind.SHARED_SAFARI_COMMENTED,
};

export type SeedCover = { readonly content: Buffer; readonly contentType: string };

export type SeedContext = {
    readonly today: string;
    readonly userIdOf: (key: SeedPersonKey) => number;
    readonly adminId: number | null;
    readonly covers: readonly SeedCover[];
};

const dayNumber = (date: string): number => Date.parse(`${date}T00:00:00Z`) / DAY_MS;

const addDays = (date: string, days: number): string =>
    new Date((dayNumber(date) + days) * DAY_MS).toISOString().slice(0, 10);

export const daysAfterPrototype = (today: string): number => dayNumber(today) - dayNumber(PROTOTYPE_TODAY);

export const shiftOf = (safari: ProtoSafari, today: string): number => {
    const offset = daysAfterPrototype(today);
    const openInPrototype = safari.end >= PROTOTYPE_TODAY;
    return offset > 0 && openInPrototype && safari.end < today ? offset : 0;
};

const indiaTime = (text: string): Date => {
    const iso = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(text);
    const spoken = /^(\d{2}) ([A-Z][a-z]{2}) (\d{4}) (\d{2}):(\d{2})$/.exec(text);
    const [year, month, day, hour, minute] = iso
        ? [Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), Number(iso[4]), Number(iso[5])]
        : spoken
          ? [Number(spoken[3]), MONTHS.indexOf(spoken[2] ?? ''), Number(spoken[1]), Number(spoken[4]), Number(spoken[5])]
          : [NaN, NaN, NaN, NaN, NaN];
    const utc = Date.UTC(year, month, day, hour, minute) - INDIA_OFFSET_MINUTES * 60_000;
    if (Number.isNaN(utc)) throw new Error(`Not a prototype time: "${text}"`);
    return new Date(utc);
};

const commentOf = (comment: ProtoComment, context: SeedContext): SeedComment => ({
    userId: context.userIdOf(comment.who),
    at: indiaTime(comment.at),
    text: comment.text,
    replies: comment.replies.map((reply) => commentOf(reply, context)),
    flags: comment.flags.map((flag) => ({
        userId: context.userIdOf(flag.who),
        reasonName: flag.reason,
        details: flag.details,
        at: indiaTime(flag.at),
    })),
});

const deletedAtOf = (safari: ProtoSafari): Date | null => {
    if (safari.status === 'delhost') return indiaTime(safari.deletedAt ?? safari.updated);
    if (safari.status === 'deladmin') return indiaTime(safari.updated);
    return null;
};

const deletedByOf = (safari: ProtoSafari, context: SeedContext): number | null => {
    if (safari.status === 'delhost') return context.userIdOf(safari.host);
    if (safari.status === 'deladmin') return context.adminId;
    return null;
};

export const seedSafariOf = (safari: ProtoSafari, context: SeedContext): SeedSafari => {
    const shift = shiftOf(safari, context.today);
    const createdAt = indiaTime(safari.created);
    return {
        slug: safari.slug,
        title: safari.title,
        parkName: safari.park,
        theme: THEME_OF[safari.purpose],
        startDate: addDays(safari.start, shift),
        endDate: addDays(safari.end, shift),
        safariCount: safari.safaris,
        totalSeats: safari.seats,
        sharedSeats: safari.share,
        pricePerPersonMin: safari.from,
        pricePerPersonMax: safari.to,
        stayCategory: STAY_OF[safari.stay] ?? null,
        safariPlan: safari.plan,
        hostId: context.userIdOf(safari.host),
        status: STATUS_OF[safari.status],
        isPinned: safari.pinned,
        deleteReason: safari.delReason ? (DELETE_REASON_OF[safari.delReason] ?? AdminDeleteReason.OTHER) : null,
        deleteDetails: safari.delDetails ?? null,
        deletedAt: deletedAtOf(safari),
        deletedById: deletedByOf(safari, context),
        createdAt,
        updatedAt: indiaTime(safari.updated),
        cover: safari.id <= COVERED_UP_TO_ID ? (context.covers[(safari.id - 1) % context.covers.length] ?? null) : null,
        joined: safari.joined.map((member) => ({ userId: context.userIdOf(member.who), at: indiaTime(member.at) })),
        left: safari.left.map((member) => ({
            userId: context.userIdOf(member.who),
            joinedAt: createdAt,
            leftAt: indiaTime(member.at),
        })),
        comments: safari.comments.map((comment) => commentOf(comment, context)),
        notes: PROTOTYPE_NOTES.filter((note) => note.sid === safari.id).map((note) => ({
            userId: context.userIdOf(note.to),
            kind: NOTE_KIND_OF[note.kind],
            actorId: context.userIdOf(note.who),
            at: indiaTime(note.at),
            read: note.read,
        })),
    };
};
