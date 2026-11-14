'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { SiteToast } from '@/components/shared-safari/site-toast';
import { ExternalLinkIcon, SendIcon } from '@/components/website/site-icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSiteToast } from '@/hooks/shared-safari/use-site-toast';
import { useRevealFirstError } from '@/hooks/ui/use-reveal-first-error';
import { config } from '@/lib/config';
import { MOBILE_INPUT_LENGTH, mobileInput } from '@/lib/mobile-input';
import { ApiError } from '@/services/api-error';
import {
    sendPartnerRequest,
    sendPartnerRequestWithAccount,
    uploadPartnerLogo,
} from '@/services/partner.service';
import { PASSWORD_LIMITS, SIGN_UP_LIMITS } from '@/types/auth.types';
import { type MyPartnerRequest, type ParkOption, PartnerStatus } from '@/types/partner.types';

import { BusinessFields } from './business-fields';
import {
    type AccountErrors,
    type AccountField,
    type AccountValues,
    accountErrorsOf,
    checkAccount,
    hasAccountErrors,
} from './partner-account-rules';
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
} from './partner-rules';

const SIGN_IN_PATH = '/login';

const STATUS_CARDS = {
    [PartnerStatus.PENDING]: {
        badge: 'badge badge-warning',
        label: 'Pending',
        title: 'Your partner request is waiting for approval',
        text: "We'll check your business details. You can see the status in the Partner portal.",
    },
    [PartnerStatus.REJECTED]: {
        badge: 'badge badge-danger',
        label: 'Rejected',
        title: 'Your partner request was not approved',
        text: 'See the reason in the Partner portal, edit your details and send the request again.',
    },
    [PartnerStatus.ACTIVE]: {
        badge: 'badge badge-success',
        label: 'Active',
        title: 'You are a partner',
        text: 'Add and manage your packages in the Partner portal.',
    },
    [PartnerStatus.INACTIVE]: {
        badge: 'badge badge-neutral',
        label: 'Inactive',
        title: 'Your partner account is deactivated',
        text: 'Your account has been deactivated. Please contact the administrator for further assistance.',
    },
} as const;

const EMPTY_BUSINESS: BusinessValues = {
    businessName: '',
    ownerName: '',
    businessPhone: '',
    businessEmail: '',
    about: '',
    parkIds: [],
};

const EMPTY_ACCOUNT: AccountValues = { name: '', email: '', mobile: '', password: '' };

function StatusCard({ request }: { readonly request: MyPartnerRequest }) {
    const t = useT();
    const card = STATUS_CARDS[request.status];
    const portalUrl = config.partnerPortalUrl;
    return (
        <div className="pk-status">
            <span>
                <span className={card.badge}>{t(card.label)}</span>
            </span>
            <h2>{t(card.title)}</h2>
            <p>{t(card.text)}</p>
            <a className="btn btn-primary" href={portalUrl} style={{ alignSelf: 'flex-start' }}>
                <ExternalLinkIcon />
                {t('Open Partner portal')}
            </a>
        </div>
    );
}

export function BecomeAPartner({
    signedIn,
    request,
    parks,
}: {
    readonly signedIn: boolean;
    readonly request: MyPartnerRequest | null;
    readonly parks: readonly ParkOption[];
}) {
    const t = useT();
    const router = useRouter();
    const { toast, show, showError, hide } = useSiteToast();
    const { formRef, revealFirstError } = useRevealFirstError<HTMLDivElement>();
    const [account, setAccount] = useState<AccountValues>(EMPTY_ACCOUNT);
    const [accountErrors, setAccountErrors] = useState<AccountErrors>({});
    const [business, setBusiness] = useState<BusinessValues>(EMPTY_BUSINESS);
    const [businessErrors, setBusinessErrors] = useState<BusinessErrors>({});
    const [logo, setLogo] = useState<LogoChoice>(NO_LOGO_CHOICE);
    const [sending, setSending] = useState(false);

    const clearAccount = (field: AccountField) => setAccountErrors((errors) => ({ ...errors, [field]: undefined }));
    const clearBusiness = (field: BusinessField) =>
        setBusinessErrors((errors) => ({ ...errors, [field]: undefined }));
    const accountClass = (field: AccountField): string => `field${accountErrors[field] ? ' is-invalid' : ''}`;
    const accountError = (field: AccountField) =>
        accountErrors[field] && (
            <span className="error" role="alert">
                {accountErrors[field]}
            </span>
        );
    const required = (
        <span className="req" aria-hidden="true">
            *
        </span>
    );
    const setAccountField = (field: AccountField, value: string) => {
        setAccount((current) => ({ ...current, [field]: value }));
        clearAccount(field);
    };

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (sending) return;
        const foundAccount = signedIn ? {} : checkAccount(t, account);
        const foundBusiness = checkBusiness(t, business);
        setAccountErrors(foundAccount);
        setBusinessErrors((current) => ({ ...foundBusiness, logo: current.logo }));
        if (hasAccountErrors(foundAccount) || hasBusinessErrors({ ...foundBusiness, logo: businessErrors.logo })) {
            revealFirstError();
            return;
        }
        setSending(true);
        try {
            const details = businessInputOf(business);
            if (signedIn) {
                await sendPartnerRequest(details);
            } else {
                await sendPartnerRequestWithAccount({
                    name: account.name.trim(),
                    email: account.email.trim(),
                    mobile: account.mobile,
                    password: account.password,
                    ...details,
                });
            }
            let logoProblem: string | null = null;
            if (logo.file) {
                try {
                    await uploadPartnerLogo(logo.file);
                } catch (error) {
                    logoProblem =
                        error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR
                            ? t(error.message)
                            : t('This could not be done. Please try again.');
                }
            }
            if (logoProblem) showError(logoProblem);
            else show(signedIn ? t('Your partner request is sent.') : t('Your account is created and your partner request is sent.'));
            window.scrollTo({ top: 0 });
            router.refresh();
        } catch (error) {
            if (error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR) {
                const foundAccountApi = accountErrorsOf(t, error);
                const foundBusinessApi = businessErrorsOf(t, error);
                if (hasAccountErrors(foundAccountApi) || hasBusinessErrors(foundBusinessApi)) {
                    setAccountErrors(foundAccountApi);
                    setBusinessErrors(foundBusinessApi);
                    revealFirstError();
                } else {
                    showError(t(error.message));
                    if (error.code === 'PARTNER_REQUEST_EXISTS') router.refresh();
                }
            } else {
                showError(t('This could not be done. Please try again.'));
            }
        } finally {
            setSending(false);
        }
    };

    if (request) {
        return (
            <>
                <StatusCard request={request} />
                <SiteToast toast={toast} onClose={hide} />
            </>
        );
    }

    return (
        <>
            <div className="pk4">
                <div className="pk4-form" ref={formRef}>
                    {!signedIn && (
                        <>
                            <h2>{t('Account details')}</h2>
                            <div className="pk4-2">
                                <div className={accountClass('name')}>
                                    <label className="label" htmlFor="a-name">
                                        {t('Full name')}
                                        {required}
                                    </label>
                                    <input
                                        id="a-name"
                                        className="input"
                                        maxLength={SIGN_UP_LIMITS.NAME_MAX}
                                        autoComplete="name"
                                        value={account.name}
                                        aria-invalid={accountErrors.name ? true : undefined}
                                        onChange={(event) => setAccountField('name', event.target.value)}
                                    />
                                    {accountError('name')}
                                </div>
                                <div className={accountClass('email')}>
                                    <label className="label" htmlFor="a-email">
                                        {t('Email')}
                                        {required}
                                    </label>
                                    <input
                                        id="a-email"
                                        className="input"
                                        type="email"
                                        autoComplete="email"
                                        maxLength={SIGN_UP_LIMITS.EMAIL}
                                        value={account.email}
                                        aria-invalid={accountErrors.email ? true : undefined}
                                        onChange={(event) => setAccountField('email', event.target.value)}
                                    />
                                    {accountError('email')}
                                </div>
                                <div className={accountClass('mobile')}>
                                    <label className="label" htmlFor="a-mobile">
                                        {t('Mobile number')}
                                        {required}
                                    </label>
                                    <input
                                        id="a-mobile"
                                        className="input"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={MOBILE_INPUT_LENGTH}
                                        placeholder={t('10-digit mobile number')}
                                        value={account.mobile}
                                        aria-invalid={accountErrors.mobile ? true : undefined}
                                        onChange={(event) => setAccountField('mobile', mobileInput(event.target.value))}
                                    />
                                    {accountError('mobile')}
                                </div>
                                <div className={accountClass('password')}>
                                    <label className="label" htmlFor="a-password">
                                        {t('Password')}
                                        {required}
                                    </label>
                                    <input
                                        id="a-password"
                                        className="input"
                                        type="password"
                                        autoComplete="new-password"
                                        maxLength={PASSWORD_LIMITS.MAX}
                                        placeholder={t('8 to 72 characters')}
                                        value={account.password}
                                        aria-invalid={accountErrors.password ? true : undefined}
                                        onChange={(event) => setAccountField('password', event.target.value)}
                                    />
                                    {accountError('password')}
                                </div>
                            </div>
                            <p className="ss-cap" style={{ margin: '-12px 0 0' }}>
                                {t('Already have an account?')} <Link href={SIGN_IN_PATH}>{t('Login')}</Link>{' '}
                                {t('and send only the business details.')}
                            </p>
                        </>
                    )}
                    <h2>{t('Business details')}</h2>
                    <BusinessFields
                        idPrefix="b"
                        values={business}
                        errors={businessErrors}
                        parks={parks}
                        logo={logo}
                        currentLogoUrl={null}
                        onChange={(patch) => setBusiness((current) => ({ ...current, ...patch }))}
                        onClear={clearBusiness}
                        onLogoChange={(choice, problem) => {
                            setLogo(choice);
                            setBusinessErrors((current) => ({ ...current, logo: problem }));
                        }}
                    />
                    <div className="ss-row">
                        <button type="button" className="btn btn-primary" disabled={sending} onClick={(event) => void submit(event)}>
                            <SendIcon />
                            {t('Send request')}
                        </button>
                    </div>
                </div>
                <aside className="pk4-side">
                    <h3>{t('How it works')}</h3>
                    <ol>
                        <li>{t('Send your business details.')}</li>
                        <li>{t('The Walk Into The Wild team checks and approves your request.')}</li>
                        <li>{t('Sign in to the Partner portal with your website details and add your packages.')}</li>
                        <li>{t('Every package and gallery is approved before it goes live.')}</li>
                    </ol>
                </aside>
            </div>
            <SiteToast toast={toast} onClose={hide} />
        </>
    );
}
