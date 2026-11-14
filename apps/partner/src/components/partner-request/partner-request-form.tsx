'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

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
import { SendIcon } from '@/components/portal/portal-icons';
import { useT } from '@/hooks/i18n/use-t';
import { useRevealFirstError } from '@/hooks/ui/use-reveal-first-error';
import { ApiError } from '@/services/api-error';
import {
    partnerLogoUrl,
    removePartnerLogo,
    sendPartnerRequest,
    sendPartnerRequestAgain,
    uploadPartnerLogo,
} from '@/services/partner.service';
import type { MyPartnerRequest, ParkOption } from '@/types/partner.types';

import { announceRequestNotice } from './partner-request-notice';

const EMPTY_BUSINESS: BusinessValues = {
    businessName: '',
    ownerName: '',
    businessPhone: '',
    businessEmail: '',
    about: '',
    parkIds: [],
};

const optionsFor = (parks: readonly ParkOption[], request: MyPartnerRequest | null): readonly ParkOption[] => {
    const known = new Set(parks.map((park) => park.id));
    const own = (request?.parks ?? [])
        .filter((park) => !known.has(park.id))
        .map((park) => ({ id: park.id, name: park.name }));
    return [...parks, ...own].sort((a, b) => a.name.localeCompare(b.name));
};

const valuesOf = (request: MyPartnerRequest | null): BusinessValues =>
    request
        ? {
              businessName: request.businessName,
              ownerName: request.ownerName,
              businessPhone: request.businessPhone,
              businessEmail: request.businessEmail,
              about: request.about ?? '',
              parkIds: request.parks.map((park) => park.id),
          }
        : EMPTY_BUSINESS;

export function PartnerRequestForm({
    request,
    parks,
}: {
    readonly request: MyPartnerRequest | null;
    readonly parks: readonly ParkOption[];
}) {
    const t = useT();
    const router = useRouter();
    const { formRef, revealFirstError } = useRevealFirstError<HTMLDivElement>();
    const [values, setValues] = useState<BusinessValues>(() => valuesOf(request));
    const [errors, setErrors] = useState<BusinessErrors>({});
    const [logo, setLogo] = useState<LogoChoice>(NO_LOGO_CHOICE);
    const [sending, setSending] = useState(false);
    const options = useMemo(() => optionsFor(parks, request), [parks, request]);
    const currentLogoUrl = request?.logoVersion ? partnerLogoUrl(request.logoVersion) : null;

    const clear = (field: BusinessField) => setErrors((current) => ({ ...current, [field]: undefined }));

    const submit = async () => {
        if (sending) return;
        const found = { ...checkBusiness(t, values), logo: errors.logo };
        setErrors(found);
        if (hasBusinessErrors(found)) {
            revealFirstError();
            return;
        }
        setSending(true);
        try {
            const details = businessInputOf(values);
            await (request ? sendPartnerRequestAgain(details) : sendPartnerRequest(details));
            let logoProblem: string | null = null;
            try {
                if (logo.file) await uploadPartnerLogo(logo.file);
                else if (logo.removed && request?.logoVersion) await removePartnerLogo();
            } catch (error) {
                logoProblem =
                    error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
                        ? t(error.message)
                        : t('This could not be done. Please try again.');
            }
            if (logoProblem) announceRequestNotice(logoProblem, true);
            else announceRequestNotice(t('Your partner request is sent.'), false);
            window.scrollTo({ top: 0 });
            router.refresh();
        } catch (error) {
            if (error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR) {
                const fields = businessErrorsOf(t, error);
                if (hasBusinessErrors(fields)) {
                    setErrors(fields);
                    revealFirstError();
                } else {
                    announceRequestNotice(t(error.message), true);
                    if (error.code === 'PARTNER_REQUEST_EXISTS' || error.code === 'PARTNER_REQUEST_NOT_REJECTED') {
                        router.refresh();
                    }
                }
            } else {
                announceRequestNotice(t('This could not be done. Please try again.'), true);
            }
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <div className="pk4-form" ref={formRef}>
                <h2>{t('Business details')}</h2>
                <BusinessFields
                    idPrefix="b"
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
                <div className="ss-row">
                    <button type="button" className="btn btn-primary" disabled={sending} onClick={() => void submit()}>
                        <SendIcon />
                        {request ? t('Send again') : t('Send request')}
                    </button>
                </div>
            </div>
        </>
    );
}
