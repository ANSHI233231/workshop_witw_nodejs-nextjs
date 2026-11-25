'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';

import { SiteToast } from '@/components/shared-safari/site-toast';
import { useT } from '@/hooks/i18n/use-t';
import { useSiteToast } from '@/hooks/shared-safari/use-site-toast';
import { useRevealFirstError } from '@/hooks/ui/use-reveal-first-error';
import { cn } from '@/lib/class-names';
import type { Translate } from '@/lib/i18n/locale';
import { logger } from '@/lib/logger';
import {
    checkDateOfBirth,
    checkGender,
    checkProfileImage,
    checkSocialLink,
    todayInIndia,
} from '@/lib/profile-rules';
import { ApiError } from '@/services/api-error';
import {
    getMyProfile,
    removeMyCoverPhoto,
    removeMyPhoto,
    saveMyCoverPhoto,
    saveMyPhoto,
    saveMyProfile,
    userCoverPhotoUrl,
    userPhotoUrl,
} from '@/services/profile.service';
import {
    GENDER_OPTIONS,
    type GenderCode,
    type MyProfile,
    PROFILE_IMAGE_ACCEPT,
    PROFILE_LIMITS,
} from '@/types/profile.types';

import { useMyPhoto } from './my-photo-provider';

const log = logger.category('profile');

type Tab = 'general' | 'photo' | 'cover';

type GeneralField =
    | 'name'
    | 'dateOfBirth'
    | 'gender'
    | 'bio'
    | 'about'
    | 'facebookUrl'
    | 'xUrl'
    | 'instagramUrl'
    | 'youtubeUrl';

type GeneralValues = Readonly<Record<Exclude<GeneralField, 'gender'>, string>> & { readonly gender: string };

type GeneralErrors = Partial<Record<GeneralField, string>>;

const GENERAL_FIELDS: readonly GeneralField[] = [
    'name',
    'dateOfBirth',
    'gender',
    'bio',
    'about',
    'facebookUrl',
    'xUrl',
    'instagramUrl',
    'youtubeUrl',
];

const LINK_FIELDS = [
    { field: 'facebookUrl', id: 'ep-fb', label: 'Facebook' },
    { field: 'xUrl', id: 'ep-x', label: 'X' },
    { field: 'instagramUrl', id: 'ep-ig', label: 'Instagram' },
    { field: 'youtubeUrl', id: 'ep-yt', label: 'YouTube' },
] as const;

const valuesOf = (profile: MyProfile): GeneralValues => ({
    name: profile.name,
    dateOfBirth: profile.dateOfBirth ?? '',
    gender: profile.gender === null ? '' : String(profile.gender),
    bio: profile.bio ?? '',
    about: profile.about ?? '',
    facebookUrl: profile.facebookUrl ?? '',
    xUrl: profile.xUrl ?? '',
    instagramUrl: profile.instagramUrl ?? '',
    youtubeUrl: profile.youtubeUrl ?? '',
});

const checkGeneral = (t: Translate, values: GeneralValues, stored: MyProfile): GeneralErrors => {
    const errors: GeneralErrors = {};
    const name = values.name.trim();
    if (name === '') errors.name = t('Enter your name.');
    else if (name.length > PROFILE_LIMITS.NAME_MAX) errors.name = t('Use up to 100 characters.');
    const dob = checkDateOfBirth(t, values.dateOfBirth, stored.dateOfBirth !== null);
    if (dob) errors.dateOfBirth = dob;
    const gender = checkGender(t, values.gender === '' ? null : (Number(values.gender) as GenderCode), stored.gender !== null);
    if (gender) errors.gender = gender;
    for (const { field } of LINK_FIELDS) {
        const problem = checkSocialLink(t, values[field]);
        if (problem) errors[field] = problem;
    }
    return errors;
};

const pictureStyle = (url: string | null) => (url ? { backgroundImage: `url("${url}")` } : undefined);

function UserPlaceholderIcon() {
    return (
        <svg
            className="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="8" r="5"></circle>
            <path d="M20 21a8 8 0 0 0-16 0"></path>
        </svg>
    );
}

function ImagePlaceholderIcon() {
    return (
        <svg
            className="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
        </svg>
    );
}

type PictureChoice = { readonly file: File | null; readonly preview: string | null; readonly removed: boolean };

const NO_CHOICE: PictureChoice = { file: null, preview: null, removed: false };

function PictureField({
    kind,
    currentUrl,
    onSaved,
}: {
    readonly kind: 'photo' | 'cover';
    readonly currentUrl: string | null;
    readonly onSaved: (profile: MyProfile) => void;
}) {
    const t = useT();
    const { show, showError, toast, hide } = useSiteToast();
    const isPhoto = kind === 'photo';
    const limit = isPhoto ? PROFILE_LIMITS.PHOTO_MAX_BYTES : PROFILE_LIMITS.COVER_MAX_BYTES;
    const fileInput = useRef<HTMLInputElement>(null);
    const [inputKey, setInputKey] = useState(0);
    const [choice, setChoice] = useState<PictureChoice>(NO_CHOICE);
    const [error, setError] = useState<string | undefined>();
    const [saving, setSaving] = useState(false);
    const id = isPhoto ? 'ep-photo' : 'ep-cover';

    const shown = choice.file ? choice.preview : choice.removed ? null : currentUrl;

    const reset = () => {
        setChoice(NO_CHOICE);
        setInputKey((key) => key + 1);
    };

    const pick = (file: File | undefined) => {
        if (!file) return;
        const problem = checkProfileImage(t, file, limit);
        if (problem) {
            setError(problem);
            setChoice((current) => ({ ...current, file: null, preview: null }));
            setInputKey((key) => key + 1);
            return;
        }
        setError(undefined);
        const reader = new FileReader();
        reader.onload = () =>
            setChoice({ file, preview: typeof reader.result === 'string' ? reader.result : null, removed: false });
        reader.readAsDataURL(file);
    };

    const remove = () => {
        setError(undefined);
        setChoice({ file: null, preview: null, removed: true });
        setInputKey((key) => key + 1);
    };

    const save = async () => {
        if (saving) return;
        setSaving(true);
        try {
            if (choice.file) {
                onSaved(await (isPhoto ? saveMyPhoto(choice.file) : saveMyCoverPhoto(choice.file)));
            } else if (choice.removed) {
                onSaved(await (isPhoto ? removeMyPhoto() : removeMyCoverPhoto()));
            }
            reset();
            setError(undefined);
            show(isPhoto ? t('Your profile photo is saved.') : t('Your cover photo is saved.'));
        } catch (failure) {
            log.error('A picture could not be saved.', { error: failure });
            if (failure instanceof ApiError && failure.code === ApiError.NETWORK_ERROR) {
                showError(t('Could not reach the server. Please check your connection and try again.'));
            } else if (failure instanceof ApiError) {
                setError(failure.fieldError(isPhoto ? 'photo' : 'coverPhoto') ?? t(failure.message));
            } else {
                showError(t('This could not be done. Please try again.'));
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className={error ? 'field is-invalid' : 'field'}>
                <span className="label" id={`${id}-label`}>
                    {isPhoto ? t('Profile photo') : t('Cover photo')}
                </span>
                <div className="ep-photo">
                    <span className={isPhoto ? 'up-pic ep-pic' : 'up-cover ep-cover'} style={pictureStyle(shown)}>
                        {!shown && (isPhoto ? <UserPlaceholderIcon /> : <ImagePlaceholderIcon />)}
                    </span>
                    <div className="pk-logo-actions">
                        <input
                            key={inputKey}
                            ref={fileInput}
                            className="sr-only"
                            type="file"
                            tabIndex={-1}
                            aria-hidden="true"
                            accept={PROFILE_IMAGE_ACCEPT}
                            onChange={(event) => pick(event.target.files?.[0])}
                        />
                        <button
                            id={id}
                            type="button"
                            aria-labelledby={`${id}-label ${id}`}
                            className="btn btn-secondary"
                            aria-describedby={error ? `${id}-error` : undefined}
                            onClick={() => fileInput.current?.click()}
                        >
                            {t('Choose file')}
                        </button>
                        {choice.file && <span className="pk-logo-name">{choice.file.name}</span>}
                        {shown && (
                            <button type="button" className="btn btn-text" onClick={remove}>
                                {isPhoto ? t('Remove photo') : t('Remove cover photo')}
                            </button>
                        )}
                    </div>
                </div>
                <span className="helper">
                    {isPhoto ? t('JPG, JPEG or PNG, up to 250 KB') : t('JPG, JPEG or PNG, up to 500 KB')}
                </span>
                {error && (
                    <span id={`${id}-error`} className="error" role="alert">
                        {error}
                    </span>
                )}
            </div>
            <div className="ep-foot">
                <button type="button" className="btn btn-primary" disabled={saving} onClick={() => void save()}>
                    {t('Save')}
                </button>
            </div>
            {toast && <SiteToast toast={toast} onClose={hide} />}
        </>
    );
}

export function EditProfile() {
    const t = useT();
    const router = useRouter();
    const my = useMyPhoto();
    const { setPhotoVersion } = my;
    const { toast, show, showError, hide } = useSiteToast();
    const [tab, setTab] = useState<Tab>('general');
    const [profile, setProfile] = useState<MyProfile | null>(null);
    const [values, setValues] = useState<GeneralValues | null>(null);
    const [errors, setErrors] = useState<GeneralErrors>({});
    const [saving, setSaving] = useState(false);
    const { formRef, revealFirstError } = useRevealFirstError<HTMLFormElement>();

    useEffect(() => {
        getMyProfile()
            .then((loaded) => {
                setProfile(loaded);
                setValues(valuesOf(loaded));
            })
            .catch((error: unknown) => {
                log.error('Your profile could not be loaded.', { error });
                showError(error instanceof ApiError ? t(error.message) : t('This could not be done. Please try again.'));
            });
    }, [showError, t]);

    const change = (field: GeneralField, value: string) => {
        setValues((current) => (current ? { ...current, [field]: value } : current));
        setErrors((current) => ({ ...current, [field]: undefined }));
    };

    const pictureSaved = useCallback(
        (saved: MyProfile) => {
            setProfile(saved);
            setPhotoVersion(saved.photoVersion);
            router.refresh();
        },
        [router, setPhotoVersion],
    );

    const saveGeneral = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!profile || !values || saving) return;
        const found = checkGeneral(t, values, profile);
        setErrors(found);
        revealFirstError();
        if (GENERAL_FIELDS.some((field) => found[field])) return;
        setSaving(true);
        try {
            const saved = await saveMyProfile({
                name: values.name.trim(),
                dateOfBirth: values.dateOfBirth === '' ? null : values.dateOfBirth,
                gender: values.gender === '' ? null : (Number(values.gender) as GenderCode),
                bio: values.bio,
                about: values.about,
                facebookUrl: values.facebookUrl.trim(),
                xUrl: values.xUrl.trim(),
                instagramUrl: values.instagramUrl.trim(),
                youtubeUrl: values.youtubeUrl.trim(),
            });
            setProfile(saved);
            setValues(valuesOf(saved));
            show(t('Your profile is saved.'));
            router.refresh();
        } catch (error) {
            log.error('Your profile could not be saved.', { error });
            if (error instanceof ApiError && error.code === ApiError.NETWORK_ERROR) {
                showError(t('Could not reach the server. Please check your connection and try again.'));
            } else if (error instanceof ApiError) {
                const fromApi: GeneralErrors = {};
                for (const field of GENERAL_FIELDS) {
                    const message = error.fieldError(field);
                    if (message) fromApi[field] = t(message);
                }
                if (GENERAL_FIELDS.some((field) => fromApi[field])) {
                    setErrors(fromApi);
                    revealFirstError();
                } else showError(t(error.message));
            } else {
                showError(t('This could not be done. Please try again.'));
            }
        } finally {
            setSaving(false);
        }
    };

    const fieldClass = (field: GeneralField, extra?: string): string =>
        cn('field', errors[field] && 'is-invalid', extra);

    const errorOf = (field: GeneralField) =>
        errors[field] && (
            <span className="error" role="alert">
                {errors[field]}
            </span>
        );

    const required = (
        <span className="req" aria-hidden="true">
            *
        </span>
    );

    const photoUrl = profile?.photoVersion ? userPhotoUrl(profile.userId, profile.photoVersion) : null;
    const coverUrl = profile?.coverPhotoVersion ? userCoverPhotoUrl(profile.userId, profile.coverPhotoVersion) : null;

    return (
        <div className="page">
            <div className="ss-stack-lg">
                <div className="nt-tabs pk2-tabs" role="tablist">
                    {(
                        [
                            ['general', 'General Information'],
                            ['photo', 'Profile Photo'],
                            ['cover', 'Cover Photo'],
                        ] as const
                    ).map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={tab === key}
                            className={cn('nt-tab', tab === key && 'is-on')}
                            onClick={() => setTab(key)}
                        >
                            {t(label)}
                        </button>
                    ))}
                </div>
                {profile && values && (
                    <section className="card ep-card">
                        {tab === 'general' && (
                            <form ref={formRef} noValidate onSubmit={(event) => void saveGeneral(event)}>
                                <div className="ep-grid">
                                    <div className={fieldClass('name')}>
                                        <label className="label" htmlFor="ep-name">
                                            {t('Name')}
                                            {required}
                                        </label>
                                        <input
                                            id="ep-name"
                                            className="input"
                                            type="text"
                                            value={values.name}
                                            maxLength={PROFILE_LIMITS.NAME_MAX}
                                            aria-invalid={errors.name ? true : undefined}
                                            onChange={(event) => change('name', event.target.value)}
                                        />
                                        {errorOf('name')}
                                    </div>
                                    <div className={fieldClass('dateOfBirth')}>
                                        <label className="label" htmlFor="ep-dob">
                                            {t('Date of birth')}
                                            {required}
                                        </label>
                                        <input
                                            id="ep-dob"
                                            className="input"
                                            type="date"
                                            value={values.dateOfBirth}
                                            max={todayInIndia()}
                                            aria-invalid={errors.dateOfBirth ? true : undefined}
                                            onChange={(event) => change('dateOfBirth', event.target.value)}
                                        />
                                        {errorOf('dateOfBirth')}
                                    </div>
                                    <div className={fieldClass('gender')}>
                                        <label className="label" htmlFor="ep-gender">
                                            {t('Gender')}
                                            {required}
                                        </label>
                                        <select
                                            id="ep-gender"
                                            className="select"
                                            value={values.gender}
                                            aria-invalid={errors.gender ? true : undefined}
                                            onChange={(event) => change('gender', event.target.value)}
                                        >
                                            <option value="">{t('Select')}</option>
                                            {GENDER_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {t(option.label)}
                                                </option>
                                            ))}
                                        </select>
                                        {errorOf('gender')}
                                    </div>
                                    <span></span>
                                    <div className={fieldClass('bio', 'ep-full')}>
                                        <label className="label" htmlFor="ep-bio">
                                            {t('Bio')}
                                        </label>
                                        <textarea
                                            id="ep-bio"
                                            className="textarea"
                                            rows={3}
                                            value={values.bio}
                                            onChange={(event) => change('bio', event.target.value)}
                                        />
                                        <span className="helper">{t('A few short things about you')}</span>
                                        {errorOf('bio')}
                                    </div>
                                    <div className={fieldClass('about', 'ep-full')}>
                                        <label className="label" htmlFor="ep-about">
                                            {t('About')}
                                        </label>
                                        <textarea
                                            id="ep-about"
                                            className="textarea"
                                            rows={6}
                                            value={values.about}
                                            onChange={(event) => change('about', event.target.value)}
                                        />
                                        <span className="helper">{t('Everything about you, in detail')}</span>
                                        {errorOf('about')}
                                    </div>
                                    {LINK_FIELDS.map(({ field, id, label }) => (
                                        <div key={field} className={fieldClass(field)}>
                                            <label className="label" htmlFor={id}>
                                                {t(label)}
                                            </label>
                                            <input
                                                id={id}
                                                className="input"
                                                type="url"
                                                value={values[field]}
                                                placeholder={t('Link')}
                                                aria-invalid={errors[field] ? true : undefined}
                                                onChange={(event) => change(field, event.target.value)}
                                            />
                                            {errorOf(field)}
                                        </div>
                                    ))}
                                </div>
                                <div className="ep-foot">
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {t('Save')}
                                    </button>
                                </div>
                            </form>
                        )}
                        {tab === 'photo' && <PictureField kind="photo" currentUrl={photoUrl} onSaved={pictureSaved} />}
                        {tab === 'cover' && <PictureField kind="cover" currentUrl={coverUrl} onSaved={pictureSaved} />}
                    </section>
                )}
            </div>
            <SiteToast toast={toast} onClose={hide} />
        </div>
    );
}
