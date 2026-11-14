'use client';

import type { usePackageEditor } from '@/hooks/package-editor/use-package-editor';
import { useT } from '@/hooks/i18n/use-t';
import { packageFileUrl } from '@/services/package-editor.service';
import { type FormOptions, PACKAGE_LIMITS } from '@/types/package.types';

import { CheckList, PackageField } from './package-field';
import { PackageImageField } from './package-image-field';
import {
    FEATURE_OPTIONS,
    nightsText,
    SAFARI_TYPE_OPTIONS,
    STAY_OPTIONS,
    THEME_OPTIONS,
    VEHICLE_OPTIONS,
} from './package-labels';

type Editor = ReturnType<typeof usePackageEditor>;

const toggled = (list: readonly number[], code: number): number[] =>
    list.includes(code) ? list.filter((item) => item !== code) : [...list, code];

function CodeSelect({
    id,
    value,
    options,
    invalid,
    onChange,
}: {
    readonly id: string;
    readonly value: string;
    readonly options: readonly { readonly code: number; readonly label: string }[];
    readonly invalid: boolean;
    readonly onChange: (value: string) => void;
}) {
    const t = useT();
    return (
        <select
            id={id}
            className="select"
            value={value}
            aria-invalid={invalid ? true : undefined}
            onChange={(event) => onChange(event.target.value)}
        >
            <option value="">{t('Choose…')}</option>
            {options.map((option) => (
                <option key={option.code} value={option.code}>
                    {t(option.label)}
                </option>
            ))}
        </select>
    );
}

export function GallerySelect({
    id,
    label,
    value,
    options,
    onChange,
    error,
    helper,
}: {
    readonly id: string;
    readonly label: string;
    readonly value: string;
    readonly options: readonly { readonly id: number; readonly text: string }[];
    readonly onChange: (value: string) => void;
    readonly error?: string | undefined;
    readonly helper?: string;
}) {
    const t = useT();
    return (
        <PackageField id={id} label={label} error={error} {...(helper ? { helper } : {})}>
            <select id={id} className="select" value={value} onChange={(event) => onChange(event.target.value)}>
                <option value="">{t('No gallery')}</option>
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.text}
                    </option>
                ))}
            </select>
        </PackageField>
    );
}

export const galleryChoices = (
    options: FormOptions,
    current: { readonly galleryId: number; readonly title: string | null } | null,
): readonly { readonly id: number; readonly text: string }[] => {
    const offered = options.galleries.map((gallery) => ({
        id: gallery.id,
        text: `${gallery.title} · ${gallery.park.name ?? ''}`,
    }));
    return current && !offered.some((gallery) => gallery.id === current.galleryId)
        ? [...offered, { id: current.galleryId, text: current.title ?? '' }]
        : offered;
};

export function PackageBasicSection({
    editor,
    options,
}: {
    readonly editor: Editor;
    readonly options: FormOptions;
}) {
    const t = useT();
    const { basic, basicErrors: errors, changeBasic, view } = editor;
    const version = view?.version;
    const packageId = view?.package.id ?? 0;
    const parkChoices = [
        ...options.parks.map((park) => ({ code: park.id, label: park.name })),
        ...(version?.parks ?? [])
            .filter((park) => !options.parks.some((offered) => offered.id === park.id))
            .map((park) => ({ code: park.id, label: park.name ?? '' })),
    ];
    const days = Number(basic.dayCount);
    const nights = Number.isInteger(days) && days >= 1 ? nightsText(days) : '';
    const safaris = Number(basic.safariCount);
    const defaultActivity =
        basic.safariCount && basic.safariType
            ? `${basic.safariCount} ${t(SAFARI_TYPE_OPTIONS.find((option) => String(option.code) === basic.safariType)?.label ?? '')} ${
                  safaris === 1 ? t('Safari') : t('Safaris')
              }`
            : t('e.g. 3 Shared Safaris');
    const text = (field: keyof typeof basic) => (value: string) => {
        editor.setBasicError(field, null);
        changeBasic({ [field]: value });
    };
    const imageUrl = (name: string | null | undefined) =>
        name && version ? packageFileUrl(packageId, version.id, name) : null;
    const inputOf = (id: string, field: keyof typeof basic, extra: Record<string, unknown> = {}) => (
        <input
            id={id}
            className="input"
            value={String(basic[field])}
            aria-invalid={errors[field] ? true : undefined}
            onChange={(event) => text(field)(event.target.value)}
            {...extra}
        />
    );

    return (
        <>
            <PackageField id="e-name" label={t('Package name')} required error={errors['name']}>
                {inputOf('e-name', 'name', { type: 'text', maxLength: PACKAGE_LIMITS.NAME_MAX })}
            </PackageField>
            <PackageField
                id="e-parks"
                label={t('Parks')}
                required
                error={errors['masterParkIds']}
                helper={t('Your own active parks. The first one is the main park.')}
            >
                <CheckList
                    options={parkChoices}
                    selected={basic.masterParkIds}
                    onToggle={(code) => {
                        editor.setBasicError('masterParkIds', null);
                        changeBasic({ masterParkIds: toggled(basic.masterParkIds, code) });
                    }}
                />
            </PackageField>
            <div className="pq-4">
                <PackageField id="e-days" label={t('Days')} required error={errors['dayCount']}>
                    {inputOf('e-days', 'dayCount', { type: 'number', min: 1, max: 15, inputMode: 'numeric' })}
                </PackageField>
                <div className="field">
                    <span className="label">{t('Nights')}</span>
                    <input className="input" value={nights ? t(nights) : ''} readOnly aria-label={t('Nights, set from days')} />
                </div>
                <PackageField id="e-safaris" label={t('Number of safaris')} required error={errors['safariCount']}>
                    {inputOf('e-safaris', 'safariCount', { type: 'number', min: 1, max: 99, inputMode: 'numeric' })}
                </PackageField>
                <span></span>
            </div>
            <div className="pq-4">
                <PackageField id="e-type" label={t('Safari type')} required error={errors['safariType']}>
                    <CodeSelect
                        id="e-type"
                        value={basic.safariType}
                        options={SAFARI_TYPE_OPTIONS}
                        invalid={!!errors['safariType']}
                        onChange={text('safariType')}
                    />
                </PackageField>
                <PackageField id="e-vehicle" label={t('Vehicle')} required error={errors['vehicle']}>
                    <CodeSelect
                        id="e-vehicle"
                        value={basic.vehicle}
                        options={VEHICLE_OPTIONS}
                        invalid={!!errors['vehicle']}
                        onChange={text('vehicle')}
                    />
                </PackageField>
                <PackageField id="e-theme" label={t('Theme')} required error={errors['theme']}>
                    <CodeSelect
                        id="e-theme"
                        value={basic.theme}
                        options={THEME_OPTIONS}
                        invalid={!!errors['theme']}
                        onChange={text('theme')}
                    />
                </PackageField>
                <PackageField id="e-stay" label={t('Stay')} required error={errors['stay']}>
                    <CodeSelect
                        id="e-stay"
                        value={basic.stay}
                        options={STAY_OPTIONS}
                        invalid={!!errors['stay']}
                        onChange={text('stay')}
                    />
                </PackageField>
            </div>
            <PackageField id="e-features" label={t('Features')} error={errors['features']}>
                <CheckList
                    options={FEATURE_OPTIONS.map((option) => ({ code: option.code, label: t(option.label) }))}
                    selected={basic.features}
                    onToggle={(code) => changeBasic({ features: toggled(basic.features, code) })}
                />
            </PackageField>
            <div className="pq-2">
                <PackageField id="e-start" label={t('Start place')} error={errors['startPlace']}>
                    {inputOf('e-start', 'startPlace', { type: 'text', maxLength: PACKAGE_LIMITS.PLACE_MAX })}
                </PackageField>
                <PackageField id="e-end" label={t('End place')} error={errors['endPlace']}>
                    {inputOf('e-end', 'endPlace', { type: 'text', maxLength: PACKAGE_LIMITS.PLACE_MAX })}
                </PackageField>
            </div>
            <div className="pq-3">
                <PackageField id="e-ppp" label={t('Price per person (₹)')} required error={errors['pricePerPerson']}>
                    {inputOf('e-ppp', 'pricePerPerson', { type: 'text', inputMode: 'numeric' })}
                </PackageField>
                <PackageField id="e-total" label={t('Total price (₹)')} required error={errors['totalPrice']}>
                    {inputOf('e-total', 'totalPrice', { type: 'text', inputMode: 'numeric' })}
                </PackageField>
                <PackageField
                    id="e-before"
                    label={t('Price before discount (₹)')}
                    error={errors['priceBeforeDiscount']}
                >
                    {inputOf('e-before', 'priceBeforeDiscount', { type: 'text', inputMode: 'numeric' })}
                </PackageField>
            </div>
            <div className="pq-2">
                <PackageField
                    id="e-actMsg"
                    label={t('Activity message')}
                    error={errors['activityMessage']}
                    helper={t('Replaces the standard line')}
                >
                    {inputOf('e-actMsg', 'activityMessage', {
                        type: 'text',
                        maxLength: PACKAGE_LIMITS.MESSAGE_MAX,
                        placeholder: defaultActivity,
                    })}
                </PackageField>
                <PackageField id="e-priceMsg" label={t('Price message')} error={errors['priceMessage']}>
                    {inputOf('e-priceMsg', 'priceMessage', {
                        type: 'text',
                        maxLength: PACKAGE_LIMITS.MESSAGE_MAX,
                        placeholder: t('Include taxes and fees'),
                    })}
                </PackageField>
            </div>
            <PackageField id="e-tagText" label={t('Tag')} error={errors['tagText']}>
                <div className="ss-stack">
                    {inputOf('e-tagText', 'tagText', { maxLength: PACKAGE_LIMITS.MESSAGE_MAX })}
                    <div className="pq-colors">
                        <label>
                            {t('Background')}{' '}
                            <input
                                type="color"
                                value={basic.tagBackgroundColor}
                                onChange={(event) => changeBasic({ tagBackgroundColor: event.target.value })}
                            />
                        </label>
                        <label>
                            {t('Text')}{' '}
                            <input
                                type="color"
                                value={basic.tagTextColor}
                                onChange={(event) => changeBasic({ tagTextColor: event.target.value })}
                            />
                        </label>
                        {basic.tagText.trim() && (
                            <span
                                className="pq-tagprev"
                                style={{ background: basic.tagBackgroundColor, color: basic.tagTextColor }}
                            >
                                {basic.tagText}
                            </span>
                        )}
                    </div>
                </div>
            </PackageField>
            <div className="pq-2">
                <PackageField
                    id="e-img"
                    label={t('Package image')}
                    error={errors['packageImage']}
                    helper={t("JPG, JPEG or PNG, up to 250 KB. Without one, the main park's image is used.")}
                >
                    <PackageImageField
                        id="e-img"
                        label={t('Package image')}
                        savedUrl={imageUrl(version?.packageImage)}
                        image={basic.packageImage}
                        maxBytes={PACKAGE_LIMITS.IMAGE_MAX_BYTES}
                        onChange={(image) => changeBasic({ packageImage: image })}
                        onProblem={(message) => editor.setBasicError('packageImage', message)}
                    />
                </PackageField>
                <PackageField
                    id="e-banner"
                    label={t('Banner image')}
                    error={errors['bannerImage']}
                    helper={t('JPG, JPEG or PNG, up to 250 KB')}
                >
                    <PackageImageField
                        id="e-banner"
                        label={t('Banner image')}
                        savedUrl={imageUrl(version?.bannerImage)}
                        image={basic.bannerImage}
                        maxBytes={PACKAGE_LIMITS.IMAGE_MAX_BYTES}
                        onChange={(image) => changeBasic({ bannerImage: image })}
                        onProblem={(message) => editor.setBasicError('bannerImage', message)}
                    />
                </PackageField>
            </div>
            <GallerySelect
                id="e-gallery"
                label={t('Gallery')}
                value={basic.galleryId}
                options={galleryChoices(options, version?.gallery ?? null)}
                onChange={text('galleryId')}
                error={errors['galleryId']}
                helper={t('One of your approved galleries')}
            />
            <PackageField
                id="e-overview"
                label={t('Overview')}
                error={errors['overview']}
                helper={t('Up to 2,000 characters')}
            >
                <textarea
                    id="e-overview"
                    className="textarea"
                    rows={5}
                    maxLength={PACKAGE_LIMITS.OVERVIEW_MAX}
                    value={basic.overview}
                    aria-invalid={errors['overview'] ? true : undefined}
                    onChange={(event) => text('overview')(event.target.value)}
                />
            </PackageField>
        </>
    );
}
