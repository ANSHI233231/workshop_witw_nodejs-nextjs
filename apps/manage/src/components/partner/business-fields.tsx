'use client';

import { useT } from '@/hooks/i18n/use-t';
import { mobileInput } from '@/lib/mobile-input';
import { PARTNER_LIMITS, type ParkOption } from '@/types/partner.types';

import { LogoPicker } from './logo-picker';
import { ParkPicker } from './park-picker';
import type { BusinessErrors, BusinessField, BusinessValues, LogoChoice } from './partner-rules';

const fieldClass = (message: string | undefined): string => (message ? 'field is-invalid' : 'field');

function FieldError({ message }: { readonly message: string | undefined }) {
    return message ? (
        <span className="error" role="alert">
            {message}
        </span>
    ) : null;
}

export function BusinessFields({
    idPrefix,
    values,
    errors,
    parks,
    logo,
    currentLogoUrl,
    onChange,
    onClear,
    onLogoChange,
}: {
    readonly idPrefix: string;
    readonly values: BusinessValues;
    readonly errors: BusinessErrors;
    readonly parks: readonly ParkOption[];
    readonly logo: LogoChoice;
    readonly currentLogoUrl: string | null;
    readonly onChange: (patch: Partial<BusinessValues>) => void;
    readonly onClear: (field: BusinessField) => void;
    readonly onLogoChange: (choice: LogoChoice, error: string | undefined) => void;
}) {
    const t = useT();
    const required = (
        <span className="req" aria-hidden="true">
            *
        </span>
    );
    const set = (field: BusinessField, patch: Partial<BusinessValues>) => {
        onChange(patch);
        onClear(field);
    };

    return (
        <>
            <div className="pk4-2">
                <div className={fieldClass(errors.businessName)}>
                    <label className="label" htmlFor={`${idPrefix}-biz`}>
                        {t('Business name')}
                        {required}
                    </label>
                    <input
                        id={`${idPrefix}-biz`}
                        className="input"
                        maxLength={PARTNER_LIMITS.BUSINESS_NAME_MAX}
                        value={values.businessName}
                        aria-invalid={errors.businessName ? true : undefined}
                        onChange={(event) => set('businessName', { businessName: event.target.value })}
                    />
                    <FieldError message={errors.businessName} />
                </div>
                <div className={fieldClass(errors.ownerName)}>
                    <label className="label" htmlFor={`${idPrefix}-owner`}>
                        {t('Owner name')}
                        {required}
                    </label>
                    <input
                        id={`${idPrefix}-owner`}
                        className="input"
                        maxLength={PARTNER_LIMITS.OWNER_NAME_MAX}
                        value={values.ownerName}
                        aria-invalid={errors.ownerName ? true : undefined}
                        onChange={(event) => set('ownerName', { ownerName: event.target.value })}
                    />
                    <FieldError message={errors.ownerName} />
                </div>
                <div className={fieldClass(errors.businessPhone)}>
                    <label className="label" htmlFor={`${idPrefix}-phone`}>
                        {t('Business phone')}
                        {required}
                    </label>
                    <input
                        id={`${idPrefix}-phone`}
                        className="input"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder={t('10-digit number')}
                        value={values.businessPhone}
                        aria-invalid={errors.businessPhone ? true : undefined}
                        onChange={(event) => set('businessPhone', { businessPhone: mobileInput(event.target.value) })}
                    />
                    <FieldError message={errors.businessPhone} />
                </div>
                <div className={fieldClass(errors.businessEmail)}>
                    <label className="label" htmlFor={`${idPrefix}-email`}>
                        {t('Business email')}
                        {required}
                    </label>
                    <input
                        id={`${idPrefix}-email`}
                        className="input"
                        type="email"
                        maxLength={PARTNER_LIMITS.BUSINESS_EMAIL_MAX}
                        value={values.businessEmail}
                        aria-invalid={errors.businessEmail ? true : undefined}
                        onChange={(event) => set('businessEmail', { businessEmail: event.target.value })}
                    />
                    <FieldError message={errors.businessEmail} />
                </div>
            </div>
            <ParkPicker
                parks={parks}
                selected={values.parkIds}
                error={errors.masterParkIds}
                onChange={(parkIds) => set('masterParkIds', { parkIds })}
            />
            <div className={fieldClass(errors.about)}>
                <label className="label" htmlFor={`${idPrefix}-about`}>
                    {t('About your business')}
                </label>
                <textarea
                    id={`${idPrefix}-about`}
                    className="textarea"
                    rows={4}
                    value={values.about}
                    onChange={(event) => set('about', { about: event.target.value })}
                />
                <FieldError message={errors.about} />
            </div>
            <LogoPicker
                choice={logo}
                currentUrl={currentLogoUrl}
                businessName={values.businessName.trim()}
                error={errors.logo}
                inputId={`${idPrefix}-logo`}
                onChange={onLogoChange}
            />
        </>
    );
}
