'use client';

import { type FormEvent, useMemo, useState } from 'react';

import { BusinessFields } from '@/components/partner/business-fields';
import {
    type BusinessErrors,
    type BusinessField,
    type BusinessValues,
    businessErrorsOf,
    businessInputOf,
    checkBusiness,
    hasBusinessErrors,
    type LogoChoice,
    NO_LOGO_CHOICE,
} from '@/components/partner/partner-rules';
import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useRevealFirstError } from '@/hooks/ui/use-reveal-first-error';
import { ApiError } from '@/services/api-error';
import { editPartner, partnerLogoUrl, removePartnerLogo, uploadPartnerLogo } from '@/services/partner.service';
import type { ParkOption, Partner } from '@/types/partner.types';

const optionsFor = (parks: readonly ParkOption[], partner: Partner): readonly ParkOption[] => {
    const known = new Set(parks.map((park) => park.id));
    const own = partner.parks.filter((park) => !known.has(park.id)).map((park) => ({ id: park.id, name: park.name }));
    return [...parks, ...own].sort((a, b) => a.name.localeCompare(b.name));
};

export function PartnerEditDialog({
    partner,
    parks,
    onSaved,
    onClose,
}: {
    readonly partner: Partner;
    readonly parks: readonly ParkOption[];
    readonly onSaved: () => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    const { formRef, revealFirstError } = useRevealFirstError<HTMLFormElement>();
    const [values, setValues] = useState<BusinessValues>({
        businessName: partner.businessName,
        ownerName: partner.ownerName,
        businessPhone: partner.businessPhone,
        businessEmail: partner.businessEmail,
        about: partner.about ?? '',
        parkIds: partner.parks.map((park) => park.id),
    });
    const [errors, setErrors] = useState<BusinessErrors>({});
    const [logo, setLogo] = useState<LogoChoice>(NO_LOGO_CHOICE);
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const options = useMemo(() => optionsFor(parks, partner), [parks, partner]);
    const currentLogoUrl = partner.logoVersion ? partnerLogoUrl(partner.id, partner.logoVersion) : null;

    const clear = (field: BusinessField) => setErrors((current) => ({ ...current, [field]: undefined }));

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (saving) return;
        const found = { ...checkBusiness(t, values), logo: errors.logo };
        setErrors(found);
        setFormError(null);
        if (hasBusinessErrors(found)) {
            revealFirstError();
            return;
        }
        setSaving(true);
        try {
            await editPartner(partner.id, businessInputOf(values));
            if (logo.file) await uploadPartnerLogo(partner.id, logo.file);
            else if (logo.removed) await removePartnerLogo(partner.id);
            onSaved();
        } catch (error) {
            if (error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR) {
                const fields = businessErrorsOf(t, error);
                if (hasBusinessErrors(fields)) {
                    setErrors(fields);
                    revealFirstError();
                } else setFormError(t(error.message));
            } else setFormError(t('It could not be saved. Please try again.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="overlay" onClick={onClose}>
            <form
                ref={formRef}
                className="modal is-lg"
                role="dialog"
                aria-modal="true"
                aria-labelledby="pt-edit-t"
                noValidate
                onClick={(event) => event.stopPropagation()}
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="pt-edit-t">
                        {t('Edit partner')}
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
                        <BusinessFields
                            idPrefix="pe"
                            values={values}
                            errors={errors}
                            parks={options}
                            logo={logo}
                            currentLogoUrl={currentLogoUrl}
                            onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
                            onClear={clear}
                            onLogoChange={(choice, problem) => {
                                setLogo(choice);
                                setErrors((current) => ({ ...current, logo: problem }));
                            }}
                        />
                    </div>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {t('Save')}
                    </button>
                </div>
            </form>
        </div>
    );
}
