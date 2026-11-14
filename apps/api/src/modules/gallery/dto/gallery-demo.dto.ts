import type { GalleryStatusCode } from '../types/gallery.types';

export type DemoGalleryPhoto = {
    readonly picture: string;
    readonly title: string | null;
    readonly caption: string | null;
};

export type DemoGallery = {
    readonly partnerId: number;
    readonly userId: number;
    readonly title: string;
    readonly masterParkId: number;
    readonly status: GalleryStatusCode;
    readonly approvedPhotos: readonly DemoGalleryPhoto[] | null;
    readonly draftPhotos: readonly DemoGalleryPhoto[] | null;
    readonly rejectReason: string | null;
    readonly sentAt: Date | null;
    readonly decidedAt: Date | null;
};

export type DemoGalleryOutcome = {
    readonly title: string;
    readonly galleryId: number;
    readonly created: boolean;
};

export type DemoGalleryRef = {
    readonly galleryId: number;
    readonly partnerId: number;
    readonly title: string;
};
