import {
    GalleryStatus,
    type GalleryListItem,
    type GalleryStatusCode,
    type GalleryTabKey,
    GalleryTab,
} from '@/types/gallery.types';

export const GALLERY_PATH = '/gallery';

export const TAB_LABELS: Readonly<Record<GalleryTabKey, string>> = {
    approved: 'Approved',
    draft: 'In Draft',
    waiting: 'Waiting for Approval',
};

export const STATUS_BADGE: Readonly<Record<GalleryStatusCode, { readonly label: string; readonly css: string }>> = {
    [GalleryStatus.DRAFT]: { label: 'In Draft', css: 'badge badge-neutral' },
    [GalleryStatus.WAITING]: { label: 'Waiting for Approval', css: 'badge badge-warning' },
    [GalleryStatus.APPROVED]: { label: 'Approved', css: 'badge badge-success' },
};

export const tabUrl = (tab: GalleryTabKey): string =>
    tab === GalleryTab.APPROVED ? GALLERY_PATH : `${GALLERY_PATH}?tab=${tab}`;

export type CardAction = 'view' | 'edit' | 'send' | 'delete';

export type CardView = {
    readonly label: string;
    readonly css: string;
    readonly note: string | null;
    readonly actions: readonly CardAction[];
    readonly deleteLabel: string;
};

export const cardOf = (item: GalleryListItem, tab: GalleryTabKey): CardView => {
    const deleteLabel = item.hasApprovedSet ? 'Delete draft' : 'Delete';
    if (tab === GalleryTab.APPROVED) {
        const open = item.status !== GalleryStatus.APPROVED;
        return {
            label: open ? 'Approved (live)' : 'Approved',
            css: STATUS_BADGE[GalleryStatus.APPROVED].css,
            note: !open
                ? null
                : item.status === GalleryStatus.WAITING
                  ? 'Changes are waiting for approval.'
                  : 'You have unsent changes in draft.',
            actions: [open ? 'view' : 'edit'],
            deleteLabel,
        };
    }
    if (tab === GalleryTab.DRAFT) {
        return {
            label: item.hasApprovedSet ? 'Draft of approved gallery' : 'In Draft',
            css: STATUS_BADGE[GalleryStatus.DRAFT].css,
            note: item.rejectReason ? `Rejected: ${item.rejectReason}` : null,
            actions: ['edit', 'send', 'delete'],
            deleteLabel,
        };
    }
    return {
        label: item.hasApprovedSet ? 'Changes to approved gallery' : 'Waiting for Approval',
        css: STATUS_BADGE[GalleryStatus.WAITING].css,
        note: null,
        actions: ['view'],
        deleteLabel,
    };
};

export const photoCountText = (count: number): string => `${count} ${count === 1 ? 'photo' : 'photos'}`;
