import { z } from 'zod';

import { paginationQuerySchema } from '../../../core/validation';
import { GALLERY_LIMITS, GALLERY_TABS, GalleryTab, type GalleryTabKey } from '../types/gallery.types';

export const GALLERY_MESSAGES = {
    TITLE_EMPTY: 'Enter the gallery title.',
    TITLE_TOO_LONG: `Use up to ${GALLERY_LIMITS.TITLE_MAX} characters.`,
    PARK_EMPTY: 'Choose the park.',
    PARK_NOT_AVAILABLE: 'This park is not available. Choose another park.',
    PHOTO_TYPE: 'Choose JPG, JPEG or PNG files.',
    PHOTO_SIZE: 'A photo is bigger than 8 MB.',
    PHOTO_MISSING: 'Choose a photo to upload.',
    PHOTO_TITLE_TOO_LONG: `Use up to ${GALLERY_LIMITS.PHOTO_TITLE_MAX} characters.`,
    CAPTION_TOO_LONG: 'Use up to 1,000 characters.',
    PHOTOS_NONE: 'Add at least one photo first.',
    PHOTOS_TOO_MANY: `Save up to ${GALLERY_LIMITS.PHOTOS_PER_SAVE} photos at a time.`,
    PHOTO_NOT_FOUND: 'This photo was not found.',
    PHOTO_LISTED_TWICE: 'Each photo can be listed only once.',
    THUMBNAIL_NOT_LISTED: "Choose one of the gallery's photos as the thumbnail.",
    THUMBNAIL_REMOVE: "The thumbnail can't be removed.",
    REASON_EMPTY: 'Enter the reason.',
    REASON_TOO_LONG: `Use up to ${GALLERY_LIMITS.REASON_MAX} characters.`,
    SEARCH_TOO_LONG: `Search can be at most ${GALLERY_LIMITS.SEARCH} characters.`,
    TAB: 'Choose a valid tab.',
    NOT_FOUND: 'This gallery was not found.',
    NOT_ACTIVE_PARTNER: 'Only an active partner can manage galleries.',
    NOT_DRAFT: 'Only a gallery in draft can be changed.',
    NOT_WAITING: 'This gallery is not waiting for approval.',
    NOT_APPROVED: 'Only an approved gallery with no open draft can be edited.',
    NOT_IN_USE: 'This gallery is not approved.',
} as const;

const textWithin = (empty: string, max: number, tooLong: string) =>
    z
        .string({ required_error: empty, invalid_type_error: empty })
        .trim()
        .superRefine((value, context) => {
            const problem = value.length === 0 ? empty : value.length > max ? tooLong : undefined;
            if (problem) context.addIssue({ code: z.ZodIssueCode.custom, message: problem });
        });

const optionalText = (max: number, tooLong: string) =>
    z
        .string({ invalid_type_error: tooLong })
        .trim()
        .max(max, tooLong)
        .nullable()
        .optional()
        .transform((value) => (value ? value : null));

const positiveId = (message: string) =>
    z.number({ required_error: message, invalid_type_error: message }).int(message).positive(message);

const coercedId = (message: string) =>
    z.coerce.number({ invalid_type_error: message }).int(message).positive(message);

const galleryTitle = textWithin(GALLERY_MESSAGES.TITLE_EMPTY, GALLERY_LIMITS.TITLE_MAX, GALLERY_MESSAGES.TITLE_TOO_LONG);

const masterParkId = positiveId(GALLERY_MESSAGES.PARK_EMPTY);

const idParams = z.object({ id: coercedId(GALLERY_MESSAGES.NOT_FOUND) });

const photoParams = idParams.extend({ photoId: coercedId(GALLERY_MESSAGES.PHOTO_NOT_FOUND) });

export type GalleryParams = z.infer<typeof idParams>;

export type GalleryPhotoParams = z.infer<typeof photoParams>;

const draftPhoto = z
    .object({
        id: positiveId(GALLERY_MESSAGES.PHOTO_NOT_FOUND),
        title: optionalText(GALLERY_LIMITS.PHOTO_TITLE_MAX, GALLERY_MESSAGES.PHOTO_TITLE_TOO_LONG),
        caption: optionalText(GALLERY_LIMITS.CAPTION_MAX, GALLERY_MESSAGES.CAPTION_TOO_LONG),
    })
    .strict();

const draftPhotos = z
    .array(draftPhoto, { invalid_type_error: GALLERY_MESSAGES.PHOTO_NOT_FOUND })
    .max(GALLERY_LIMITS.PHOTOS_PER_SAVE, GALLERY_MESSAGES.PHOTOS_TOO_MANY)
    .default([])
    .superRefine((photos, context) => {
        if (new Set(photos.map((photo) => photo.id)).size !== photos.length) {
            context.addIssue({ code: z.ZodIssueCode.custom, message: GALLERY_MESSAGES.PHOTO_LISTED_TWICE });
        }
    });

export const createGallerySchema = z.object({
    body: z.object({ title: galleryTitle, masterParkId }).strict(),
});

export const saveDraftSchema = z.object({
    params: idParams,
    body: z
        .object({
            title: galleryTitle,
            masterParkId,
            photos: draftPhotos,
            thumbnailPhotoId: positiveId(GALLERY_MESSAGES.THUMBNAIL_NOT_LISTED).nullable().optional().default(null),
        })
        .strict(),
});

export type SaveDraftBody = z.infer<typeof saveDraftSchema>['body'];

export const galleryIdSchema = z.object({ params: idParams });

export const galleryPhotoSchema = z.object({ params: photoParams });

export const listTabSchema = z.object({
    query: z.object({
        tab: z
            .string()
            .optional()
            .default(GalleryTab.APPROVED)
            .refine((value): value is GalleryTabKey => (GALLERY_TABS as readonly string[]).includes(value), GALLERY_MESSAGES.TAB),
    }),
});

export type ListTabQuery = { readonly tab: GalleryTabKey };

export const consoleListSchema = z.object({
    query: paginationQuerySchema.extend({
        search: z
            .string()
            .trim()
            .max(GALLERY_LIMITS.SEARCH, GALLERY_MESSAGES.SEARCH_TOO_LONG)
            .optional()
            .transform((value) => (value ? value : undefined)),
    }),
});

export type ConsoleListQuery = z.infer<typeof consoleListSchema>['query'];

export const reasonSchema = z.object({
    params: idParams,
    body: z
        .object({
            reason: textWithin(GALLERY_MESSAGES.REASON_EMPTY, GALLERY_LIMITS.REASON_MAX, GALLERY_MESSAGES.REASON_TOO_LONG),
        })
        .strict(),
});
