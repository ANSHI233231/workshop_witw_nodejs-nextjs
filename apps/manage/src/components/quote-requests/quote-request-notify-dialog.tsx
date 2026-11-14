'use client';

import { type FormEvent, useState } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import type { Translate } from '@/lib/i18n/locale';
import { ApiError } from '@/services/api-error';
import { notifyQuoteRequestPartner } from '@/services/quote-request.service';
import { QUOTE_REQUEST_LIMITS, type QuoteRequest } from '@/types/quote-request.types';

const messageProblemOf = (t: Translate, message: string): string | null => {
    if (!message) return t('Enter the message.');
    if (message.length > QUOTE_REQUEST_LIMITS.MESSAGE_MAX) return t('Use up to 255 characters.');
    return null;
};

export function QuoteRequestNotifyDialog({
    request,
    onSent,
    onClose,
}: {
    readonly request: QuoteRequest;
    readonly onSent: (request: QuoteRequest) => void;
    readonly onClose: () => void;
}) {
    const t = useT();
    const [message, setMessage] = useState('');
    const [messageError, setMessageError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (saving) return;
        const trimmed = message.trim();
        const problem = messageProblemOf(t, trimmed);
        setMessageError(problem);
        setFormError(null);
        if (problem) return;
        setSaving(true);
        try {
            await notifyQuoteRequestPartner(request.id, trimmed);
            onSent(request);
        } catch (error) {
            const field = error instanceof ApiError ? error.fieldError('message') : undefined;
            if (field) setMessageError(t(field));
            else
                setFormError(
                    error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
                        ? t(error.message)
                        : t('This could not be done. Please try again.'),
                );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="overlay" onClick={onClose}>
            <form
                className="modal is-sm"
                role="dialog"
                aria-modal="true"
                aria-labelledby="qr-note-t"
                noValidate
                onClick={(event) => event.stopPropagation()}
                onSubmit={(event) => void submit(event)}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="qr-note-t">
                        {t('Send a notification')}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="ss-stack-lg">
                        <p className="ss-muted" style={{ margin: 0 }}>
                            {t('An in-app notification to {partner} about the request from {user}.', {
                                partner: request.partner.businessName,
                                user: request.user.name,
                            })}
                        </p>
                        {formError && (
                            <div className="banner banner-danger" role="alert">
                                {formError}
                            </div>
                        )}
                        <div className={messageError ? 'field is-invalid' : 'field'}>
                            <label className="label" htmlFor="qr-note-text">
                                {t('Message')}
                                <span className="req" aria-hidden="true">
                                    *
                                </span>
                            </label>
                            <textarea
                                id="qr-note-text"
                                className="textarea"
                                rows={4}
                                maxLength={QUOTE_REQUEST_LIMITS.MESSAGE_MAX}
                                value={message}
                                aria-invalid={messageError ? true : undefined}
                                onChange={(event) => {
                                    setMessage(event.target.value);
                                    setMessageError(null);
                                }}
                            />
                            <span className="helper">{t('Up to 255 characters')}</span>
                            {messageError && (
                                <span className="error" role="alert">
                                    {messageError}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="modal-foot">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {t('Send')}
                    </button>
                </div>
            </form>
        </div>
    );
}
