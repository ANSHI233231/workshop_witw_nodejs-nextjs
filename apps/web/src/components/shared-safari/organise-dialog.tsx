'use client';

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { logger } from '@/lib/logger';
import { todayInIndia, wholeNumber, wordCount, yearAheadOf } from '@/lib/shared-safari-format';
import { ApiError } from '@/services/api-error';
import {
    createSafari,
    getSafariForEdit,
    listActiveParks,
    updateSafari,
    uploadSafariCover,
} from '@/services/shared-safari.service';
import {
    type ParkOption,
    SAFARI_LIMITS,
    type SafariEdit,
    type SafariInput,
    STAY_OPTIONS,
    THEME_OPTIONS,
} from '@/types/shared-safari.types';

import { coverSource, DEFAULT_COVER } from './safari-cover';
import { ChevronDownIcon, CloseIcon, SearchIcon } from './safari-icons';

const log = logger.category('shared-safari');

type Field =
    | 'title'
    | 'park'
    | 'start'
    | 'end'
    | 'safaris'
    | 'theme'
    | 'seats'
    | 'share'
    | 'price'
    | 'stay'
    | 'cover'
    | 'plan';

type Errors = Partial<Record<Field, string>>;

type Values = {
    readonly title: string;
    readonly park: string;
    readonly start: string;
    readonly end: string;
    readonly safaris: string;
    readonly theme: string;
    readonly seats: string;
    readonly share: string;
    readonly priceFrom: string;
    readonly priceTo: string;
    readonly stay: string;
    readonly plan: string;
};

const BLANK: Values = {
    title: '',
    park: '',
    start: '',
    end: '',
    safaris: '1',
    theme: '',
    seats: '',
    share: '',
    priceFrom: '',
    priceTo: '',
    stay: '',
    plan: '',
};

const STEP_FIELDS: Readonly<Record<number, readonly Field[]>> = {
    1: ['title', 'park', 'start', 'end', 'safaris'],
    2: ['theme', 'seats', 'share', 'price', 'stay'],
    3: ['cover', 'plan'],
};

const API_FIELDS: Readonly<Record<string, Field>> = {
    title: 'title',
    masterParkId: 'park',
    startDate: 'start',
    endDate: 'end',
    safariCount: 'safaris',
    theme: 'theme',
    totalSeats: 'seats',
    sharedSeats: 'share',
    price: 'price',
    stayCategory: 'stay',
    safariPlan: 'plan',
    image: 'cover',
};

const IMAGE_NAME = /\.(png|jpe?g)$/i;

const IMAGE_TYPE = /^image\/(png|jpeg)$/;

const PARK_INACTIVE = 'This park is no longer active. Select an active park.';

const valuesOf = (safari: SafariEdit): Values => ({
    title: safari.title,
    park: String(safari.masterParkId),
    start: safari.startDate,
    end: safari.endDate,
    safaris: String(safari.safariCount),
    theme: String(safari.theme),
    seats: String(safari.totalSeats),
    share: String(safari.sharedSeats),
    priceFrom: String(safari.pricePerPersonMin),
    priceTo: String(safari.pricePerPersonMax),
    stay: safari.stayCategory === null ? '' : String(safari.stayCategory),
    plan: safari.safariPlan,
});

const stepOf = (errors: Errors): number => {
    for (const step of [1, 2, 3]) {
        if ((STEP_FIELDS[step] ?? []).some((field) => errors[field])) return step;
    }
    return 0;
};

const pick = (errors: Errors, step: number): Errors =>
    Object.fromEntries((STEP_FIELDS[step] ?? []).filter((field) => errors[field]).map((field) => [field, errors[field]]));

const inputOf = (values: Values): SafariInput => ({
    title: values.title.trim(),
    masterParkId: values.park ? Number(values.park) : null,
    startDate: values.start,
    endDate: values.end,
    safariCount: wholeNumber(values.safaris),
    theme: values.theme ? Number(values.theme) : null,
    totalSeats: wholeNumber(values.seats),
    sharedSeats: wholeNumber(values.share),
    pricePerPersonMin: wholeNumber(values.priceFrom),
    pricePerPersonMax: wholeNumber(values.priceTo),
    stayCategory: values.stay ? Number(values.stay) : null,
    safariPlan: values.plan,
});

function validate(values: Values, editing: SafariEdit | null): Errors {
    const errors: Errors = {};
    const today = todayInIndia();
    const title = values.title.trim();
    if (!title) errors.title = 'Enter a title.';
    else if (title.length > SAFARI_LIMITS.TITLE_MAX) errors.title = 'Use up to 255 characters.';
    if (!values.park) errors.park = 'Select a park.';
    else if (editing && !editing.parkActive && values.park === String(editing.masterParkId)) errors.park = PARK_INACTIVE;
    const startChanged = !editing || editing.startDate !== values.start;
    if (!values.start) errors.start = 'Enter a start date.';
    else if (startChanged && (values.start < today || values.start > yearAheadOf(today))) {
        errors.start = 'Choose a start date from today up to one year ahead.';
    }
    if (!values.end) errors.end = 'Enter an end date.';
    else if (values.start && values.end <= values.start) errors.end = 'End date must be after the start date.';
    const safaris = wholeNumber(values.safaris);
    if (values.safaris.trim() === '') errors.safaris = 'Enter the number of safaris.';
    else if (safaris === null || safaris < SAFARI_LIMITS.SAFARIS_MIN || safaris > SAFARI_LIMITS.SAFARIS_MAX) {
        errors.safaris = 'Enter a number from 1 to 10.';
    }
    if (!values.theme) errors.theme = 'Select a theme.';
    const seats = wholeNumber(values.seats);
    const share = wholeNumber(values.share);
    if (values.seats.trim() === '') errors.seats = 'Enter the total seats.';
    else if (seats === null || seats < SAFARI_LIMITS.SEATS_MIN || seats > SAFARI_LIMITS.SEATS_MAX) {
        errors.seats = 'Enter a number up to 6.';
    }
    if (values.share.trim() === '') errors.share = 'Enter the seats to share.';
    else if (share === null || share < 1) errors.share = 'Enter at least 1 seat.';
    else if (seats !== null && share >= seats) errors.share = 'Seats to share must be fewer than the total seats.';
    const from = wholeNumber(values.priceFrom);
    const to = wholeNumber(values.priceTo);
    if (values.priceFrom.trim() === '' || values.priceTo.trim() === '') {
        errors.price = 'Enter the price per person, from and to.';
    } else if (from === null || to === null || from > SAFARI_LIMITS.PRICE_MAX || to > SAFARI_LIMITS.PRICE_MAX) {
        errors.price = 'Enter whole rupees, up to ₹10,00,000.';
    } else if (to < from) errors.price = 'The “to” price can’t be less than the “from” price.';
    if (!values.plan.trim()) errors.plan = 'Enter a safari plan.';
    else if (wordCount(values.plan) >= SAFARI_LIMITS.PLAN_WORDS_BELOW) {
        errors.plan = 'Please provide content within 1000 words.';
    }
    return errors;
}

const apiErrorsOf = (error: ApiError): Errors =>
    Object.fromEntries(
        error.errors
            .map((item) => [API_FIELDS[item.field], item.message] as const)
            .filter((entry): entry is readonly [Field, string] => entry[0] !== undefined),
    );

function FieldError({ message }: { readonly message: string | undefined }) {
    const t = useT();
    if (!message) return null;
    return (
        <span className="error" role="alert">
            {t(message)}
        </span>
    );
}

const fieldClass = (message: string | undefined): string => (message ? 'field is-invalid' : 'field');

export type OrganiseResult = { readonly id: number; readonly slug: string; readonly created: boolean };

export function OrganiseDialog({
    safariId,
    onClose,
    onSaved,
    onError,
}: {
    readonly safariId: number | null;
    readonly onClose: () => void;
    readonly onSaved: (result: OrganiseResult) => void;
    readonly onError: (message: string) => void;
}) {
    const t = useT();
    const [editing, setEditing] = useState<SafariEdit | null>(null);
    const [loaded, setLoaded] = useState(safariId === null);
    const [values, setValues] = useState<Values>(BLANK);
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState<Errors>({});
    const [parks, setParks] = useState<readonly ParkOption[]>([]);
    const [parksOpen, setParksOpen] = useState(false);
    const [parkSearch, setParkSearch] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const callbacks = useRef({ onClose, onError, t });
    const today = todayInIndia();

    useEffect(() => {
        callbacks.current = { onClose, onError, t };
    });

    useEffect(() => {
        let active = true;
        listActiveParks()
            .then((list) => {
                if (active) setParks(list);
            })
            .catch((error: unknown) => log.error('Active parks could not be loaded.', { error }));
        if (safariId !== null) {
            getSafariForEdit(safariId)
                .then((safari) => {
                    if (!active) return;
                    setEditing(safari);
                    setValues(valuesOf(safari));
                    setLoaded(true);
                })
                .catch((error: unknown) => {
                    if (!active) return;
                    const { onClose: close, onError: fail, t: translate } = callbacks.current;
                    fail(error instanceof ApiError ? error.message : translate('This could not be done. Please try again.'));
                    close();
                });
        }
        return () => {
            active = false;
        };
    }, [safariId]);

    useEffect(
        () => () => {
            if (preview) URL.revokeObjectURL(preview);
        },
        [preview],
    );

    useEffect(() => {
        if (parksOpen) searchRef.current?.focus({ preventScroll: true });
    }, [parksOpen]);

    const shownParks = useMemo(() => {
        const query = parkSearch.trim().toLowerCase();
        return parks.filter((park) => !query || park.name.toLowerCase().includes(query));
    }, [parks, parkSearch]);

    if (!loaded) return null;

    const set = (field: keyof Values) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setValues((current) => ({ ...current, [field]: event.target.value }));

    const parkLabel = (() => {
        if (!values.park) return t('Select a Safari Park');
        const found = parks.find((park) => String(park.id) === values.park);
        if (found) return found.name;
        return editing && String(editing.masterParkId) === values.park ? editing.parkName : '';
    })();

    const pickImage = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!IMAGE_TYPE.test(file.type) || !IMAGE_NAME.test(file.name)) {
            setErrors((current) => ({ ...current, cover: 'Use a PNG, JPG or JPEG image.' }));
            return;
        }
        if (file.size > SAFARI_LIMITS.IMAGE_MAX_BYTES) {
            setErrors((current) => ({ ...current, cover: 'Use an image up to 5 MB.' }));
            return;
        }
        setErrors((current) => ({ ...current, cover: undefined }));
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const next = () => {
        const stepErrors = pick(validate(values, editing), step);
        setErrors(stepErrors);
        if (Object.keys(stepErrors).length > 0) return;
        setParksOpen(false);
        setStep(step + 1);
    };

    const back = () => {
        setErrors({});
        setParksOpen(false);
        setStep(step - 1);
    };

    const showErrors = (all: Errors) => {
        const first = stepOf(all) || step;
        setErrors(pick(all, first));
        setStep(first);
    };

    const submit = async () => {
        if (saving) return;
        const all = validate(values, editing);
        if (errors.cover) all.cover = errors.cover;
        if (Object.keys(all).length > 0) {
            showErrors(all);
            return;
        }
        setSaving(true);
        let saved: { readonly id: number; readonly slug: string };
        try {
            saved = editing ? await updateSafari(editing.id, inputOf(values)) : await createSafari(inputOf(values));
        } catch (error) {
            setSaving(false);
            if (error instanceof ApiError && error.errors.length > 0) {
                showErrors(apiErrorsOf(error));
                return;
            }
            onError(error instanceof ApiError ? error.message : t('This could not be done. Please try again.'));
            return;
        }
        if (image) {
            try {
                await uploadSafariCover(saved.id, image);
            } catch (error) {
                log.error('The display image could not be saved.', { error, safariId: saved.id });
                onError(error instanceof ApiError ? error.message : t('The display image could not be saved.'));
            }
        }
        onSaved({ id: saved.id, slug: saved.slug, created: editing === null });
    };

    const currentImage = preview ?? (editing ? coverSource(editing.id, editing.coverVersion) : DEFAULT_COVER);
    const dots = [1, 2, 3];

    return (
        <div className="overlay wb-ov" onClick={onClose}>
            <form
                className="modal wb-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="org-t"
                onClick={(event) => event.stopPropagation()}
                onSubmit={(event) => event.preventDefault()}
                noValidate
            >
                <div className="wb-mh">
                    <h2 id="org-t">{editing ? t('Edit your safari') : t('Organize a Shared Safari')}</h2>
                    <button type="button" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="wb-mb">
                    {step === 1 && (
                        <>
                            <div className={fieldClass(errors.title)}>
                                <label className="label" htmlFor="o-title">
                                    {t('Title')}
                                    <span className="req" aria-hidden="true">
                                        *
                                    </span>
                                </label>
                                <input
                                    id="o-title"
                                    className="input"
                                    value={values.title}
                                    onChange={set('title')}
                                    aria-invalid={errors.title ? true : undefined}
                                    maxLength={SAFARI_LIMITS.TITLE_MAX}
                                    placeholder={t('Enter Title')}
                                />
                                <FieldError message={errors.title} />
                            </div>
                            <div className={fieldClass(errors.park)}>
                                <label className="label" htmlFor="o-park">
                                    {t('Select a Safari Park')}
                                    <span className="req" aria-hidden="true">
                                        *
                                    </span>
                                </label>
                                <div className="ss">
                                    <button
                                        type="button"
                                        id="o-park"
                                        className={values.park ? 'select ss-sel ' : 'select ss-sel is-empty'}
                                        aria-haspopup="listbox"
                                        aria-expanded={parksOpen}
                                        onClick={() => {
                                            setParkSearch('');
                                            setParksOpen((open) => !open);
                                        }}
                                    >
                                        <span>{parkLabel}</span>
                                        <ChevronDownIcon />
                                    </button>
                                    {parksOpen && (
                                        <div className="ss-pop" role="dialog" aria-label={t('Choose a safari park')}>
                                            <div className="input-group">
                                                <SearchIcon />
                                                <input
                                                    ref={searchRef}
                                                    className="input"
                                                    placeholder={t('Search park…')}
                                                    aria-label={t('Search park')}
                                                    value={parkSearch}
                                                    onChange={(event) => setParkSearch(event.target.value)}
                                                />
                                            </div>
                                            <ul className="ss-list" role="listbox" aria-label={t('Safari parks')}>
                                                {shownParks.map((park) => {
                                                    const chosen = String(park.id) === values.park;
                                                    return (
                                                        <li
                                                            key={park.id}
                                                            className={chosen ? 'ss-opt is-active' : 'ss-opt'}
                                                            role="option"
                                                            aria-selected={chosen}
                                                            onClick={() => {
                                                                setValues((current) => ({ ...current, park: String(park.id) }));
                                                                setParksOpen(false);
                                                            }}
                                                        >
                                                            {park.name}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                            {shownParks.length === 0 && <p className="ss-empty">{t('No parks found.')}</p>}
                                        </div>
                                    )}
                                </div>
                                <FieldError message={errors.park} />
                            </div>
                            <div className="wb-2">
                                <div className={fieldClass(errors.start)}>
                                    <label className="label" htmlFor="o-start">
                                        {t('Start Date')}
                                        <span className="req" aria-hidden="true">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        id="o-start"
                                        className="input"
                                        type="date"
                                        value={values.start}
                                        onChange={set('start')}
                                        aria-invalid={errors.start ? true : undefined}
                                        min={today}
                                        max={yearAheadOf(today)}
                                    />
                                    <FieldError message={errors.start} />
                                </div>
                                <div className={fieldClass(errors.end)}>
                                    <label className="label" htmlFor="o-end">
                                        {t('End Date')}
                                        <span className="req" aria-hidden="true">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        id="o-end"
                                        className="input"
                                        type="date"
                                        value={values.end}
                                        onChange={set('end')}
                                        aria-invalid={errors.end ? true : undefined}
                                        min={today}
                                    />
                                    <FieldError message={errors.end} />
                                </div>
                            </div>
                            <div className={fieldClass(errors.safaris)}>
                                <label className="label" htmlFor="o-safaris">
                                    {t('Number of Safaris')}
                                    <span className="req" aria-hidden="true">
                                        *
                                    </span>
                                </label>
                                <input
                                    id="o-safaris"
                                    className="input"
                                    type="number"
                                    min={SAFARI_LIMITS.SAFARIS_MIN}
                                    max={SAFARI_LIMITS.SAFARIS_MAX}
                                    value={values.safaris}
                                    onChange={set('safaris')}
                                    aria-invalid={errors.safaris ? true : undefined}
                                />
                                <span className="helper">{t('Up to 10')}</span>
                                <FieldError message={errors.safaris} />
                            </div>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <div className={fieldClass(errors.theme)}>
                                <label className="label" htmlFor="o-purpose">
                                    {t('Theme')}
                                    <span className="req" aria-hidden="true">
                                        *
                                    </span>
                                </label>
                                <div className="ss-radios" role="radiogroup" aria-label={t('Theme')}>
                                    {THEME_OPTIONS.map((option) => (
                                        <label key={option.value}>
                                            <input
                                                type="radio"
                                                name="o-purpose"
                                                value={option.value}
                                                checked={values.theme === String(option.value)}
                                                onChange={() =>
                                                    setValues((current) => ({ ...current, theme: String(option.value) }))
                                                }
                                            />
                                            {t(option.label)}
                                        </label>
                                    ))}
                                </div>
                                <FieldError message={errors.theme} />
                            </div>
                            <div className="wb-2">
                                <div className={fieldClass(errors.seats)}>
                                    <label className="label" htmlFor="o-seats">
                                        {t('Total Seats')}
                                        <span className="req" aria-hidden="true">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        id="o-seats"
                                        className="input"
                                        type="number"
                                        min={SAFARI_LIMITS.SEATS_MIN}
                                        max={SAFARI_LIMITS.SEATS_MAX}
                                        value={values.seats}
                                        onChange={set('seats')}
                                        aria-invalid={errors.seats ? true : undefined}
                                    />
                                    <span className="helper">{t('Up to 6, yours included')}</span>
                                    <FieldError message={errors.seats} />
                                </div>
                                <div className={fieldClass(errors.share)}>
                                    <label className="label" htmlFor="o-share">
                                        {t('Seats to Share')}
                                        <span className="req" aria-hidden="true">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        id="o-share"
                                        className="input"
                                        type="number"
                                        min={1}
                                        max={SAFARI_LIMITS.SEATS_MAX - 1}
                                        value={values.share}
                                        onChange={set('share')}
                                        aria-invalid={errors.share ? true : undefined}
                                    />
                                    <span className="helper">{t('Fewer than the total seats')}</span>
                                    <FieldError message={errors.share} />
                                </div>
                            </div>
                            <div className={fieldClass(errors.price)}>
                                <span className="label">
                                    {t('Price Per Person')}
                                    <span className="req" aria-hidden="true">
                                        *
                                    </span>
                                </span>
                                <div className="ss-range">
                                    <div className="input-group">
                                        <span className="affix">₹</span>
                                        <input
                                            id="o-pfrom"
                                            className="input"
                                            value={values.priceFrom}
                                            onChange={set('priceFrom')}
                                            aria-invalid={errors.price ? true : undefined}
                                            inputMode="numeric"
                                            placeholder={t('From')}
                                            aria-label={t('Price per person from')}
                                        />
                                    </div>
                                    <span className="ss-muted">–</span>
                                    <div className="input-group">
                                        <span className="affix">₹</span>
                                        <input
                                            id="o-pto"
                                            className="input"
                                            value={values.priceTo}
                                            onChange={set('priceTo')}
                                            aria-invalid={errors.price ? true : undefined}
                                            inputMode="numeric"
                                            placeholder={t('To')}
                                            aria-label={t('Price per person to')}
                                        />
                                    </div>
                                </div>
                                <FieldError message={errors.price} />
                            </div>
                            <div className={fieldClass(errors.stay)}>
                                <label className="label" htmlFor="o-stay">
                                    {t('Stay Category')}
                                </label>
                                <select id="o-stay" className="select" value={values.stay} onChange={set('stay')}>
                                    <option value="">{t('Select a Stay Category')}</option>
                                    {STAY_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {t(option.label)}
                                        </option>
                                    ))}
                                </select>
                                <FieldError message={errors.stay} />
                            </div>
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <div className="wb-2">
                                <div className="field">
                                    <span className="label">{t('Current Display Image')}</span>
                                    <img className="wb-cur" src={currentImage} alt={t('Current display image')} />
                                </div>
                                <div className={fieldClass(errors.cover)}>
                                    <label className="label" htmlFor="o-cover">
                                        {t('Select Picture')}
                                    </label>
                                    <input
                                        id="o-cover"
                                        className="wb-file"
                                        type="file"
                                        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                                        onChange={pickImage}
                                    />
                                    <span className="helper">
                                        {image ? image.name : t('No file chosen')} · {t('PNG, JPG or JPEG, up to 5 MB')}
                                    </span>
                                    <FieldError message={errors.cover} />
                                </div>
                            </div>
                            <div className={fieldClass(errors.plan)}>
                                <label className="label" htmlFor="o-plan">
                                    {t('Safari Plan')}
                                    <span className="req" aria-hidden="true">
                                        *
                                    </span>
                                </label>
                                <textarea
                                    id="o-plan"
                                    className="textarea"
                                    rows={7}
                                    placeholder={t('Enter Plan Details')}
                                    value={values.plan}
                                    onChange={set('plan')}
                                    aria-invalid={errors.plan ? true : undefined}
                                ></textarea>
                                <span className="helper">
                                    {t('Under 1,000 words')} · {t('{n} words', { n: wordCount(values.plan) })}
                                </span>
                                <FieldError message={errors.plan} />
                            </div>
                        </>
                    )}
                </div>
                <div className="wb-mf">
                    {step === 1 && (
                        <button type="button" className="wb-tb is-muted" onClick={onClose}>
                            {t('Cancel')}
                        </button>
                    )}
                    {step > 1 && (
                        <button type="button" className="wb-tb is-muted" onClick={back}>
                            {t('back')}
                        </button>
                    )}
                    {step < 3 && (
                        <button type="button" className="wb-tb" onClick={next}>
                            {t('Next')}
                        </button>
                    )}
                    {step === 3 && (
                        <button type="button" className="wb-tb" onClick={() => void submit()} disabled={saving}>
                            {editing ? t('Save changes') : t('Create')}
                        </button>
                    )}
                </div>
                <div className="wb-dots" aria-label={t('Step {n} of 3', { n: step })}>
                    {dots.map((dot) => (
                        <span key={dot} className={dot === step ? 'wb-dot is-on' : 'wb-dot'}></span>
                    ))}
                </div>
            </form>
        </div>
    );
}
