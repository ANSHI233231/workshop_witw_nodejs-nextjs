'use client';

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useRevealFirstError } from '@/hooks/ui/use-reveal-first-error';
import { logger } from '@/lib/logger';
import { createPark, getPark, parkFeatureImageUrl, updatePark, uploadParkFeatureImage } from '@/services/park.service';
import {
    PARK_IMAGE_ACCEPT,
    PARK_LIMITS,
    PARK_REGION_LABEL,
    PARK_REGIONS,
    type Park,
    type ParkDetail,
    ParkStatus,
    type ParkStatusCode,
} from '@/types/park.types';

import { checkParkForm, checkParkImage, type ParkField, type ParkFieldErrors, parkSaveErrorsOf } from './park-form';
import { parkPriceRange } from './park-format';

const log = logger.category('parks');

const coordinateText = (value: number | null | undefined): string =>
    value === null || value === undefined ? '' : String(value);

function FieldError({ message }: { readonly message: string | undefined }) {
    return message ? (
        <span className="error" role="alert">
            {message}
        </span>
    ) : null;
}

const fieldClass = (message: string | undefined): string => (message ? 'field is-invalid' : 'field');

function ParkForm({
    editing,
    onSaved,
    onClose,
}: {
    readonly editing: ParkDetail | null;
    readonly onSaved: (park: Park) => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    const { formRef, revealFirstError } = useRevealFirstError<HTMLFormElement>();
    const [name, setName] = useState(editing?.name ?? '');
    const [region, setRegion] = useState(editing ? String(editing.region) : '');
    const [description, setDescription] = useState(editing?.shortDescription ?? '');
    const [latitude, setLatitude] = useState(coordinateText(editing?.latitude));
    const [longitude, setLongitude] = useState(coordinateText(editing?.longitude));
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [status, setStatus] = useState<ParkStatusCode>(editing?.status ?? ParkStatus.ACTIVE);
    const [savedPark, setSavedPark] = useState<Park | null>(null);
    const [errors, setErrors] = useState<ParkFieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const previewRef = useRef<string | null>(null);

    useEffect(
        () => () => {
            if (previewRef.current) URL.revokeObjectURL(previewRef.current);
        },
        [],
    );

    const replacePreview = (url: string | null) => {
        if (previewRef.current) URL.revokeObjectURL(previewRef.current);
        previewRef.current = url;
        setPreview(url);
    };

    const clear = (...fields: readonly ParkField[]) =>
        setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !fields.includes(key as ParkField))));

    const chooseImage = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const problem = checkParkImage(file, t);
        if (problem) {
            event.target.value = '';
            setImage(null);
            replacePreview(null);
            setErrors((current) => ({ ...current, image: problem }));
            return;
        }
        clear('image');
        setImage(file);
        replacePreview(URL.createObjectURL(file));
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (saving) return;
        const checked = checkParkForm(t, { name, region, shortDescription: description, latitude, longitude });
        setErrors((current) => (current.image ? { ...checked.errors, image: current.image } : checked.errors));
        setFormError(null);
        if (Object.keys(checked.errors).length > 0 || errors.image) {
            revealFirstError();
            return;
        }
        setSaving(true);
        let uploading = false;
        try {
            const target = savedPark ?? editing;
            let park = target
                ? await updatePark(target.id, { ...checked.input, status })
                : await createPark(checked.input);
            setSavedPark(park);
            if (image) {
                uploading = true;
                park = await uploadParkFeatureImage(park.id, image);
            }
            onSaved(park);
        } catch (error) {
            log.error('The park could not be saved.', { error, uploading });
            const found = parkSaveErrorsOf(error, t);
            setErrors(uploading ? { image: found.form ?? Object.values(found.fields)[0] ?? '' } : found.fields);
            setFormError(uploading ? null : found.form);
            revealFirstError();
        } finally {
            setSaving(false);
        }
    };

    const isActive = status === ParkStatus.ACTIVE;
    const shownImage =
        preview ?? (editing?.featureImage ? parkFeatureImageUrl(editing.id, editing.featureImage) : null);
    const range = editing ? parkPriceRange(editing) : null;
    const isEdit = editing !== null || savedPark !== null;

    return (
        <div className="overlay" onClick={onClose}>
            <form
                ref={formRef}
                className="modal "
                role="dialog"
                aria-modal="true"
                aria-labelledby="pk-t"
                noValidate
                onClick={(event) => event.stopPropagation()}
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="pk-t">
                        {isEdit ? t('Edit park') : t('Add park')}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="ss-stack-lg">
                        {formError && (
                            <div className="banner banner-danger" role="alert">
                                {formError}
                            </div>
                        )}
                        <div className={fieldClass(errors.name)}>
                            <label className="label" htmlFor="pk-name">
                                {t('Park name')}
                                <span className="req" aria-hidden="true">
                                    *
                                </span>
                            </label>
                            <input
                                id="pk-name"
                                className="input"
                                maxLength={PARK_LIMITS.NAME_MAX}
                                value={name}
                                aria-invalid={errors.name ? true : undefined}
                                onChange={(event) => {
                                    setName(event.target.value);
                                    clear('name');
                                }}
                            />
                            <FieldError message={errors.name} />
                        </div>
                        <div className={fieldClass(errors.region)}>
                            <label className="label" htmlFor="pk-region">
                                {t('Region')}
                                <span className="req" aria-hidden="true">
                                    *
                                </span>
                            </label>
                            <select
                                id="pk-region"
                                className="select"
                                value={region}
                                aria-invalid={errors.region ? true : undefined}
                                onChange={(event) => {
                                    setRegion(event.target.value);
                                    clear('region');
                                }}
                            >
                                <option value="">{t('Select a region')}</option>
                                {PARK_REGIONS.map((code) => (
                                    <option key={code} value={code}>
                                        {t(PARK_REGION_LABEL[code])}
                                    </option>
                                ))}
                            </select>
                            <FieldError message={errors.region} />
                        </div>
                        <div className={fieldClass(errors.shortDescription)}>
                            <label className="label" htmlFor="pk-desc">
                                {t('Description')}
                            </label>
                            <textarea
                                id="pk-desc"
                                className="textarea"
                                rows={4}
                                maxLength={PARK_LIMITS.DESCRIPTION_MAX}
                                value={description}
                                aria-invalid={errors.shortDescription ? true : undefined}
                                onChange={(event) => {
                                    setDescription(event.target.value);
                                    clear('shortDescription');
                                }}
                            />
                            <span className="helper">{t('Shown on the park page. Up to 1,000 characters.')}</span>
                            <FieldError message={errors.shortDescription} />
                        </div>
                        <div className="ssc-2">
                            <div className={fieldClass(errors.latitude)}>
                                <label className="label" htmlFor="pk-lat">
                                    {t('Latitude')}
                                </label>
                                <input
                                    id="pk-lat"
                                    className="input"
                                    inputMode="decimal"
                                    placeholder={t('e.g. 22.1548')}
                                    value={latitude}
                                    aria-invalid={errors.latitude ? true : undefined}
                                    onChange={(event) => {
                                        setLatitude(event.target.value);
                                        clear('latitude', 'longitude');
                                    }}
                                />
                                <FieldError message={errors.latitude} />
                            </div>
                            <div className={fieldClass(errors.longitude)}>
                                <label className="label" htmlFor="pk-lng">
                                    {t('Longitude')}
                                </label>
                                <input
                                    id="pk-lng"
                                    className="input"
                                    inputMode="decimal"
                                    placeholder={t('e.g. 80.6728')}
                                    value={longitude}
                                    aria-invalid={errors.longitude ? true : undefined}
                                    onChange={(event) => {
                                        setLongitude(event.target.value);
                                        clear('latitude', 'longitude');
                                    }}
                                />
                                <FieldError message={errors.longitude} />
                            </div>
                        </div>
                        <div className={fieldClass(errors.image)}>
                            <label className="label" htmlFor="pk-img">
                                {t('Feature image')}
                            </label>
                            <div className="pkf-img">
                                {shownImage && <img src={shownImage} alt="" />}
                                <div className="ss-stack">
                                    <input
                                        id="pk-img"
                                        className="input"
                                        type="file"
                                        accept={PARK_IMAGE_ACCEPT}
                                        aria-invalid={errors.image ? true : undefined}
                                        onChange={chooseImage}
                                    />
                                    <span className="helper">
                                        {t('JPG, JPEG or PNG, up to 250 KB. Shown on the park card.')}
                                    </span>
                                </div>
                            </div>
                            <FieldError message={errors.image} />
                        </div>
                        <div className="field">
                            <span className="label">{t('Average safari price')}</span>
                            <div className="pkf-calc">
                                {range ? t('{range} per person', { range }) : t('Not calculated yet')}
                            </div>
                            <span className="helper">{t('Calculated by the system, not entered here.')}</span>
                        </div>
                        {isEdit && (
                            <div className="field ssc-swrow">
                                <span className="label" id="pf-st-l">
                                    {t('Status')}
                                </span>
                                <div className="ssc-sw">
                                    <button
                                        type="button"
                                        className={isActive ? 'mt-switch is-on' : 'mt-switch'}
                                        role="switch"
                                        aria-checked={isActive}
                                        aria-labelledby="pf-st-l"
                                        onClick={() => setStatus(isActive ? ParkStatus.INACTIVE : ParkStatus.ACTIVE)}
                                    >
                                        <span className="mt-knob"></span>
                                    </button>
                                    <span>{isActive ? t('Active') : t('Inactive')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {isEdit ? t('Save') : t('Add park')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export function ParkDialog({
    editing,
    onSaved,
    onClose,
}: {
    readonly editing: Park | null;
    readonly onSaved: (park: Park) => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    const [detail, setDetail] = useState<ParkDetail | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!editing) return;
        getPark(editing.id, undefined)
            .then(setDetail)
            .catch((error: unknown) => {
                log.error('The park could not be loaded.', { error });
                setFailed(true);
            });
    }, [editing]);

    if (!editing || detail) return <ParkForm editing={detail} onSaved={onSaved} onClose={onClose} />;

    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal " role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                <div className="modal-body">
                    {failed ? (
                        <div className="banner banner-danger" role="alert">
                            {t('It could not be loaded. Please try again.')}
                        </div>
                    ) : (
                        <p className="ss-cap">{t('Loading…')}</p>
                    )}
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
}
