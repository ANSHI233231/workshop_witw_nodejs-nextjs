'use client';

import Link from 'next/link';
import { useState } from 'react';

import { SITE_PATHS } from '@/components/website/witw-site-frame';
import { SiteToast } from '@/components/shared-safari/site-toast';
import { useT } from '@/hooks/i18n/use-t';
import { useSiteToast } from '@/hooks/shared-safari/use-site-toast';
import { cn } from '@/lib/class-names';
import { config } from '@/lib/config';
import { ApiError } from '@/services/api-error';
import { sendQuoteRequest } from '@/services/quote-request.service';
import { QUOTE_LIMITS } from '@/types/quote-request.types';

import { ExternalLinkIcon } from '../website/site-icons';

export type QuoteViewer = 'guest' | 'user' | 'partner';

type Values = { readonly travellers: string; readonly start: string; readonly notes: string };

type Field = keyof Values;

type Errors = Partial<Record<Field, string>>;

const EMPTY: Values = { travellers: '', start: '', notes: '' };

const INDIA_DATE = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

const todayIso = (): string => INDIA_DATE.format(new Date());

const API_FIELD: Readonly<Record<Field, string>> = { travellers: 'travellerCount', start: 'startDate', notes: 'notes' };

const checkValues = (values: Values, today: string, t: (text: string) => string): Errors => {
    const errors: { -readonly [K in Field]?: string } = {};
    const travellers = values.travellers.trim();
    const count = parseInt(travellers, 10);
    if (!travellers) errors.travellers = t('Enter the number of travellers.');
    else if (
        Number.isNaN(count) ||
        count < QUOTE_LIMITS.TRAVELLERS_MIN ||
        count > QUOTE_LIMITS.TRAVELLERS_MAX ||
        String(count) !== travellers
    )
        errors.travellers = t('Enter a number from 1 to 100.');
    if (!values.start) errors.start = t('Choose a start date.');
    else if (values.start < today) errors.start = t('Choose today or a later date.');
    const notes = values.notes.trim();
    if (!notes) errors.notes = t('Enter your notes.');
    else if (notes.length > QUOTE_LIMITS.NOTES_MAX) errors.notes = t('Use up to 1,000 characters.');
    return errors;
};

function FieldError({ message }: { readonly message: string | undefined }) {
    return message ? (
        <span className="error" role="alert">
            {message}
        </span>
    ) : null;
}

function PartnerNote() {
    const t = useT();
    return (
        <div className="pk2-note">
            <span>
                {t("Partners can't send quote requests. Your own packages and quote requests are in the Partner portal.")}
            </span>
            <a className="btn btn-secondary" href={config.partnerPortalUrl}>
                <ExternalLinkIcon />
                {t('Partner portal')}
            </a>
        </div>
    );
}

export function QuoteForm({
    packageId,
    slug,
    businessName,
    viewer,
}: {
    readonly packageId: number;
    readonly slug: string;
    readonly businessName: string;
    readonly viewer: QuoteViewer;
}) {
    const t = useT();
    const { toast, show, showError, hide } = useSiteToast();
    const [values, setValues] = useState<Values>(EMPTY);
    const [errors, setErrors] = useState<Errors>({});
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [isPartner, setIsPartner] = useState(viewer === 'partner');

    const set = (field: Field, value: string) => {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
        setSent(false);
    };

    const send = async () => {
        if (sending) return;
        const found = checkValues(values, todayIso(), t);
        setErrors(found);
        if (Object.keys(found).length > 0) return;
        setSending(true);
        try {
            await sendQuoteRequest({
                packageId,
                travellerCount: parseInt(values.travellers.trim(), 10),
                startDate: values.start,
                notes: values.notes.trim(),
            });
            setValues(EMPTY);
            setSent(true);
            show(t('Your quote request is sent to {business}.', { business: businessName }));
        } catch (error) {
            if (error instanceof ApiError && error.code === 'QUOTE_REQUEST_PARTNER') setIsPartner(true);
            else if (error instanceof ApiError && error.errors.length > 0) {
                setErrors({
                    travellers: error.fieldError(API_FIELD.travellers),
                    start: error.fieldError(API_FIELD.start),
                    notes: error.fieldError(API_FIELD.notes),
                });
            } else showError(error instanceof ApiError ? error.message : t('This could not be done. Please try again.'));
        } finally {
            setSending(false);
        }
    };

    const fieldClass = (field: Field): string => cn('field', errors[field] && 'is-invalid');
    const required = (
        <span className="req" aria-hidden="true">
            *
        </span>
    );

    return (
        <div className="pk2-sec pk2-quote" id="pk-quote">
            <div className="pk2-sec-h">{t('Request a quote')}</div>
            <div className="pk2-sec-b">
                {viewer === 'guest' && (
                    <div className="pk2-note">
                        <span>{t('Log in to send a quote request to this operator.')}</span>
                        <Link
                            className="btn btn-primary"
                            href={`${SITE_PATHS.signIn}?next=${encodeURIComponent(`${SITE_PATHS.packages}/${encodeURIComponent(slug)}`)}`}
                        >
                            {t('Login')}
                        </Link>
                    </div>
                )}
                {viewer !== 'guest' && isPartner && <PartnerNote />}
                {viewer === 'user' && !isPartner && (
                    <>
                        <div className="pk2-qrow">
                            <div className={fieldClass('travellers')}>
                                <label className="label" htmlFor="q-travellers">
                                    {t('Travellers')}
                                    {required}
                                </label>
                                <input
                                    id="q-travellers"
                                    className="input"
                                    type="number"
                                    min={QUOTE_LIMITS.TRAVELLERS_MIN}
                                    max={QUOTE_LIMITS.TRAVELLERS_MAX}
                                    inputMode="numeric"
                                    value={values.travellers}
                                    aria-invalid={errors.travellers ? true : undefined}
                                    onChange={(event) => set('travellers', event.target.value)}
                                />
                                <FieldError message={errors.travellers} />
                            </div>
                            <div className={fieldClass('start')}>
                                <label className="label" htmlFor="q-start">
                                    {t('Start date')}
                                    {required}
                                </label>
                                <input
                                    id="q-start"
                                    className="input"
                                    type="date"
                                    min={todayIso()}
                                    value={values.start}
                                    aria-invalid={errors.start ? true : undefined}
                                    onChange={(event) => set('start', event.target.value)}
                                />
                                <FieldError message={errors.start} />
                            </div>
                        </div>
                        <div className={fieldClass('notes')}>
                            <label className="label" htmlFor="q-notes">
                                {t('Notes')}
                                {required}
                            </label>
                            <textarea
                                id="q-notes"
                                className="textarea"
                                rows={4}
                                maxLength={QUOTE_LIMITS.NOTES_MAX}
                                placeholder={t('Tell the operator about your group and what you need')}
                                value={values.notes}
                                aria-invalid={errors.notes ? true : undefined}
                                onChange={(event) => set('notes', event.target.value)}
                            />
                            <FieldError message={errors.notes} />
                        </div>
                        <span className="pk-counter">{`${values.notes.length.toLocaleString('en-IN')} / 1,000`}</span>
                        <button type="button" className="btn btn-primary" disabled={sending} onClick={() => void send()}>
                            {t('Request a quote')}
                        </button>
                        {sent && (
                            <div className="banner banner-success" role="status">
                                {t('Your quote request is sent.')}{' '}
                                <Link href={SITE_PATHS.myQuoteRequests}>{t('My Quote Requests')}</Link>
                            </div>
                        )}
                    </>
                )}
            </div>
            <SiteToast toast={toast} onClose={hide} />
        </div>
    );
}
