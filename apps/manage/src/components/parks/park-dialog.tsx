'use client';

import { type FormEvent, useState } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useRevealFirstError } from '@/hooks/ui/use-reveal-first-error';
import { createPark, updatePark } from '@/services/park.service';
import {
    PARK_LIMITS,
    PARK_REGION_LABEL,
    PARK_REGIONS,
    type Park,
    ParkStatus,
    type ParkStatusCode,
} from '@/types/park.types';

import { checkParkForm, type ParkField, type ParkFieldErrors, parkSaveErrorsOf } from './park-form';

const priceText = (amount: number | null | undefined): string => (amount === null || amount === undefined ? '' : String(amount));

function FieldError({ message }: { readonly message: string | undefined }) {
    return message ? (
        <span className="error" role="alert">
            {message}
        </span>
    ) : null;
}

const fieldClass = (message: string | undefined): string => (message ? 'field is-invalid' : 'field');

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
    const { formRef, revealFirstError } = useRevealFirstError<HTMLFormElement>();
    const [name, setName] = useState(editing?.name ?? '');
    const [region, setRegion] = useState(editing ? String(editing.region) : '');
    const [min, setMin] = useState(priceText(editing?.avgSafariPriceMin));
    const [max, setMax] = useState(priceText(editing?.avgSafariPriceMax));
    const [status, setStatus] = useState<ParkStatusCode>(editing?.status ?? ParkStatus.ACTIVE);
    const [errors, setErrors] = useState<ParkFieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const clear = (field: ParkField) =>
        setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== field)));

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (saving) return;
        const checked = checkParkForm(t, { name, region, min, max });
        setErrors(checked.errors);
        setFormError(null);
        if (Object.keys(checked.errors).length > 0) {
            revealFirstError();
            return;
        }
        setSaving(true);
        try {
            onSaved(
                editing ? await updatePark(editing.id, { ...checked.input, status }) : await createPark(checked.input),
            );
        } catch (error) {
            const found = parkSaveErrorsOf(error, t);
            setErrors(found.fields);
            setFormError(found.form);
            revealFirstError();
        } finally {
            setSaving(false);
        }
    };

    const isActive = status === ParkStatus.ACTIVE;

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
                        {editing ? t('Edit park') : t('Add park')}
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
                        <div className="ssc-2">
                            <div className={fieldClass(errors.avgSafariPriceMin)}>
                                <label className="label" htmlFor="pk-min">
                                    {t('Min. safari price (₹)')}
                                </label>
                                <input
                                    id="pk-min"
                                    className="input"
                                    type="number"
                                    min="0"
                                    value={min}
                                    aria-invalid={errors.avgSafariPriceMin ? true : undefined}
                                    onChange={(event) => {
                                        setMin(event.target.value);
                                        clear('avgSafariPriceMin');
                                        clear('avgSafariPriceMax');
                                    }}
                                />
                                <FieldError message={errors.avgSafariPriceMin} />
                            </div>
                            <div className={fieldClass(errors.avgSafariPriceMax)}>
                                <label className="label" htmlFor="pk-max">
                                    {t('Max. safari price (₹)')}
                                </label>
                                <input
                                    id="pk-max"
                                    className="input"
                                    type="number"
                                    min="0"
                                    value={max}
                                    aria-invalid={errors.avgSafariPriceMax ? true : undefined}
                                    onChange={(event) => {
                                        setMax(event.target.value);
                                        clear('avgSafariPriceMin');
                                        clear('avgSafariPriceMax');
                                    }}
                                />
                                <FieldError message={errors.avgSafariPriceMax} />
                            </div>
                        </div>
                        {editing && (
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
                        {editing ? t('Save') : t('Add park')}
                    </button>
                </div>
            </form>
        </div>
    );
}
