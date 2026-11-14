import type { Translate } from '@/lib/i18n/locale';
import type { ApiError } from '@/services/api-error';
import { GALLERY_LIMITS } from '@/types/gallery.types';

export type GalleryField = 'title' | 'park';

export type GalleryErrors = Partial<Readonly<Record<GalleryField, string>>>;

const PHOTO_EXTENSIONS = /\.(jpe?g|png)$/i;

const PHOTO_TYPES: readonly string[] = ['image/jpeg', 'image/png'];

export const checkPhotoFile = (t: Translate, file: File): string | null => {
    const typeOk = PHOTO_EXTENSIONS.test(file.name) && (file.type === '' || PHOTO_TYPES.includes(file.type));
    if (!typeOk) return t('Choose JPG, JPEG or PNG files.');
    if (file.size > GALLERY_LIMITS.PHOTO_MAX_BYTES) return t('{file} is bigger than 8 MB.', { file: file.name });
    return null;
};

export const checkGallery = (t: Translate, title: string, parkId: string): GalleryErrors => {
    const errors: Partial<Record<GalleryField, string>> = {};
    const trimmed = title.trim();
    if (!trimmed) errors.title = t('Enter the gallery title.');
    else if (trimmed.length > GALLERY_LIMITS.TITLE_MAX)
        errors.title = t('Use up to {max} characters.', { max: GALLERY_LIMITS.TITLE_MAX });
    if (!parkId) errors.park = t('Choose the park.');
    return errors;
};

export const hasGalleryErrors = (errors: GalleryErrors): boolean =>
    errors.title !== undefined || errors.park !== undefined;

export const galleryErrorsOf = (t: Translate, error: ApiError): GalleryErrors => {
    const title = error.fieldError('title');
    const park = error.fieldError('masterParkId');
    return {
        ...(title ? { title: t(title) } : {}),
        ...(park ? { park: t(park) } : {}),
    };
};

export const chunksOf = <T>(items: readonly T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
    return chunks;
};
