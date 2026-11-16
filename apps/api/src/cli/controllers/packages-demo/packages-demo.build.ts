import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { DemoGallery } from '../../../modules/gallery';
import type { DemoPackage, DemoPackageGallery } from '../../../modules/package';
import type { DemoPartnerState } from '../../../modules/partner';

import type { DemoGalleryPlan } from './packages-demo.data';
import type { DemoPackagePlan, DemoVersionPlan } from './packages-demo.packages';

const PICTURES_FOLDER = path.resolve(__dirname, '../../../../seed/packages-demo/gallery');

const IST_OFFSET = '+05:30';

export const istDate = (value: string | null): Date | null => (value === null ? null : new Date(`${value}:00${IST_OFFSET}`));

export const requiredIst = (value: string): Date => istDate(value) ?? new Date();

export type PlannedGalleries = { readonly galleries: DemoGallery[]; readonly skipped: string[] };

export type GalleryRef = { readonly galleryId: number; readonly partnerId: number; readonly title: string };

export type PackageLookups = {
    readonly states: readonly DemoPartnerState[];
    readonly parkIdOf: ReadonlyMap<string, number>;
    readonly galleryOf: (partnerId: number, title: string | null) => DemoPackageGallery | null;
};

export const readPictures = async (names: readonly string[]): Promise<Map<string, Buffer>> => {
    const pictures = new Map<string, Buffer>();
    for (const name of new Set(names)) pictures.set(name, await readFile(path.join(PICTURES_FOLDER, name)));
    return pictures;
};

export const galleryLookup =
    (refs: readonly GalleryRef[], plans: readonly DemoGalleryPlan[]): PackageLookups['galleryOf'] =>
    (partnerId, title) => {
        const ref = refs.find((candidate) => candidate.partnerId === partnerId && candidate.title === title);
        const plan = plans.find((candidate) => candidate.title === title);
        if (!ref || !plan) return null;
        return { galleryId: ref.galleryId, title: ref.title, photos: plan.approvedPhotos ?? [] };
    };

const galleryOf = (
    plan: DemoGalleryPlan,
    states: readonly DemoPartnerState[],
    parkIdOf: ReadonlyMap<string, number>,
): DemoGallery | null => {
    const owner = states.find((state) => state.email === plan.ownerEmail);
    const masterParkId = parkIdOf.get(plan.parkName);
    if (!owner || owner.partnerId === null || owner.userId === null || masterParkId === undefined) return null;
    return {
        partnerId: owner.partnerId,
        userId: owner.userId,
        title: plan.title,
        masterParkId,
        status: plan.status,
        approvedPhotos: plan.approvedPhotos,
        draftPhotos: plan.draftPhotos,
        rejectReason: plan.rejectReason,
        sentAt: istDate(plan.sentAtIst),
        decidedAt: istDate(plan.decidedAtIst),
    };
};

export const plannedGalleries = (
    plans: readonly DemoGalleryPlan[],
    states: readonly DemoPartnerState[],
    parkIdOf: ReadonlyMap<string, number>,
): PlannedGalleries => {
    const galleries: DemoGallery[] = [];
    const skipped: string[] = [];
    for (const plan of plans) {
        const gallery = galleryOf(plan, states, parkIdOf);
        if (gallery) galleries.push(gallery);
        else skipped.push(plan.title);
    }
    return { galleries, skipped };
};

const versionOf = (plan: DemoVersionPlan, partnerId: number, lookups: PackageLookups): DemoPackage['versions'][number] | null => {
    const masterParkIds = plan.parkNames.map((name) => lookups.parkIdOf.get(name));
    if (masterParkIds.some((id) => id === undefined)) return null;
    const { parkNames: _parkNames, galleryTitle, createdAtIst, sentAtIst, decidedAtIst, days, ...rest } = plan;
    return {
        ...rest,
        masterParkIds: masterParkIds.flatMap((id) => (id === undefined ? [] : [id])),
        gallery: lookups.galleryOf(partnerId, galleryTitle),
        createdAt: requiredIst(createdAtIst),
        sentAt: istDate(sentAtIst),
        decidedAt: istDate(decidedAtIst),
        days: days.map(({ galleryTitle: dayGallery, ...day }) => ({ ...day, gallery: lookups.galleryOf(partnerId, dayGallery) })),
    };
};

export const packageOf = (plan: DemoPackagePlan, lookups: PackageLookups): DemoPackage | null => {
    const owner = lookups.states.find((state) => state.email === plan.ownerEmail);
    if (!owner || owner.partnerId === null || owner.userId === null) return null;
    const partnerId = owner.partnerId;
    const versions = plan.versions.map((version) => versionOf(version, partnerId, lookups));
    if (versions.some((version) => version === null)) return null;
    return {
        partnerId,
        userId: owner.userId,
        slug: plan.slug,
        websiteStatus: plan.websiteStatus,
        isPopular: plan.isPopular,
        isBestDeal: plan.isBestDeal,
        deleteReasonName: plan.deleteReasonName,
        deleteDetails: plan.deleteDetails,
        deletedAt: istDate(plan.deletedAtIst),
        versions: versions.flatMap((version) => (version === null ? [] : [version])),
    };
};
