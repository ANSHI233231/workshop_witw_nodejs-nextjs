'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { announceGalleryNotice } from '@/components/gallery/gallery-notice';
import type { EditorPhoto } from '@/components/gallery/gallery-photo-card';
import {
    checkGallery,
    checkPhotoFile,
    chunksOf,
    type GalleryErrors,
    galleryErrorsOf,
    hasGalleryErrors,
} from '@/components/gallery/gallery-rules';
import { useT } from '@/hooks/i18n/use-t';
import {
    createGallery,
    deleteGalleryDraft,
    galleryPhotoUrl,
    moveGalleryBack,
    replaceGalleryPhoto,
    saveGalleryDraft,
    sendGallery,
    startGalleryEdit,
    uploadGalleryPhotos,
} from '@/services/gallery.service';
import { ApiError } from '@/services/api-error';
import { GALLERY_LIMITS, GalleryStatus, type GalleryDetail, type GalleryPhoto } from '@/types/gallery.types';

const STALE_CODES: ReadonlySet<string> = new Set([
    'GALLERY_NOT_DRAFT',
    'GALLERY_NOT_WAITING',
    'GALLERY_NOT_APPROVED',
    'GALLERY_NOT_FOUND',
]);

type Draft = {
    readonly photos: readonly EditorPhoto[];
    readonly thumbKey: string | null;
};

const photosOf = (gallery: GalleryDetail | null): readonly GalleryPhoto[] =>
    !gallery ? [] : gallery.status === GalleryStatus.APPROVED ? gallery.approvedPhotos : gallery.draftPhotos;

const keyOf = (photo: GalleryPhoto): string => `p${photo.id}`;

const editorPhotoOf = (galleryId: number, photo: GalleryPhoto): EditorPhoto => ({
    key: keyOf(photo),
    id: photo.id,
    src: galleryPhotoUrl(galleryId, photo.id, photo.fileVersion),
    title: photo.title ?? '',
    caption: photo.caption ?? '',
});

const draftOf = (gallery: GalleryDetail | null): Draft => {
    const photos = photosOf(gallery);
    const thumbnail = photos.find((photo) => photo.isThumbnail) ?? photos[0];
    return {
        photos: gallery ? photos.map((photo) => editorPhotoOf(gallery.id, photo)) : [],
        thumbKey: thumbnail ? keyOf(thumbnail) : null,
    };
};

export function useGalleryEditor(gallery: GalleryDetail | null, revealFirstError: () => void) {
    const t = useT();
    const router = useRouter();
    const [title, setTitle] = useState(gallery?.title ?? '');
    const [parkId, setParkId] = useState(gallery ? String(gallery.park.id) : '');
    const [{ photos, thumbKey }, setDraft] = useState<Draft>(() => draftOf(gallery));
    const [errors, setErrors] = useState<GalleryErrors>({});
    const [dirty, setDirty] = useState(false);
    const [busy, setBusy] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const pending = useRef(new Map<string, { file: File; url: string }>());
    const counter = useRef(0);

    useEffect(() => {
        const urls = pending.current;
        return () => {
            for (const entry of urls.values()) URL.revokeObjectURL(entry.url);
        };
    }, []);

    const fail = (error: unknown): void => {
        const known = error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR;
        announceGalleryNotice(known ? t(error.message) : t('This could not be done. Please try again.'), true);
        if (known && STALE_CODES.has(error.code)) router.refresh();
    };

    const change = (patch: Partial<Draft>): void => {
        setDraft((current) => ({ ...current, ...patch }));
        setDirty(true);
    };

    const mergeUploaded = (saved: GalleryDetail): void => {
        setDraft((current) => {
            const known = new Set(current.photos.map((photo) => photo.id));
            const added = saved.draftPhotos
                .filter((photo) => !known.has(photo.id))
                .map((photo) => editorPhotoOf(saved.id, photo));
            const first = saved.draftPhotos.find((photo) => photo.isThumbnail);
            return {
                photos: [...current.photos, ...added],
                thumbKey: current.thumbKey ?? (first ? keyOf(first) : null),
            };
        });
    };

    const validFiles = (files: readonly File[]): File[] => {
        const accepted: File[] = [];
        for (const file of files) {
            const problem = checkPhotoFile(t, file);
            if (problem) announceGalleryNotice(problem, true);
            else accepted.push(file);
        }
        return accepted;
    };

    const addPhotos = async (files: readonly File[]): Promise<void> => {
        const accepted = validFiles(files);
        if (accepted.length === 0) return;
        if (!gallery) {
            const added = accepted.map((file): EditorPhoto => {
                counter.current += 1;
                const key = `n${counter.current}`;
                const url = URL.createObjectURL(file);
                pending.current.set(key, { file, url });
                return { key, id: null, src: url, title: '', caption: '' };
            });
            setDraft((current) => ({
                photos: [...current.photos, ...added],
                thumbKey: current.thumbKey ?? added[0]?.key ?? null,
            }));
            setDirty(true);
            return;
        }
        setBusy(true);
        try {
            for (const chunk of chunksOf(accepted, GALLERY_LIMITS.PHOTOS_PER_UPLOAD)) {
                mergeUploaded(await uploadGalleryPhotos(gallery.id, chunk));
            }
            setDirty(true);
        } catch (error) {
            fail(error);
        } finally {
            setBusy(false);
        }
    };

    const replacePhoto = async (photo: EditorPhoto, file: File): Promise<void> => {
        if (validFiles([file]).length === 0) return;
        if (photo.id === null || !gallery) {
            const url = URL.createObjectURL(file);
            const old = pending.current.get(photo.key);
            if (old) URL.revokeObjectURL(old.url);
            pending.current.set(photo.key, { file, url });
            change({ photos: photos.map((item) => (item.key === photo.key ? { ...item, src: url } : item)) });
            return;
        }
        setBusy(true);
        try {
            const saved = await replaceGalleryPhoto(gallery.id, photo.id, file);
            const fresh = saved.draftPhotos.find((item) => item.id === photo.id);
            if (fresh) {
                setDraft((current) => ({
                    ...current,
                    photos: current.photos.map((item) =>
                        item.id === photo.id ? { ...item, src: galleryPhotoUrl(saved.id, fresh.id, fresh.fileVersion) } : item,
                    ),
                }));
            }
        } catch (error) {
            fail(error);
        } finally {
            setBusy(false);
        }
    };

    const patchPhoto = (key: string, patch: Partial<EditorPhoto>): void =>
        change({ photos: photos.map((photo) => (photo.key === key ? { ...photo, ...patch } : photo)) });

    const movePhoto = (index: number, step: -1 | 1): void => {
        const next = [...photos];
        const other = index + step;
        const moved = next[index];
        const swapped = next[other];
        if (!moved || !swapped) return;
        next[index] = swapped;
        next[other] = moved;
        change({ photos: next });
    };

    const removePhoto = (key: string): void => {
        if (key === thumbKey) return;
        const entry = pending.current.get(key);
        if (entry) {
            URL.revokeObjectURL(entry.url);
            pending.current.delete(key);
        }
        change({ photos: photos.filter((photo) => photo.key !== key) });
    };

    const draftInput = (ids: readonly (number | null)[], parkValue: number) => ({
        title: title.trim(),
        masterParkId: parkValue,
        photos: photos.flatMap((photo, index) => {
            const id = ids[index];
            return id === null || id === undefined
                ? []
                : [{ id, title: photo.title.trim() || null, caption: photo.caption.trim() || null }];
        }),
        thumbnailPhotoId: ids[photos.findIndex((photo) => photo.key === thumbKey)] ?? null,
    });

    const afterSave = (saved: GalleryDetail): void => {
        setDraft(draftOf(saved));
        setDirty(false);
        announceGalleryNotice(t('Gallery saved as a draft.'), false);
        router.refresh();
    };

    const saveNew = async (): Promise<void> => {
        const created = await createGallery(title.trim(), Number(parkId));
        const files = photos.map((photo) => pending.current.get(photo.key)?.file).filter((file): file is File => !!file);
        try {
            let latest = created;
            for (const chunk of chunksOf(files, GALLERY_LIMITS.PHOTOS_PER_UPLOAD)) {
                latest = await uploadGalleryPhotos(created.id, chunk);
            }
            const ids = latest.draftPhotos.map((photo) => photo.id);
            await saveGalleryDraft(created.id, draftInput(ids, Number(parkId)));
            announceGalleryNotice(t('Gallery saved as a draft.'), false);
        } catch (error) {
            fail(error);
        }
        router.replace(`/gallery/${created.id}`);
    };

    const save = async (): Promise<void> => {
        if (busy) return;
        const found = checkGallery(t, title, parkId);
        setErrors(found);
        if (hasGalleryErrors(found)) {
            revealFirstError();
            return;
        }
        setBusy(true);
        try {
            if (!gallery) await saveNew();
            else afterSave(await saveGalleryDraft(gallery.id, draftInput(photos.map((photo) => photo.id), Number(parkId))));
        } catch (error) {
            const fields = error instanceof ApiError ? galleryErrorsOf(t, error) : {};
            if (hasGalleryErrors(fields)) {
                setErrors(fields);
                revealFirstError();
            } else fail(error);
        } finally {
            setBusy(false);
        }
    };

    const act = async (work: () => Promise<string>): Promise<void> => {
        if (busy) return;
        setBusy(true);
        try {
            announceGalleryNotice(await work(), false);
            router.refresh();
        } catch (error) {
            fail(error);
        } finally {
            setBusy(false);
        }
    };

    const send = (): Promise<void> => {
        if (dirty) {
            announceGalleryNotice(t('Save or discard your changes first.'), true);
            return Promise.resolve();
        }
        const id = gallery?.id;
        if (id === undefined) return Promise.resolve();
        return act(async () => {
            await sendGallery(id);
            return t('Gallery sent for approval.');
        });
    };

    const moveBack = (): Promise<void> => {
        const id = gallery?.id;
        if (id === undefined) return Promise.resolve();
        return act(async () => {
            await moveGalleryBack(id);
            return t('The gallery is back in draft.');
        });
    };

    const startEdit = (): Promise<void> => {
        const id = gallery?.id;
        if (id === undefined) return Promise.resolve();
        return act(async () => {
            await startGalleryEdit(id);
            return t('A draft is made. The approved photos stay in use.');
        });
    };

    const discard = async (): Promise<void> => {
        const id = gallery?.id;
        if (id === undefined || busy) return;
        setDeleting(false);
        setBusy(true);
        try {
            const outcome = await deleteGalleryDraft(id);
            announceGalleryNotice(
                outcome.restoredApproved ? t('Draft discarded. The approved photos are back.') : t('Draft discarded.'),
                false,
            );
            if (outcome.restoredApproved) router.refresh();
            else router.replace('/gallery');
        } catch (error) {
            fail(error);
        } finally {
            setBusy(false);
        }
    };

    return {
        title,
        parkId,
        photos,
        thumbKey,
        errors,
        busy,
        deleting,
        setTitle: (value: string) => {
            setTitle(value);
            setDirty(true);
            setErrors((current) => ({ ...current, title: undefined }));
        },
        setParkId: (value: string) => {
            setParkId(value);
            setDirty(true);
            setErrors((current) => ({ ...current, park: undefined }));
        },
        addPhotos,
        replacePhoto,
        patchPhoto,
        movePhoto,
        removePhoto,
        setThumbnail: (key: string) => change({ thumbKey: key }),
        save,
        send,
        moveBack,
        startEdit,
        discard,
        askDelete: () => setDeleting(true),
        cancelDelete: () => setDeleting(false),
    };
}
