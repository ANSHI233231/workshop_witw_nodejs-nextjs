import type {
    CommentDto,
    ConsoleCommentDto,
    ConsoleSafariDetailDto,
    ConsoleSafariDto,
    FlagDto,
    FlaggedCommentDto,
    MemberDto,
    PartnerBadgeDto,
    PersonDto,
    SafariCardDto,
    SafariEditDto,
    ViewerStateDto,
} from '../dto/shared-safari.dto';
import {
    type CommentRow,
    type FaceRow,
    type FlaggedRow,
    type FlagRow,
    INDIA_TIME_ZONE,
    type MemberRow,
    type PartnerIdentity,
    type PartnersByUser,
    type SafariRow,
    SHARED_SAFARI_LIMITS,
    SharedSafariMemberStatus,
    SharedSafariStatus,
} from '../types/shared-safari.types';

const INDIA_DATE = new Intl.DateTimeFormat('en-CA', {
    timeZone: INDIA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

const DAY_MS = 86_400_000;

export const todayInIndia = (now: Date = new Date()): string => INDIA_DATE.format(now);

export const addDays = (date: string, days: number): string =>
    new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);

export const wordCount = (text: string): number => text.split(' ').filter((word) => word.trim().length > 0).length;

const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/g;

const PHONE = /(\+?\d[\d\s-]{6,}\d)/g;

export const maskContacts = (text: string): string => text.replace(EMAIL, '••••').replace(PHONE, '••••');

export const initialsOf = (name: string): string =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('') || '?';

const iso = (value: Date | string | null): string | null =>
    value === null ? null : value instanceof Date ? value.toISOString() : new Date(value).toISOString();

const isoOf = (value: Date | string): string => iso(value) ?? '';

const badgeOf = (partner: PartnerIdentity | undefined): PartnerBadgeDto | null =>
    partner ? { id: partner.id, businessName: partner.businessName, logoVersion: partner.logoVersion } : null;

export type PersonShown = (id: number, name: string, photoVersion: string | null) => PersonDto;

export const shownOnWebsite =
    (partners: PartnersByUser): PersonShown =>
    (id, name, photoVersion) => {
        const partner = partners.get(id);
        const shownName = partner?.businessName ?? name;
        return {
            id,
            name: shownName,
            initials: initialsOf(shownName),
            photoVersion: partner ? null : photoVersion,
            partner: badgeOf(partner),
        };
    };

export const shownInConsole =
    (partners: PartnersByUser): PersonShown =>
    (id, name, photoVersion) => ({
        id,
        name,
        initials: initialsOf(name),
        photoVersion,
        partner: badgeOf(partners.get(id)),
    });

export const memberOf = (row: FaceRow, show: PersonShown): MemberDto => ({
    ...show(row.userId, row.name, row.photoVersion),
    joinedAt: isoOf(row.joinedAt),
    leftAt: iso(row.leftAt),
});

const coverVersionOf = (row: SafariRow): string | null => row.coverImage;

export type ViewerOfSafari = { readonly id: number | null; readonly isPartner: boolean };

export const viewerStateOf = (row: SafariRow, viewer: ViewerOfSafari, member: MemberRow | undefined): ViewerStateDto => {
    const viewerId = viewer.id;
    const isHost = viewerId !== null && row.userId === viewerId;
    const joined = member?.status === SharedSafariMemberStatus.JOINED;
    const hasLeft = member?.status === SharedSafariMemberStatus.LEFT;
    const open = row.status === SharedSafariStatus.ACTIVE || row.status === SharedSafariStatus.SEAT_FULL;
    return {
        signedIn: viewerId !== null,
        isPartner: viewer.isPartner,
        isHost,
        joined,
        hasLeft,
        canJoin:
            viewerId !== null && !viewer.isPartner && !isHost && !joined && row.status === SharedSafariStatus.ACTIVE,
        canComment: viewerId !== null && open && (isHost || member !== undefined),
    };
};

export const toCard = (
    row: SafariRow,
    faces: readonly FaceRow[],
    viewer: ViewerOfSafari,
    member: MemberRow | undefined,
    today: string,
    show: PersonShown,
): SafariCardDto => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    host: show(row.userId, row.hostName, row.hostPhoto),
    park: { id: row.masterParkId, name: row.parkName },
    startDate: row.startDate,
    endDate: row.endDate,
    safariCount: row.safariCount,
    totalSeats: row.totalSeats,
    sharedSeats: row.sharedSeats,
    pricePerPersonMin: row.pricePerPersonMin,
    pricePerPersonMax: row.pricePerPersonMax,
    theme: row.theme,
    stayCategory: row.stayCategory,
    hasCover: row.coverImage !== null,
    coverVersion: coverVersionOf(row),
    status: row.status,
    isStarted: row.startDate < today,
    joinedCount: Number(row.joinedCount),
    faces: faces.slice(0, SHARED_SAFARI_LIMITS.CARD_FACES).map((face) => show(face.userId, face.name, face.photoVersion)),
    createdAt: isoOf(row.createdAt),
    viewer: viewerStateOf(row, viewer, member),
});

export const toEdit = (row: SafariRow): SafariEditDto => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    masterParkId: row.masterParkId,
    parkName: row.parkName,
    parkActive: row.parkStatus === 1,
    startDate: row.startDate,
    endDate: row.endDate,
    safariCount: row.safariCount,
    theme: row.theme,
    totalSeats: row.totalSeats,
    sharedSeats: row.sharedSeats,
    pricePerPersonMin: row.pricePerPersonMin,
    pricePerPersonMax: row.pricePerPersonMax,
    stayCategory: row.stayCategory,
    safariPlan: row.safariPlan,
    hasCover: row.coverImage !== null,
    coverVersion: coverVersionOf(row),
});

export type CommentRules = {
    readonly viewerId: number | null;
    readonly hostId: number;
    readonly viewerMayEdit: boolean;
    readonly show: PersonShown;
};

const commentOf = (row: CommentRow, rules: CommentRules, replies: readonly CommentDto[]): CommentDto => {
    const isMine = rules.viewerId !== null && row.userId === rules.viewerId;
    return {
        id: row.id,
        writer: rules.show(row.userId, row.writerName, row.writerPhoto),
        isHost: row.userId === rules.hostId,
        text: row.commentText,
        createdAt: isoOf(row.createdAt),
        isMine,
        canEdit: isMine && rules.viewerMayEdit,
        canFlag: rules.viewerId !== null && !isMine,
        replies,
    };
};

export const toThread = (rows: readonly CommentRow[], rules: CommentRules): CommentDto[] => {
    const tops = rows.filter((row) => row.sharedSafariCommentId === null);
    return tops.map((top) =>
        commentOf(
            top,
            rules,
            rows.filter((row) => row.sharedSafariCommentId === top.id).map((reply) => commentOf(reply, rules, [])),
        ),
    );
};

const consoleCommentOf = (
    row: CommentRow,
    hostId: number,
    replies: readonly ConsoleCommentDto[],
    show: PersonShown,
): ConsoleCommentDto => ({
    id: row.id,
    writer: show(row.userId, row.writerName, row.writerPhoto),
    isHost: row.userId === hostId,
    text: row.commentText,
    createdAt: isoOf(row.createdAt),
    replyCount: replies.length,
    flagCount: Number(row.allFlags),
    openFlagCount: Number(row.openFlags),
    replies,
});

export const toConsoleThread = (rows: readonly CommentRow[], hostId: number, show: PersonShown): ConsoleCommentDto[] =>
    rows
        .filter((row) => row.sharedSafariCommentId === null)
        .map((top) =>
            consoleCommentOf(
                top,
                hostId,
                rows
                    .filter((row) => row.sharedSafariCommentId === top.id)
                    .map((reply) => consoleCommentOf(reply, hostId, [], show)),
                show,
            ),
        );

export const toConsoleSafari = (row: SafariRow, show: PersonShown): ConsoleSafariDto => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    host: { ...show(row.userId, row.hostName, row.hostPhoto), isActive: row.hostStatus === 1 },
    park: { id: row.masterParkId, name: row.parkName },
    startDate: row.startDate,
    endDate: row.endDate,
    totalSeats: row.totalSeats,
    sharedSeats: row.sharedSeats,
    joinedCount: Number(row.joinedCount),
    leftCount: Number(row.leftCount),
    status: row.status,
    isPinned: row.isPinned === 1,
    createdAt: isoOf(row.createdAt),
});

export const toConsoleDetail = (
    row: SafariRow,
    joined: readonly FaceRow[],
    left: readonly FaceRow[],
    comments: readonly CommentRow[],
    show: PersonShown,
): ConsoleSafariDetailDto => ({
    ...toConsoleSafari(row, show),
    hostEmail: row.hostEmail,
    updatedAt: isoOf(row.updatedAt),
    theme: row.theme,
    stayCategory: row.stayCategory,
    safariCount: row.safariCount,
    pricePerPersonMin: row.pricePerPersonMin,
    pricePerPersonMax: row.pricePerPersonMax,
    safariPlan: row.safariPlan,
    hasCover: row.coverImage !== null,
    coverVersion: coverVersionOf(row),
    deleteReason: row.deleteReason,
    deleteDetails: row.deleteDetails,
    deletedAt: iso(row.deletedAt),
    deletedByName: row.deletedByName,
    joined: joined.map((member) => memberOf(member, show)),
    left: left.map((member) => memberOf(member, show)),
    comments: toConsoleThread(comments, row.userId, show),
});

export const toFlagged = (row: FlaggedRow, partners: PartnersByUser): FlaggedCommentDto => ({
    id: row.id,
    safari: { id: row.sharedSafariId, title: row.safariTitle, slug: row.safariSlug },
    isReply: row.sharedSafariCommentId !== null,
    writerName: row.writerName,
    writerBusinessName: partners.get(row.userId)?.businessName ?? null,
    text: row.commentText,
    reasons: row.reasons ? row.reasons.split('\n') : [],
    flagCount: Number(row.openFlags),
    lastFlaggedAt: isoOf(row.lastFlaggedAt),
});

export const toFlag = (row: FlagRow, partners: PartnersByUser): FlagDto => ({
    id: row.id,
    reason: row.reasonName,
    details: row.details,
    flaggerName: row.flaggerName,
    flaggerBusinessName: partners.get(row.userId)?.businessName ?? null,
    createdAt: isoOf(row.createdAt),
});
