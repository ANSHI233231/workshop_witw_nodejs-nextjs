import type { Translate } from '@/lib/i18n/locale';
import type { ApiError } from '@/services/api-error';
import {
    type BasicBody,
    COLOR_PATTERN,
    DEFAULT_TAG_COLORS,
    type DayBody,
    type DayDetail,
    type FaqBody,
    type InclusionsBody,
    PACKAGE_LIMITS,
    PLACE_PATTERN,
    type VersionDetail,
} from '@/types/package.types';

import { INCLUSION_OPTIONS, MEALS_INCLUSION } from './package-labels';

export type FieldErrors = Readonly<Record<string, string>>;

export type PendingImage = { readonly file: File | null; readonly removed: boolean };

export const NO_IMAGE: PendingImage = { file: null, removed: false };

export type BasicDraft = {
    readonly name: string;
    readonly masterParkIds: readonly number[];
    readonly dayCount: string;
    readonly safariCount: string;
    readonly safariType: string;
    readonly vehicle: string;
    readonly theme: string;
    readonly stay: string;
    readonly features: readonly number[];
    readonly startPlace: string;
    readonly endPlace: string;
    readonly pricePerPerson: string;
    readonly totalPrice: string;
    readonly priceBeforeDiscount: string;
    readonly activityMessage: string;
    readonly priceMessage: string;
    readonly tagText: string;
    readonly tagBackgroundColor: string;
    readonly tagTextColor: string;
    readonly galleryId: string;
    readonly overview: string;
    readonly packageImage: PendingImage;
    readonly bannerImage: PendingImage;
};

export type DayDraft = {
    readonly title: string;
    readonly description: string;
    readonly startLocation: string;
    readonly endLocation: string;
    readonly hotelName: string;
    readonly hasBreakfast: boolean;
    readonly hasLunch: boolean;
    readonly hasDinner: boolean;
    readonly activity: string;
    readonly accommodation: string;
    readonly note: string;
    readonly galleryId: string;
    readonly image: PendingImage;
};

export type InclusionsDraft = {
    readonly included: Readonly<Record<number, boolean>>;
    readonly moreInclusions: string;
    readonly exclusions: string;
};

export type FaqDraft = { readonly question: string; readonly answer: string };

export const emptyBasic = (): BasicDraft => ({
    name: '',
    masterParkIds: [],
    dayCount: '',
    safariCount: '',
    safariType: '',
    vehicle: '',
    theme: '',
    stay: '',
    features: [],
    startPlace: '',
    endPlace: '',
    pricePerPerson: '',
    totalPrice: '',
    priceBeforeDiscount: '',
    activityMessage: '',
    priceMessage: '',
    tagText: '',
    tagBackgroundColor: DEFAULT_TAG_COLORS.BACKGROUND,
    tagTextColor: DEFAULT_TAG_COLORS.TEXT,
    galleryId: '',
    overview: '',
    packageImage: NO_IMAGE,
    bannerImage: NO_IMAGE,
});

export const basicDraftOf = (version: VersionDetail): BasicDraft => ({
    name: version.name,
    masterParkIds: version.parks.map((park) => park.id),
    dayCount: String(version.dayCount),
    safariCount: String(version.safariCount),
    safariType: String(version.safariType),
    vehicle: String(version.vehicle),
    theme: String(version.theme),
    stay: String(version.stay),
    features: version.features,
    startPlace: version.startPlace ?? '',
    endPlace: version.endPlace ?? '',
    pricePerPerson: String(version.pricePerPerson),
    totalPrice: String(version.totalPrice),
    priceBeforeDiscount: version.priceBeforeDiscount === null ? '' : String(version.priceBeforeDiscount),
    activityMessage: version.activityMessage ?? '',
    priceMessage: version.priceMessage ?? '',
    tagText: version.tag.text ?? '',
    tagBackgroundColor: version.tag.backgroundColor,
    tagTextColor: version.tag.textColor,
    galleryId: version.gallery ? String(version.gallery.galleryId) : '',
    overview: version.overview ?? '',
    packageImage: NO_IMAGE,
    bannerImage: NO_IMAGE,
});

export const emptyDay = (): DayDraft => ({
    title: '',
    description: '',
    startLocation: '',
    endLocation: '',
    hotelName: '',
    hasBreakfast: false,
    hasLunch: false,
    hasDinner: false,
    activity: '',
    accommodation: '',
    note: '',
    galleryId: '',
    image: NO_IMAGE,
});

const dayDraftOf = (day: DayDetail): DayDraft => ({
    title: day.title,
    description: day.description,
    startLocation: day.startLocation ?? '',
    endLocation: day.endLocation ?? '',
    hotelName: day.hotelName ?? '',
    hasBreakfast: day.hasBreakfast,
    hasLunch: day.hasLunch,
    hasDinner: day.hasDinner,
    activity: day.activity ?? '',
    accommodation: day.accommodation ?? '',
    note: day.note ?? '',
    galleryId: day.gallery ? String(day.gallery.galleryId) : '',
    image: NO_IMAGE,
});

export const itineraryDraftOf = (version: VersionDetail): readonly DayDraft[] =>
    Array.from({ length: version.dayCount }, (_, index) => {
        const saved = version.days.find((day) => day.dayNumber === index + 1);
        return saved ? dayDraftOf(saved) : emptyDay();
    });

export const inclusionsDraftOf = (version: VersionDetail): InclusionsDraft => ({
    included: Object.fromEntries(
        INCLUSION_OPTIONS.map((option) => [
            option.code,
            version.inclusions.find((choice) => choice.inclusion === option.code)?.isIncluded ?? false,
        ]),
    ),
    moreInclusions: version.moreInclusions ?? '',
    exclusions: version.exclusions ?? '',
});

export const faqsDraftOf = (version: VersionDetail): readonly FaqDraft[] =>
    version.faqs.map((faq) => ({ question: faq.question, answer: faq.answer }));

const trimmedOrNull = (value: string): string | null => (value.trim() === '' ? null : value.trim());

const WHOLE = /^\d+$/;

const wholeOf = (value: string): number => (WHOLE.test(value.trim()) ? Number(value.trim()) : Number.NaN);

const tooLong = (t: Translate, max: number): string => t('Use up to {max} characters.', { max: max.toLocaleString('en-US') });

const priceProblem = (t: Translate, value: string): string | null => {
    const amount = wholeOf(value);
    return Number.isNaN(amount) || amount < PACKAGE_LIMITS.PRICE_MIN || amount > PACKAGE_LIMITS.PRICE_MAX
        ? t('Enter whole rupees from 1,000 to 99,99,999.')
        : null;
};

export const PARK_NO_LONGER_AVAILABLE = 'Untick the park marked Not available and choose one of your active parks.';

export const unavailableParkIds = (draft: BasicDraft, offeredParkIds: readonly number[]): readonly number[] =>
    draft.masterParkIds.filter((parkId) => !offeredParkIds.includes(parkId));

export const checkBasic = (t: Translate, draft: BasicDraft, offeredParkIds: readonly number[]): FieldErrors => {
    const errors: Record<string, string> = {};
    const name = draft.name.trim();
    if (!name) errors['name'] = t('Enter the package name.');
    else if (name.length > PACKAGE_LIMITS.NAME_MAX) errors['name'] = tooLong(t, PACKAGE_LIMITS.NAME_MAX);
    if (draft.masterParkIds.length === 0) errors['masterParkIds'] = t('Choose at least one park.');
    else if (unavailableParkIds(draft, offeredParkIds).length > 0) errors['masterParkIds'] = t(PARK_NO_LONGER_AVAILABLE);
    const days = draft.dayCount.trim();
    if (!days) errors['dayCount'] = t('Enter the number of days.');
    else {
        const count = wholeOf(days);
        if (Number.isNaN(count) || count < PACKAGE_LIMITS.DAYS_MIN || count > PACKAGE_LIMITS.DAYS_MAX)
            errors['dayCount'] = t('Enter 1 to 15 days.');
    }
    const safaris = draft.safariCount.trim();
    if (!safaris) errors['safariCount'] = t('Enter the number of safaris.');
    else {
        const count = wholeOf(safaris);
        if (Number.isNaN(count) || count < PACKAGE_LIMITS.SAFARIS_MIN || count > PACKAGE_LIMITS.SAFARIS_MAX)
            errors['safariCount'] = t('Enter 1 to 99 safaris.');
    }
    if (!draft.safariType) errors['safariType'] = t('Choose the safari type.');
    if (!draft.vehicle) errors['vehicle'] = t('Choose the vehicle.');
    if (!draft.theme) errors['theme'] = t('Choose the theme.');
    if (!draft.stay) errors['stay'] = t('Choose the stay.');
    for (const [key, value] of [
        ['startPlace', draft.startPlace],
        ['endPlace', draft.endPlace],
    ] as const) {
        const place = value.trim();
        if (place.length > PACKAGE_LIMITS.PLACE_MAX) errors[key] = tooLong(t, PACKAGE_LIMITS.PLACE_MAX);
        else if (place && !PLACE_PATTERN.test(place)) errors[key] = t('Use letters, spaces and hyphens only.');
    }
    const perPerson = draft.pricePerPerson.trim();
    const total = draft.totalPrice.trim();
    const before = draft.priceBeforeDiscount.trim();
    if (!perPerson) errors['pricePerPerson'] = t('Enter the price per person.');
    else {
        const problem = priceProblem(t, perPerson);
        if (problem) errors['pricePerPerson'] = problem;
    }
    if (!total) errors['totalPrice'] = t('Enter the total price.');
    else {
        const problem = priceProblem(t, total);
        if (problem) errors['totalPrice'] = problem;
    }
    if (before) {
        const problem = priceProblem(t, before);
        if (problem) errors['priceBeforeDiscount'] = problem;
    }
    if (!errors['pricePerPerson'] && !errors['totalPrice'] && wholeOf(total) < wholeOf(perPerson))
        errors['totalPrice'] = t("The total price can't be less than the price per person.");
    if (!errors['pricePerPerson'] && !errors['priceBeforeDiscount'] && before && wholeOf(before) <= wholeOf(perPerson))
        errors['priceBeforeDiscount'] = t('The price before discount must be higher than the price per person.');
    for (const [key, value] of [
        ['activityMessage', draft.activityMessage],
        ['priceMessage', draft.priceMessage],
        ['tagText', draft.tagText],
    ] as const) {
        if (value.trim().length > PACKAGE_LIMITS.MESSAGE_MAX) errors[key] = tooLong(t, PACKAGE_LIMITS.MESSAGE_MAX);
    }
    if (!COLOR_PATTERN.test(draft.tagBackgroundColor) || !COLOR_PATTERN.test(draft.tagTextColor))
        errors['tagText'] = t('Choose a colour.');
    if (draft.overview.trim().length > PACKAGE_LIMITS.OVERVIEW_MAX) errors['overview'] = tooLong(t, PACKAGE_LIMITS.OVERVIEW_MAX);
    return errors;
};

export const basicBodyOf = (draft: BasicDraft, confirmDayRemoval: boolean): BasicBody => ({
    name: draft.name.trim(),
    masterParkIds: draft.masterParkIds,
    dayCount: Number(draft.dayCount.trim()),
    safariCount: Number(draft.safariCount.trim()),
    safariType: Number(draft.safariType),
    vehicle: Number(draft.vehicle),
    theme: Number(draft.theme),
    stay: Number(draft.stay),
    features: draft.features,
    startPlace: trimmedOrNull(draft.startPlace),
    endPlace: trimmedOrNull(draft.endPlace),
    pricePerPerson: Number(draft.pricePerPerson.trim()),
    totalPrice: Number(draft.totalPrice.trim()),
    priceBeforeDiscount: draft.priceBeforeDiscount.trim() ? Number(draft.priceBeforeDiscount.trim()) : null,
    activityMessage: trimmedOrNull(draft.activityMessage),
    priceMessage: trimmedOrNull(draft.priceMessage),
    tagText: trimmedOrNull(draft.tagText),
    tagBackgroundColor: draft.tagBackgroundColor.toUpperCase(),
    tagTextColor: draft.tagTextColor.toUpperCase(),
    galleryId: draft.galleryId ? Number(draft.galleryId) : null,
    overview: trimmedOrNull(draft.overview),
    confirmDayRemoval,
});

export const checkItinerary = (t: Translate, days: readonly DayDraft[]): Readonly<Record<number, FieldErrors>> => {
    const result: Record<number, FieldErrors> = {};
    days.forEach((day, index) => {
        const errors: Record<string, string> = {};
        const title = day.title.trim();
        if (!title) errors['title'] = t('Enter the day title.');
        else if (title.length > PACKAGE_LIMITS.DAY_TITLE_MAX) errors['title'] = tooLong(t, PACKAGE_LIMITS.DAY_TITLE_MAX);
        const description = day.description.trim();
        if (!description) errors['description'] = t('Enter the description.');
        else if (description.length > PACKAGE_LIMITS.DAY_DESCRIPTION_MAX)
            errors['description'] = tooLong(t, PACKAGE_LIMITS.DAY_DESCRIPTION_MAX);
        for (const key of ['startLocation', 'endLocation', 'hotelName'] as const) {
            if (day[key].trim().length > PACKAGE_LIMITS.DAY_TEXT_MAX) errors[key] = tooLong(t, PACKAGE_LIMITS.DAY_TEXT_MAX);
        }
        for (const key of ['activity', 'accommodation', 'note'] as const) {
            if (day[key].trim().length > PACKAGE_LIMITS.DAY_NOTE_MAX) errors[key] = tooLong(t, PACKAGE_LIMITS.DAY_NOTE_MAX);
        }
        if (Object.keys(errors).length > 0) result[index] = errors;
    });
    return result;
};

export const itineraryBodyOf = (days: readonly DayDraft[]): readonly DayBody[] =>
    days.map((day, index) => ({
        dayNumber: index + 1,
        title: day.title.trim(),
        description: day.description.trim(),
        startLocation: trimmedOrNull(day.startLocation),
        endLocation: trimmedOrNull(day.endLocation),
        hotelName: trimmedOrNull(day.hotelName),
        hasBreakfast: day.hasBreakfast,
        hasLunch: day.hasLunch,
        hasDinner: day.hasDinner,
        activity: trimmedOrNull(day.activity),
        accommodation: trimmedOrNull(day.accommodation),
        note: trimmedOrNull(day.note),
        galleryId: day.galleryId ? Number(day.galleryId) : null,
    }));

export const checkInclusions = (t: Translate, draft: InclusionsDraft): FieldErrors => {
    const errors: Record<string, string> = {};
    if (draft.moreInclusions.trim().length > PACKAGE_LIMITS.INCLUSION_TEXT_MAX)
        errors['moreInclusions'] = tooLong(t, PACKAGE_LIMITS.INCLUSION_TEXT_MAX);
    if (draft.exclusions.trim().length > PACKAGE_LIMITS.INCLUSION_TEXT_MAX)
        errors['exclusions'] = tooLong(t, PACKAGE_LIMITS.INCLUSION_TEXT_MAX);
    return errors;
};

export const inclusionsBodyOf = (draft: InclusionsDraft): InclusionsBody => ({
    inclusions: INCLUSION_OPTIONS.map((option) => ({
        inclusion: option.code,
        isIncluded: draft.included[option.code] === true,
    })),
    moreInclusions: trimmedOrNull(draft.moreInclusions),
    exclusions: trimmedOrNull(draft.exclusions),
});

export const mealsIncluded = (draft: InclusionsDraft): boolean => draft.included[MEALS_INCLUSION] === true;

export const checkGettingThere = (t: Translate, text: string): FieldErrors =>
    text.trim().length > PACKAGE_LIMITS.GETTING_THERE_MAX
        ? { gettingThere: tooLong(t, PACKAGE_LIMITS.GETTING_THERE_MAX) }
        : {};

export const checkFaqs = (t: Translate, faqs: readonly FaqDraft[]): Readonly<Record<number, FieldErrors>> => {
    const result: Record<number, FieldErrors> = {};
    faqs.forEach((faq, index) => {
        const errors: Record<string, string> = {};
        const question = faq.question.trim();
        if (!question) errors['question'] = t('Enter the question.');
        else if (question.length > PACKAGE_LIMITS.QUESTION_MAX) errors['question'] = tooLong(t, PACKAGE_LIMITS.QUESTION_MAX);
        if (!faq.answer.trim()) errors['answer'] = t('Enter the answer.');
        if (Object.keys(errors).length > 0) result[index] = errors;
    });
    return result;
};

export const faqsBodyOf = (faqs: readonly FaqDraft[]): readonly FaqBody[] =>
    faqs.map((faq) => ({ question: faq.question.trim(), answer: faq.answer.trim() }));

export const hasErrors = (errors: FieldErrors): boolean => Object.keys(errors).length > 0;

export const hasRowErrors = (errors: Readonly<Record<number, FieldErrors>>): boolean => Object.keys(errors).length > 0;

const IMAGE_EXTENSIONS = /\.(jpe?g|png)$/i;

const IMAGE_TYPES: readonly string[] = ['image/jpeg', 'image/png'];

export const checkImageFile = (t: Translate, file: File, maxBytes: number): string | null => {
    const typeOk = IMAGE_EXTENSIONS.test(file.name) && (file.type === '' || IMAGE_TYPES.includes(file.type));
    if (!typeOk) return t('Choose a JPG, JPEG or PNG file.');
    if (file.size > maxBytes)
        return maxBytes === PACKAGE_LIMITS.IMAGE_MAX_BYTES ? t('Choose a file up to 250 KB.') : t('Choose a file up to 20 MB.');
    return null;
};

export const apiFieldErrors = (t: Translate, error: ApiError): FieldErrors => {
    const result: Record<string, string> = {};
    for (const entry of error.errors) result[entry.field] = t(entry.message);
    return result;
};

export const rowErrorsOf = (
    t: Translate,
    error: ApiError,
    list: 'days' | 'faqs',
    names: Readonly<Record<string, string>>,
): Readonly<Record<number, FieldErrors>> => {
    const result: Record<number, Record<string, string>> = {};
    for (const entry of error.errors) {
        const [head, index, field] = entry.field.split('.');
        const name = field ? names[field] : undefined;
        if (head !== list || index === undefined || name === undefined) continue;
        const row = Number(index);
        result[row] = { ...result[row], [name]: t(entry.message) };
    }
    return result;
};

export const mealsOfDay = (day: DayDraft): readonly boolean[] => [day.hasBreakfast, day.hasLunch, day.hasDinner];
