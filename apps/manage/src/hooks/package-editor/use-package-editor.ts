'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { announcePackageNotice } from '@/components/package-editor/package-notice';
import { MEALS_INCLUSION } from '@/components/package-editor/package-labels';
import {
    apiFieldErrors,
    type BasicDraft,
    basicBodyOf,
    basicDraftOf,
    checkBasic,
    checkFaqs,
    checkGettingThere,
    checkInclusions,
    checkItinerary,
    type DayDraft,
    emptyBasic,
    emptyDay,
    faqsBodyOf,
    faqsDraftOf,
    type FaqDraft,
    type FieldErrors,
    hasErrors,
    hasRowErrors,
    inclusionsBodyOf,
    inclusionsDraftOf,
    type InclusionsDraft,
    itineraryBodyOf,
    itineraryDraftOf,
    mealsIncluded,
    NO_IMAGE,
    type PendingImage,
    rowErrorsOf,
} from '@/components/package-editor/package-rules';
import { useT } from '@/hooks/i18n/use-t';
import type { Translate } from '@/lib/i18n/locale';
import { ApiError } from '@/services/api-error';
import {
    removeDayImage,
    removePackageImage,
    savePackageBasic,
    savePackageFaqs,
    savePackageGettingThere,
    savePackageInclusions,
    savePackageItinerary,
    uploadDayImage,
    uploadPackageImage,
} from '@/services/package-editor.service';
import {
    type BasicBody,
    PackageImageKind,
    PackageVersionStatus,
    type PackageView,
    type SavedSection,
} from '@/types/package.types';

export type EditorSection = 'basic' | 'itinerary' | 'inclusions' | 'gettingThere' | 'faqs';

const STALE_CODES: ReadonlySet<string> = new Set([
    'PACKAGE_VERSION_NOT_EDITABLE',
    'PACKAGE_VERSION_NOT_WAITING',
    'PACKAGE_NOT_FOUND',
    'PACKAGE_VERSION_NOT_FOUND',
    'PACKAGE_DELETED',
    'PACKAGE_PARTNER_NOT_ACTIVE',
]);

const DAY_FIELDS: Readonly<Record<string, string>> = {
    title: 'title',
    description: 'description',
    startLocation: 'startLocation',
    endLocation: 'endLocation',
    hotelName: 'hotelName',
    activity: 'activity',
    accommodation: 'accommodation',
    note: 'note',
};

const FAQ_FIELDS: Readonly<Record<string, string>> = { question: 'question', answer: 'answer' };

const IMAGE_FIELDS: Readonly<Record<(typeof PackageImageKind)[keyof typeof PackageImageKind], string>> = {
    [PackageImageKind.PACKAGE]: 'packageImage',
    [PackageImageKind.BANNER]: 'bannerImage',
};

type ImageStep = { readonly field: string; readonly run: () => Promise<SavedSection> };

const doneMessage = (t: Translate, view: PackageView): string =>
    view.version.status === PackageVersionStatus.LIVE
        ? t('Saved. The website shows the change now.')
        : t('Section saved.');

const resized = (days: readonly DayDraft[], count: number): readonly DayDraft[] =>
    Array.from({ length: count }, (_, index) => days[index] ?? emptyDay());

export function usePackageEditor({
    initial,
    listPath,
    create,
    revealFirstError,
    offeredParkIds,
}: {
    readonly initial: PackageView | null;
    readonly listPath: string;
    readonly create: ((body: BasicBody) => Promise<PackageView>) | undefined;
    readonly revealFirstError: () => void;
    readonly offeredParkIds: readonly number[];
}) {
    const t = useT();
    const router = useRouter();
    const [view, setView] = useState<PackageView | null>(initial);
    const [section, setSection] = useState<EditorSection>('basic');
    const [basic, setBasic] = useState<BasicDraft>(() => (initial ? basicDraftOf(initial.version) : emptyBasic()));
    const [days, setDays] = useState<readonly DayDraft[]>(() => (initial ? itineraryDraftOf(initial.version) : []));
    const [inclusions, setInclusions] = useState<InclusionsDraft>(() =>
        initial
            ? inclusionsDraftOf(initial.version)
            : { included: {}, moreInclusions: '', exclusions: '' },
    );
    const [gettingThere, setGettingThere] = useState(initial?.version.gettingThere ?? '');
    const [faqs, setFaqs] = useState<readonly FaqDraft[]>(() => (initial ? faqsDraftOf(initial.version) : []));
    const [basicErrors, setBasicErrors] = useState<FieldErrors>({});
    const [dayErrors, setDayErrors] = useState<Readonly<Record<number, FieldErrors>>>({});
    const [inclusionErrors, setInclusionErrors] = useState<FieldErrors>({});
    const [gettingThereErrors, setGettingThereErrors] = useState<FieldErrors>({});
    const [faqErrors, setFaqErrors] = useState<Readonly<Record<number, FieldErrors>>>({});
    const [dirty, setDirty] = useState<ReadonlySet<EditorSection>>(new Set());
    const [busy, setBusy] = useState(false);
    const [daysCut, setDaysCut] = useState<{ readonly from: number; readonly to: number } | null>(null);

    const version = view?.version ?? null;
    const basicSaved = version?.saved.basic ?? false;

    const touch = (key: EditorSection): void => setDirty((current) => new Set(current).add(key));

    const clean = (key: EditorSection): void =>
        setDirty((current) => {
            const next = new Set(current);
            next.delete(key);
            return next;
        });

    const changeBasic = (patch: Partial<BasicDraft>): void => {
        setBasic((current) => ({ ...current, ...patch }));
        touch('basic');
    };

    const changeDay = (index: number, patch: Partial<DayDraft>): void => {
        setDays((current) => current.map((day, position) => (position === index ? { ...day, ...patch } : day)));
        touch('itinerary');
    };

    const changeInclusions = (patch: Partial<InclusionsDraft>): void => {
        setInclusions((current) => ({ ...current, ...patch }));
        touch('inclusions');
    };

    const setIncluded = (code: number, included: boolean): void => {
        setInclusions((current) => ({ ...current, included: { ...current.included, [code]: included } }));
        touch('inclusions');
        if (code === MEALS_INCLUSION && included && days.length > 0) {
            setDays((current) =>
                current.map((day) => ({ ...day, hasBreakfast: true, hasLunch: true, hasDinner: true })),
            );
        }
    };

    const changeGettingThere = (value: string): void => {
        setGettingThere(value);
        touch('gettingThere');
    };

    const changeFaqs = (next: readonly FaqDraft[]): void => {
        setFaqs(next);
        touch('faqs');
    };

    const fail = (error: unknown): void => {
        const known = error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR;
        announcePackageNotice(known ? t(error.message) : t('This could not be done. Please try again.'), true);
        if (known && STALE_CODES.has(error.code)) router.refresh();
    };

    const pickSection = (next: EditorSection): void => {
        if (next !== 'basic' && !basicSaved) {
            announcePackageNotice(t('Save the Basic section first.'), true);
            return;
        }
        setSection(next);
    };

    const imageSteps = (
        packageId: number,
        versionId: number,
        images: ReadonlyArray<readonly [PendingImage, (typeof PackageImageKind)[keyof typeof PackageImageKind]]>,
    ): ImageStep[] => {
        const steps: ImageStep[] = [];
        for (const [image, kind] of images) {
            const field = IMAGE_FIELDS[kind];
            if (image.file) {
                const file = image.file;
                steps.push({ field, run: () => uploadPackageImage(packageId, versionId, kind, file) });
            } else if (image.removed) steps.push({ field, run: () => removePackageImage(packageId, versionId, kind) });
        }
        return steps;
    };

    const runImages = async (
        steps: readonly ImageStep[],
        fallback: SavedSection,
        onFieldError: (field: string, error: ApiError) => void,
    ): Promise<SavedSection> => {
        let latest = fallback;
        for (const step of steps) {
            try {
                latest = await step.run();
            } catch (error) {
                if (error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR) onFieldError(step.field, error);
                else fail(error);
                return latest;
            }
        }
        return latest;
    };

    const applyBasic = (saved: PackageView): void => {
        setView(saved);
        setBasic(basicDraftOf(saved.version));
        setDays((current) => resized(current, saved.version.dayCount));
        clean('basic');
    };

    const saveBasic = async (confirmDayRemoval: boolean): Promise<void> => {
        const found = checkBasic(t, basic, offeredParkIds);
        setBasicErrors(found);
        if (hasErrors(found)) {
            announcePackageNotice(t('Check the highlighted fields.'), true);
            revealFirstError();
            return;
        }
        if (
            view &&
            !confirmDayRemoval &&
            view.version.saved.itinerary &&
            Number(basic.dayCount) < view.version.days.length
        ) {
            setDaysCut({ from: Number(basic.dayCount) + 1, to: view.version.days.length });
            return;
        }
        setBusy(true);
        setDaysCut(null);
        try {
            const body = basicBodyOf(basic, confirmDayRemoval);
            const created = view ? undefined : await create?.(body);
            const saved: PackageView | undefined = view
                ? await savePackageBasic(view.package.id, view.version.id, body)
                : created;
            if (!saved) return;
            const imageErrors: Record<string, string> = {};
            const finished = await runImages(
                imageSteps(saved.package.id, saved.version.id, [
                    [basic.packageImage, PackageImageKind.PACKAGE],
                    [basic.bannerImage, PackageImageKind.BANNER],
                ]),
                { ...saved, mealsTicked: false },
                (field, error) => {
                    imageErrors[field] = t(error.message);
                },
            );
            applyBasic(finished);
            setBasicErrors(imageErrors);
            const imageError = Object.values(imageErrors)[0];
            if (view) announcePackageNotice(doneMessage(t, finished), false);
            else {
                announcePackageNotice(
                    imageError ?? t('Basic saved. Version 1 is a draft; the other sections are open now.'),
                    imageError !== undefined,
                );
                router.replace(`${listPath}/${saved.package.id}`);
            }
        } catch (error) {
            if (error instanceof ApiError && error.code === 'PACKAGE_DAYS_REMOVAL_UNCONFIRMED' && view) {
                setDaysCut({ from: Number(basic.dayCount) + 1, to: view.version.days.length });
            } else if (error instanceof ApiError && error.errors.length > 0) {
                setBasicErrors(apiFieldErrors(t, error));
                announcePackageNotice(t('Check the highlighted fields.'), true);
                revealFirstError();
            } else fail(error);
        } finally {
            setBusy(false);
        }
    };

    const saveItinerary = async (): Promise<void> => {
        if (!view) return;
        const found = checkItinerary(t, days);
        setDayErrors(found);
        if (hasRowErrors(found)) {
            announcePackageNotice(t('Check the highlighted fields.'), true);
            revealFirstError();
            return;
        }
        setBusy(true);
        try {
            const saved = await savePackageItinerary(view.package.id, view.version.id, itineraryBodyOf(days));
            const dayImageErrors: Record<number, FieldErrors> = {};
            let latest = saved;
            for (const [index, day] of days.entries()) {
                try {
                    if (day.image.file) latest = await uploadDayImage(saved.package.id, saved.version.id, index + 1, day.image.file);
                    else if (day.image.removed) latest = await removeDayImage(saved.package.id, saved.version.id, index + 1);
                } catch (error) {
                    if (error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR)
                        dayImageErrors[index] = { image: t(error.message) };
                    else fail(error);
                }
            }
            setView(latest);
            setDays((current) =>
                itineraryDraftOf(latest.version).map((fresh, index) =>
                    dayImageErrors[index] ? { ...fresh, image: current[index]?.image ?? NO_IMAGE } : fresh,
                ),
            );
            setDayErrors(dayImageErrors);
            clean('itinerary');
            announcePackageNotice(doneMessage(t, latest), false);
        } catch (error) {
            if (error instanceof ApiError && error.errors.length > 0) {
                setDayErrors(rowErrorsOf(t, error, 'days', DAY_FIELDS));
                announcePackageNotice(t('Check the highlighted fields.'), true);
                revealFirstError();
            } else fail(error);
        } finally {
            setBusy(false);
        }
    };

    const saveInclusions = async (): Promise<void> => {
        if (!view) return;
        const found = checkInclusions(t, inclusions);
        setInclusionErrors(found);
        if (hasErrors(found)) {
            announcePackageNotice(t('Check the highlighted fields.'), true);
            revealFirstError();
            return;
        }
        setBusy(true);
        try {
            const mealsWasIncluded = view.version.inclusions.some(
                (choice) => choice.inclusion === MEALS_INCLUSION && choice.isIncluded,
            );
            const saved = await savePackageInclusions(view.package.id, view.version.id, inclusionsBodyOf(inclusions));
            setView(saved);
            setInclusions(inclusionsDraftOf(saved.version));
            if (saved.mealsTicked || (mealsIncluded(inclusions) && !mealsWasIncluded)) {
                setDays((current) =>
                    current.map((day) => ({ ...day, hasBreakfast: true, hasLunch: true, hasDinner: true })),
                );
            }
            clean('inclusions');
            announcePackageNotice(
                saved.mealsTicked
                    ? `${doneMessage(t, saved)} ${t('Breakfast, lunch and dinner are ticked on every day.')}`
                    : doneMessage(t, saved),
                false,
            );
        } catch (error) {
            if (error instanceof ApiError && error.errors.length > 0) {
                setInclusionErrors(apiFieldErrors(t, error));
                announcePackageNotice(t('Check the highlighted fields.'), true);
                revealFirstError();
            } else fail(error);
        } finally {
            setBusy(false);
        }
    };

    const saveGettingThere = async (): Promise<void> => {
        if (!view) return;
        const found = checkGettingThere(t, gettingThere);
        setGettingThereErrors(found);
        if (hasErrors(found)) {
            announcePackageNotice(t('Check the highlighted fields.'), true);
            revealFirstError();
            return;
        }
        setBusy(true);
        try {
            const text = gettingThere.trim();
            const saved = await savePackageGettingThere(view.package.id, view.version.id, text === '' ? null : text);
            setView(saved);
            setGettingThere(saved.version.gettingThere ?? '');
            clean('gettingThere');
            announcePackageNotice(doneMessage(t, saved), false);
        } catch (error) {
            if (error instanceof ApiError && error.errors.length > 0) {
                setGettingThereErrors({ gettingThere: t(error.errors[0]?.message ?? '') });
                announcePackageNotice(t('Check the highlighted fields.'), true);
                revealFirstError();
            } else fail(error);
        } finally {
            setBusy(false);
        }
    };

    const saveFaqs = async (): Promise<void> => {
        if (!view) return;
        const found = checkFaqs(t, faqs);
        setFaqErrors(found);
        if (hasRowErrors(found)) {
            announcePackageNotice(t('Check the highlighted fields.'), true);
            revealFirstError();
            return;
        }
        setBusy(true);
        try {
            const saved = await savePackageFaqs(view.package.id, view.version.id, faqsBodyOf(faqs));
            setView(saved);
            setFaqs(faqsDraftOf(saved.version));
            clean('faqs');
            announcePackageNotice(doneMessage(t, saved), false);
        } catch (error) {
            if (error instanceof ApiError && error.errors.length > 0) {
                setFaqErrors(rowErrorsOf(t, error, 'faqs', FAQ_FIELDS));
                announcePackageNotice(t('Check the highlighted fields.'), true);
                revealFirstError();
            } else fail(error);
        } finally {
            setBusy(false);
        }
    };

    const save = (): Promise<void> => {
        if (busy) return Promise.resolve();
        if (section === 'basic') return saveBasic(false);
        if (section === 'itinerary') return saveItinerary();
        if (section === 'inclusions') return saveInclusions();
        if (section === 'gettingThere') return saveGettingThere();
        return saveFaqs();
    };

    return {
        view,
        section,
        pickSection,
        basicSaved,
        basic,
        changeBasic,
        days,
        changeDay,
        inclusions,
        changeInclusions,
        setIncluded,
        gettingThere,
        changeGettingThere,
        faqs,
        changeFaqs,
        basicErrors,
        dayErrors,
        inclusionErrors,
        gettingThereErrors,
        faqErrors,
        setBasicError: (field: string, message: string | null) =>
            setBasicErrors((current) => {
                const rest = Object.fromEntries(Object.entries(current).filter(([key]) => key !== field));
                return message === null ? rest : { ...rest, [field]: message };
            }),
        dirty: dirty.size > 0,
        busy,
        daysCut,
        cancelDaysCut: () => setDaysCut(null),
        confirmDaysCut: () => void saveBasic(true),
        save,
        fail,
        listPath,
    };
}
